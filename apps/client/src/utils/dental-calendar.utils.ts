// client\src\utils\dental-calendar.utils.ts
import { format } from "date-fns"
import type { CalendarEvent, EventColor } from "@/components/appointment-calendar/event-calendar"
import type { Appointment } from "@/types/appointment.types"
import type { Doctor } from "@/types/doctor.types"

// Map appointment status to colors
export const getAppointmentStatusColor = (status: Appointment["status"]): EventColor => {
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

// Map appointment type to colors (alternative mapping)
export const getAppointmentTypeColor = (type: Appointment["type"]): EventColor => {
  switch (type) {
    case "consultation":
      return "blue"
    case "checkup":
      return "emerald"
    case "treatment":
      return "violet"
    case "follow-up":
      return "orange"
    default:
      return "blue"
  }
}

// Transform appointment to calendar event
export const appointmentToCalendarEvent = (appointment: Appointment): CalendarEvent => {
  const appointmentDate = new Date(appointment.date)

  // Parse time strings (assuming format like "09:00")
  const [startHour, startMinute] = appointment.startTime.split(":").map(Number)
  const [endHour, endMinute] = appointment.endTime.split(":").map(Number)

  const startDateTime = new Date(appointmentDate)
  startDateTime.setHours(startHour, startMinute, 0, 0)

  const endDateTime = new Date(appointmentDate)
  endDateTime.setHours(endHour, endMinute, 0, 0)

  return {
    id: appointment._id,
    title: `${appointment.type} - ${appointment.doctor.user.names}`,
    description: `${appointment.reason}${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ""}`,
    start: startDateTime,
    end: endDateTime,
    allDay: false,
    color: getAppointmentStatusColor(appointment.status),
    location: `${appointment.doctor.user.names}`,
    // Store original appointment data for editing
    metadata: {
      appointmentId: appointment._id,
      patientId: appointment.patient._id || "",
      doctorId: appointment.doctor._id || "",
      status: appointment.status || "",
      type: appointment.type || "",
      reason: appointment.reason || "",
      notes: appointment.notes || "",
    },
  }
}

// Transform calendar event back to appointment data
export const calendarEventToAppointment = (event: CalendarEvent) => {
  const startDate = new Date(event.start)
  const endDate = new Date(event.end)

  return {
    patientId: event?.patientId || "",
    doctorId: event?.doctorId || "",
    date: format(startDate, "yyyy-MM-dd"),
    startTime: format(startDate, "HH:mm"),
    endTime: format(endDate, "HH:mm"),
    type: event?.type || "consultation",
    reason: event?.reason || "Appointment",
    notes: event?.notes || "",
    status: event?.status || "scheduled",
  }
}

// Create doctor filter options
export const createDoctorFilterOptions = (doctors: Doctor[]) => {
  return doctors.map((doctor, index) => ({
    id: doctor._id,
    name: `${doctor.user.names}`,
    color: (["blue", "emerald", "violet", "orange", "rose"] as EventColor[])[index % 5],
    isActive: true,
    specialization: doctor.specialization.join(", "),
  }))
}
