"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { EventCalendar, type CalendarEvent } from "@/components/appointment-calendar/doctor"
import { CalendarProvider } from "@/components/appointment-calendar/doctor/calendar-context"
import PatientService from "@/services/patient.service"
import { useAuthStore } from "@/store/auth-store"
import type { Patient } from "@/types/patient.types"
import AppointmentService from "@/services/appointment.service"
import type { Appointment } from "@/types/appointment.types"
import { format } from "date-fns"

// Convert appointment to calendar event (doctor view)
const appointmentToCalendarEvent = (appointment: Appointment): CalendarEvent => {
  const appointmentDate = new Date(appointment.date)
  const [startHour, startMinute] = appointment.startTime.split(":").map(Number)
  const [endHour, endMinute] = appointment.endTime.split(":").map(Number)

  const startDateTime = new Date(appointmentDate)
  startDateTime.setHours(startHour, startMinute, 0, 0)

  const endDateTime = new Date(appointmentDate)
  endDateTime.setHours(endHour, endMinute, 0, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "blue"
      case "confirmed":
        return "emerald"
      case "completed":
        return "violet"
      case "cancelled":
        return "rose"
      case "no-show":
        return "orange"
      default:
        return "blue"
    }
  }

  return {
    id: appointment._id,
    title: `${appointment.patient.user.names} - ${appointment.type}`,
    description: `${appointment.reason}${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ""}`,
    start: startDateTime,
    end: endDateTime,
    allDay: false,
    color: getStatusColor(appointment.status),
    appointmentId: appointment._id,
    patientId: appointment.patient?._id,
    doctorId: appointment.doctor?._id,
    patientName: appointment.patient?.user?.names,
    doctorName: appointment.doctor?.user?.names,
    type: appointment.type,
    status: appointment.status,
    reason: appointment.reason,
    notes: appointment.notes,
  }
}

// Convert calendar event to appointment data
const calendarEventToAppointment = (event: CalendarEvent, doctorId: string) => {
  const startDate = new Date(event.start)
  const endDate = new Date(event.end)

  return {
    patientId: event.patientId || "",
    doctorId: doctorId,
    date: format(startDate, "yyyy-MM-dd"),
    startTime: format(startDate, "HH:mm"),
    endTime: format(endDate, "HH:mm"),
    type: event.type || "consultation",
    reason: event.reason || "Appointment",
    notes: event.notes || "",
    status: event.status || "scheduled",
  }
}

export function DoctorAppointmentCalendarComponent() {
  const { user } = useAuthStore()
  const doctorId = user?.doctorId || ""

  console.log("Doctor ID:", doctorId)

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [visiblePatientIds, setVisiblePatientIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPatientsAndAppointments = async () => {
      try {
        setLoading(true)
        const [patientsData, appointmentsResponse] = await Promise.all([
          PatientService.getAllPatients({ limit: 100 }),
          AppointmentService.getAppointmentsByDoctorId(doctorId, { limit: 1000 }),
        ])

        setPatients(patientsData.patients)
        setVisiblePatientIds(patientsData.patients.map((p) => p._id))
        setAppointments(appointmentsResponse.appointments)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load calendar data")
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      loadPatientsAndAppointments()
    }
  }, [doctorId])

  console.log("Patients:", patients)
  console.log("Appointments:", appointments)
  console.log("Visible Patient IDs:", visiblePatientIds)

  // Create patient filter options
  const patientFilterOptions = useMemo(() => {
    return patients.map((patient, index) => ({
      id: patient._id,
      name: patient.user?.names,
      color: (["blue", "emerald", "violet", "orange", "rose"] as const)[index % 5],
      isActive: visiblePatientIds.includes(patient._id),
    }))
  }, [patients, visiblePatientIds])

  const isPatientVisible = (patientId: string) => visiblePatientIds.includes(patientId)

  const togglePatientVisibility = (patientId: string) => {
    setVisiblePatientIds((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId],
    )
  }

  // Convert appointments to calendar events and filter by visible patients
  const calendarEvents = useMemo(() => {
    return appointments
      .filter((appointment) => isPatientVisible(appointment.patient?._id))
      .map(appointmentToCalendarEvent)
  }, [appointments, visiblePatientIds])

  const handleEventSave = async (event: CalendarEvent) => {
    try {
      const appointmentData = calendarEventToAppointment(event, doctorId)

      if (event.id) {
        const updatedAppointment = await AppointmentService.updateAppointment(event.id, appointmentData)
        setAppointments((prev) => prev.map((apt) => (apt._id === event.id ? updatedAppointment : apt)))
        toast.success("Appointment updated successfully")
      } else {
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
      await AppointmentService.cancelAppointment(eventId, "Cancelled by doctor")
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
      const appointmentData = calendarEventToAppointment(updatedEvent, doctorId)
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
    <CalendarProvider>
      <EventCalendar
        events={calendarEvents}
        onEventAdd={handleEventSave}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="month"
        etiquettes={patientFilterOptions}
        isColorVisible={(patientId: string) => isPatientVisible(patientId)}
        toggleColorVisibility={togglePatientVisibility}
        patients={patients}
        userRole="doctor"
        currentUser={user}
      />
    </CalendarProvider>
  )
}
