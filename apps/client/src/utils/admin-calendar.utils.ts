// client\src\utils\admin-calendar.utils.ts
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

// Transform appointment to calendar event (for admin view)
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
    title: `${appointment.patient.user.names} - Dr. ${appointment.doctor.user.names}`,
    description: `Type: ${appointment.type}\nReason: ${appointment.reason}${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ""}`,
    start: startDateTime,
    end: endDateTime,
    allDay: false,
    color: getAppointmentStatusColor(appointment.status),
    location: `Dr. ${appointment.doctor.user.names}`,
    // Store original appointment data for editing
    metadata: {
      appointmentId: appointment._id,
      patientId: appointment.patient._id,
      doctorId: appointment.doctor._id,
      status: appointment.status,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes,
    },
  }
}

// Transform calendar event back to appointment data
export const calendarEventToAppointment = (event: CalendarEvent) => {
  const startDate = new Date(event.start)
  const endDate = new Date(event.end)

  return {
    patientId: event.metadata?.patientId || "",
    doctorId: event.metadata?.doctorId || "",
    date: format(startDate, "yyyy-MM-dd"),
    startTime: format(startDate, "HH:mm"),
    endTime: format(endDate, "HH:mm"),
    type: event.metadata?.type || "consultation",
    reason: event.metadata?.reason || "Appointment",
    notes: event.metadata?.notes || "",
    status: event.metadata?.status || "scheduled",
  }
}

// Create doctor filter options
export const createDoctorFilterOptions = (doctors: Doctor[]) => {
  return doctors.map((doctor, index) => ({
    id: doctor._id,
    name: `Dr. ${doctor.user.names}`,
    color: (["blue", "emerald", "violet", "orange", "rose"] as EventColor[])[index % 5],
    isActive: true,
    specialization: doctor.specialization.join(", "),
    experience: doctor.experience,
  }))
}
