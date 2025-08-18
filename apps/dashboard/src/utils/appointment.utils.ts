/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Appointment, AppointmentFormData } from "../types/appointment.types"
import { getPatientFullName } from "./patient.utils"
import { getDoctorFullName } from "./doctor.utils"
import { formatDate } from "./format-utils"

/**
 * Formats an appointment for display
 */
export const formatAppointment = (appointment: Appointment): any => {
  const patientName =
    typeof appointment.patient === "object" && appointment.patient
      ? getPatientFullName(appointment.patient)
      : "No Patient"
  const doctorName = typeof appointment.doctor === "object" ? getDoctorFullName(appointment.doctor) : "Unknown Doctor"

  return {
    ...appointment,
    patientName,
    doctorName,
    formattedDate: formatDate(appointment.date),
    formattedTime: `${appointment.startTime} - ${appointment.endTime}`,
  }
}

/**
 * Converts an appointment object to form data for editing
 */
export const appointmentToFormData = (appointment: Appointment): AppointmentFormData => {
  return {
    patientId:
      typeof appointment.patient === "object" && appointment.patient
        ? appointment.patient.id || appointment.patient._id?.toString() || ""
        : appointment.patient?.toString() || "",
    doctorId:
      typeof appointment.doctor === "object"
        ? appointment.doctor.id || appointment.doctor._id?.toString() || ""
        : appointment.doctor?.toString() || "",
    date: appointment.date ? new Date(appointment.date).toISOString().split("T")[0] : "",
    startTime: appointment.startTime || "",
    endTime: appointment.endTime || "",
    type: appointment.type ,
    notes: appointment.notes || "",
    reason: appointment.reason || "",
  }
}

/**
 * Formats form data for API submission
 */
export const formatAppointmentFormData = (formData: AppointmentFormData): any => {
  return {
    patient: formData.patientId,
    doctor: formData.doctorId,
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
    type: formData.type,
    notes: formData.notes,
    reason: formData.reason,
  }
}


// export const formatAppointmentFormData = (data: Partial<AppointmentFormData>): any => {
//   return {
//     patient: data.patientId,
//     doctor: data.doctorId,
//     date: data.date,
//     startTime: data.startTime,
//     endTime: data.endTime,
//     type: data.type || "consultation",
//     reason: data.reason || "",
//     notes: data.notes || "",
//     status: data.status || "scheduled",
//   }
// }

export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

export const formatTimeForAPI = (date: Date): string => {
  return date.toTimeString().split(" ")[0].substring(0, 5)
}

/**
 * Gets the color for an appointment status
 */
export const getStatusColor = (status: Appointment["status"]): string => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-indigo-100 text-indigo-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "no-show":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Gets the label for an appointment status
 */
export const getStatusLabel = (status: Appointment["status"]): string => {
  switch (status) {
    case "scheduled":
      return "Scheduled"
    case "confirmed":
      return "Confirmed"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    case "no-show":
      return "No Show"
    default:
      return "Unknown"
  }
}

/**
 * Gets the color for an appointment type
 */
export const getTypeColor = (type: Appointment["type"]): string => {
  switch (type) {
    case "consultation":
      return "bg-purple-100 text-purple-800"
    case "checkup":
      return "bg-blue-100 text-blue-800"
    case "treatment":
      return "bg-green-100 text-green-800"
    case "follow-up":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Gets the label for an appointment type
 */
export const getTypeLabel = (type: Appointment["type"]): string => {
  switch (type) {
    case "consultation":
      return "Consultation"
    case "checkup":
      return "Check-up"
    case "treatment":
      return "Treatment"
    case "follow-up":
      return "Follow-up"
    default:
      return "Unknown"
  }
}

/**
 * Checks if an appointment is upcoming
 */
export const isUpcomingAppointment = (appointment: Appointment): boolean => {
  const appointmentDate = new Date(appointment.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return appointmentDate >= today && appointment.status !== "cancelled" && appointment.status !== "completed"
}

/**
 * Checks if an appointment is today
 */
export const isAppointmentToday = (appointment: Appointment): boolean => {
  const appointmentDate = new Date(appointment.date)
  const today = new Date()
  return (
    appointmentDate.getDate() === today.getDate() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getFullYear() === today.getFullYear()
  )
}



/**
 * Generates time slots for a day
 */
export const generateTimeSlots = (
  startHour = 8,
  endHour = 17,
  intervalMinutes = 30,
): { value: string; label: string }[] => {
  const slots = []
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) continue
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      const time = `${formattedHour}:${formattedMinute}`
      slots.push({
        value: time,
        label: formatTime(time),
      })
    }
  }
  return slots
}

/**
 * Calculates the duration of an appointment in minutes
 */
export const calculateAppointmentDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [endHour, endMinute] = endTime.split(":").map(Number)

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  return endMinutes - startMinutes
}



export const validateAppointmentData = (data: AppointmentFormData): string[] => {
  const errors: string[] = []

  if (!data.patientId) {
    errors.push("Patient is required")
  }

  if (!data.doctorId) {
    errors.push("Doctor is required")
  }

  if (!data.date) {
    errors.push("Date is required")
  }

  if (!data.startTime) {
    errors.push("Start time is required")
  }

  if (!data.endTime) {
    errors.push("End time is required")
  }

  if (!data.reason) {
    errors.push("Reason for visit is required")
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push("Invalid start time format")
  }

  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push("Invalid end time format")
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (data.date && !dateRegex.test(data.date)) {
    errors.push("Invalid date format")
  }

  return errors
}