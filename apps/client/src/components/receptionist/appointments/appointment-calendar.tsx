"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"

import { EventCalendar, type CalendarEvent } from "@/components/appointment-calendar/patient"
import { CalendarProvider } from "@/components/appointment-calendar/patient/calendar-context"
import PatientService from "@/services/patient.service"
import DoctorService from "@/services/doctor.service"
import {
  appointmentToCalendarEvent,
  calendarEventToAppointment,
  createDoctorFilterOptions,
} from "@/utils/admin-calendar.utils"
import { useAuthStore } from "@/store/auth-store"
import type { Patient } from "@/types/patient.types"
import type { Doctor } from "@/types/doctor.types"
import AppointmentService from "@/services/appointment.service"
import type { Appointment } from "@/types/appointment.types"

export function ReceptionistAppointmentCalendar() {
  const { user } = useAuthStore()

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [visibleDoctorIds, setVisibleDoctorIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load patients, doctors, and appointments on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)

        // Load all data in parallel
        const [patientsData, doctorsData, appointmentsResponse] = await Promise.all([
          PatientService.getAllPatients({ limit: 1000 }),
          DoctorService.getAllDoctors({ limit: 1000 }),
          AppointmentService.getAllAppointments({ limit: 1000 }),
        ])

        setPatients(patientsData)
        setDoctors(doctorsData)
        setVisibleDoctorIds(doctorsData.map((d) => d._id))
        setAppointments(appointmentsResponse.appointments)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load calendar data")
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  console.log("Receptionist Data:", user)
  console.log("Patients:", patients)
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

      if (event.id) {
        // Update existing appointment
        const updatedAppointment = await AppointmentService.updateAppointment(event.id, appointmentData)
        const updatedAppointments = appointments.map((apt) => (apt._id === event.id ? updatedAppointment : apt))
        setAppointments(updatedAppointments)
        toast.success("Appointment updated successfully")
      } else {
        // Create new appointment
        const newAppointment = await AppointmentService.createAppointment(appointmentData)
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
      await AppointmentService.cancelAppointment(eventId, "Cancelled by receptionist")
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
      const updated = await AppointmentService.updateAppointment(updatedEvent.id, appointmentData)
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
          id: doctor.id,
          name: doctor.name,
          color: doctor.color,
          isActive: isDoctorVisible(doctor.id),
        }))}
        isColorVisible={(doctorId: string) => isDoctorVisible(doctorId)}
        toggleColorVisibility={toggleDoctorVisibility}
        doctors={doctors}
        patients={patients}
        isDentalMode={true}
        isReceptionistView={true}
        currentUser={user}
      />
    </CalendarProvider>
  )
}
