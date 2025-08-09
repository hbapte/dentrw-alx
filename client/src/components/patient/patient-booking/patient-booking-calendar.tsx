"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { EventCalendar, type CalendarEvent } from "@/components/appointment-calendar/patient"
import { CalendarProvider } from "@/components/appointment-calendar/patient/calendar-context"
import DoctorService from "@/services/doctor.service"
import { useAuthStore } from "@/store/auth-store"
import type { Doctor } from "@/types/doctor.types"
import AppointmentService from "@/services/appointment.service"
import type { Appointment } from "@/types/appointment.types"
import { format } from "date-fns"

// Convert appointment to calendar event
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
    title: `${appointment.type} - Dr. ${appointment.doctor.user.names}`,
    description: `${appointment.reason}${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ""}`,
    start: startDateTime,
    end: endDateTime,
    allDay: false,
    color: getStatusColor(appointment.status),
    appointmentId: appointment._id,
    patientId: appointment.patient._id,
    doctorId: appointment.doctor._id,
    patientName: appointment.patient.user.names,
    doctorName: appointment.doctor.user.names,
    type: appointment.type,
    status: appointment.status,
    reason: appointment.reason,
    notes: appointment.notes,
  }
}

// Convert calendar event to appointment data
const calendarEventToAppointment = (event: CalendarEvent, patientId: string) => {
  const startDate = new Date(event.start)
  const endDate = new Date(event.end)

  return {
    patientId: patientId,
    doctorId: event.doctorId || "",
    date: format(startDate, "yyyy-MM-dd"),
    startTime: format(startDate, "HH:mm"),
    endTime: format(endDate, "HH:mm"),
    type: event.type || "consultation",
    reason: event.reason || "Appointment",
    notes: event.notes || "",
    status: event.status || "scheduled",
  }
}

export function PatientBookingCalendar() {
  const { user } = useAuthStore()
  const patientId = user?.id || ""

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [visibleDoctorIds, setVisibleDoctorIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDoctorsAndAppointments = async () => {
      try {
        setLoading(true)
        const [doctorsData, appointmentsData] = await Promise.all([
          DoctorService.getAllDoctors({ limit: 100 }),
          AppointmentService.getPatientAppointments(patientId),
        ])

        setDoctors(doctorsData)
        setVisibleDoctorIds(doctorsData.map((d) => d._id))
        setAppointments(appointmentsData)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load calendar data")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      loadDoctorsAndAppointments()
    }
  }, [patientId])

  // Create doctor filter options
  const doctorFilterOptions = useMemo(() => {
    return doctors.map((doctor, index) => ({
      id: doctor._id,
      name: `Dr. ${doctor.user.names}`,
      color: (["blue", "emerald", "violet", "orange", "rose"] as const)[index % 5],
      isActive: visibleDoctorIds.includes(doctor._id),
    }))
  }, [doctors, visibleDoctorIds])

  const isDoctorVisible = (doctorId: string) => visibleDoctorIds.includes(doctorId)

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
      const appointmentData = calendarEventToAppointment(event, patientId)

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
      await AppointmentService.cancelAppointment(eventId, "Cancelled by patient")
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
      const appointmentData = calendarEventToAppointment(updatedEvent, patientId)
      const updated = await AppointmentService.updateAppointment(updatedEvent.id, appointmentData)
      setAppointments((prev) => prev.map((apt) => (apt._id === updatedEvent.id ? updated : apt)))
      toast.success("Appointment moved successfully")
    } catch (error) {
      console.error("Failed to update appointment:", error)
      toast.error("Failed to move appointment")
    }
  }

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your appointments</p>
        </div>
      </div>
    )
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
        etiquettes={doctorFilterOptions}
        isColorVisible={(doctorId: string) => isDoctorVisible(doctorId)}
        toggleColorVisibility={toggleDoctorVisibility}
        doctors={doctors}
        userRole="patient"
        currentUser={user}
      />
    </CalendarProvider>
  )
}
