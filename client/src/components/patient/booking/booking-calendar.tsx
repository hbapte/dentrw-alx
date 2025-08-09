// client\src\components\patient-booking\patient-booking-calendar.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { EventCalendar, type CalendarEvent } from "@/components/appointment-calendar/patient"
import { CalendarProvider } from "@/components/appointment-calendar/patient/calendar-context"
import DoctorService from "@/services/doctor.service"

import {
  appointmentToCalendarEvent,
  calendarEventToAppointment,
  createDoctorFilterOptions,
} from "@/utils/dental-calendar.utils"
import { useAuthStore } from "@/store/auth-store"
import type { Doctor } from "@/types/doctor.types"
import AppointmentService from "@/services/appointment.service"
import type { Appointment } from "@/types/appointment.types"

export function PatientBookingCalendarComponent() {
  const { user } = useAuthStore()
  const patientId = user?.patientId || ""

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [visibleDoctorIds, setVisibleDoctorIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load doctors and appointments on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadDoctorsAndAppointments = async () => {
      try {
        setLoading(true)
        // Load doctors
        const doctorsData = await DoctorService.getAllDoctors({ limit: 100 })
        setDoctors(doctorsData)
        setVisibleDoctorIds(doctorsData.map((d) => d._id))

        // Load appointments for the patient
        const appointmentsData = await AppointmentService.getPatientAppointments(patientId)
        setAppointments(appointmentsData)
      } catch (error) {
        console.error("Failed to load doctors or appointments:", error)
        toast.error("Failed to load calendar data")
      } finally {
        setLoading(false)
      }
    }

    loadDoctorsAndAppointments()
  }, [patientId, user?.id])

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your appointments</p>
        </div>
      </div>
    )
  }

  console.log("Patient ID:", patientId)
  console.log("Patient Data:", user)
  console.log("Doctors:", doctors)
  console.log("Appointments:", appointments)

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

  const handleEventSave = async (event: CalendarEvent) => {
    try {
      const appointmentData = calendarEventToAppointment(event)

      // Add patient ID to the appointment data
      const appointmentWithPatient = {
        ...appointmentData,
        patientId: patientId,
      }

      if (event.id) {
        // Update existing appointment
        const updatedAppointment = await AppointmentService.updateAppointment(event.id, appointmentWithPatient)

        const updatedAppointments = appointments.map((apt) => (apt._id === event.id ? updatedAppointment : apt))
        setAppointments(updatedAppointments)

        toast.success("Appointment updated successfully")
      } else {
        // Create new appointment
        const newAppointment = await AppointmentService.createAppointment(appointmentWithPatient)

        setAppointments((prev) => [...prev, newAppointment])

        toast.success("Appointment scheduled successfully")
      }
    } catch (error) {
      console.error("Failed to save appointment:", error)
      toast.error("Failed to save appointment")
    }
  }

  const handleEventDelete = async (eventId: string) => {
    try {
      await AppointmentService.cancelAppointment(eventId, "Cancelled by patient")

      const updatedAppointments = appointments.map((apt) =>
        apt._id === eventId ? { ...apt, status: "cancelled" as const } : apt,
      )
      setAppointments(updatedAppointments)

      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      toast.error("Failed to cancel appointment")
    }
  }

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      const appointmentData = calendarEventToAppointment(updatedEvent)
      const appointmentWithPatient = {
        ...appointmentData,
        patientId: patientId,
      }

      const updated = await AppointmentService.updateAppointment(updatedEvent.id, appointmentWithPatient)

      const updatedAppointments = appointments.map((apt) => (apt._id === updatedEvent.id ? updated : apt))
      setAppointments(updatedAppointments)

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
    <CalendarProvider>
      <EventCalendar
        events={calendarEvents}
        onEventAdd={handleEventSave}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="week"
        etiquettes={doctorFilterOptions.map((doctor) => ({
          id: doctor.id || "",
          name: doctor.name,
          color: doctor.color,
          isActive: isDoctorVisible(doctor.id || ""),
        }))}
        isColorVisible={(doctorId: string) => isDoctorVisible(doctorId)}
        toggleColorVisibility={toggleDoctorVisibility}
        doctors={doctors}
        patients={[]}
        // isDentalMode={true}
        // isPatientView={true}
        currentUser={user}
      />
    </CalendarProvider>
  )
}
