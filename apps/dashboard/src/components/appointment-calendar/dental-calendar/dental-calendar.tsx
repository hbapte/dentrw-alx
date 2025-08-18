//client\src\components\dental-calendar\dental-calendar.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"

import { EventCalendar, type CalendarEvent } from "@/components/appointment-calendar/event-calendar"
import DoctorService from "@/services/doctor.service"
import AppointmentService from "@/services/appointment.service"
import type { Doctor, DentalAppointment } from "@/types/dental-appointment.types"
import {
  appointmentToCalendarEvent,
  calendarEventToAppointment,
  createDoctorFilterOptions,
} from "@/utils/dental-calendar.utils"

export function DentalCalendar() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<DentalAppointment[]>([])
  const [visibleDoctorIds, setVisibleDoctorIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load doctors and appointments on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load doctors
        const doctorsData = await DoctorService.getAllDoctors({ limit: 100 })
        setDoctors(doctorsData)
        setVisibleDoctorIds(doctorsData.map((d) => d._id))

        // Load appointments
        const appointmentsResponse = await AppointmentService.getAllAppointments({
          limit: 1000,
          sortBy: "date",
          sortOrder: "asc",
        })
        setAppointments(appointmentsResponse.appointments)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load calendar data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Create doctor filter options
  const doctorFilterOptions = useMemo(() => {
    return createDoctorFilterOptions(doctors)
  }, [doctors])

  // Check if doctor is visible
  const isDoctorVisible = (doctorId: string) => visibleDoctorIds.includes(doctorId)

  // Toggle doctor visibility
  const toggleDoctorVisibility = (doctorId: string) => {
    setVisibleDoctorIds((prev) =>
      prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId],
    )
  }

  // Convert appointments to calendar events and filter by visible doctors
  const calendarEvents = useMemo(() => {
    return appointments.filter((appointment) => isDoctorVisible(appointment.doctor._id)).map(appointmentToCalendarEvent)
  }, [appointments, visibleDoctorIds])

  const handleEventSelect = (event: CalendarEvent) => {
    console.log("Event selected:", event)
    // EventCalendar will handle opening the dialog
  }

  const handleEventCreate = (startTime: Date) => {
    // Handle event creation inside EventCalendar
  }

  const handleEventSave = async (event: CalendarEvent) => {
    try {
      const appointmentData = calendarEventToAppointment(event)

      if (event.id) {
        // Update existing appointment
        const updatedAppointment = await AppointmentService.updateAppointment(event.id, appointmentData)

        setAppointments((prev) => prev.map((apt) => (apt._id === event.id ? updatedAppointment : apt)))

        toast.success(`Appointment updated successfully`)
      } else {
        // Create new appointment
        const newAppointment = await AppointmentService.createAppointment(appointmentData)

        setAppointments((prev) => [...prev, newAppointment])

        toast.success(`Appointment scheduled successfully`)
      }
    } catch (error) {
      console.error("Failed to save appointment:", error)
      toast.error("Failed to save appointment")
    }
  }

  const handleEventDelete = async (eventId: string) => {
    try {
      await AppointmentService.changeAppointmentStatus(eventId, "cancelled")

      setAppointments((prev) =>
        prev.map((apt) => (apt._id === eventId ? { ...apt, status: "cancelled" as const } : apt)),
      )

      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      toast.error("Failed to cancel appointment")
    }
  }

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      const appointmentData = calendarEventToAppointment(updatedEvent)
      const updated = await AppointmentService.updateAppointment(updatedEvent.id, appointmentData)

      setAppointments((prev) => prev.map((apt) => (apt._id === updatedEvent.id ? updated : apt)))

      toast.success("Appointment moved successfully")
    } catch (error) {
      console.error("Failed to update appointment:", error)
      toast.error("Failed to move appointment")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <EventCalendar
      events={calendarEvents}
      onEventAdd={handleEventCreate}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      onEventSelect={handleEventSelect}
      initialView="week"
      etiquettes={doctorFilterOptions.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        color: doctor.color,
        isActive: isDoctorVisible(doctor.id),
      }))}
      isColorVisible={(doctorId: string) => isDoctorVisible(doctorId)}
      toggleColorVisibility={toggleDoctorVisibility}
      doctors={doctors}
      patients={[]} 
      isDentalMode={true}
    />
  )
}
