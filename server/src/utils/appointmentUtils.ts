import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns"

/**
 * Format an appointment for display
 */
export const formatAppointment = (appointment: any) => {
  // Format dates and times
  const date = appointment.date ? format(new Date(appointment.date), "MMMM dd, yyyy") : "N/A"

  // Format patient and doctor names
  const patientName = appointment.patient?.names || "Unknown Patient"
  const doctorName = appointment.doctor?.user?.names || "Unknown Doctor"

  // Format status with proper capitalization
  const status = appointment.status
    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
    : "Unknown"

  return {
    ...appointment,
    formattedDate: date,
    patientName,
    doctorName,
    formattedStatus: status,
  }
}

/**
 * Check if two time slots overlap
 */
export const doTimeSlotsOverlap = (
  startTime1: string,
  endTime1: string,
  startTime2: string,
  endTime2: string,
): boolean => {
  // Create date objects for comparison (using arbitrary date)
  const baseDate = "2000-01-01"
  const start1 = parseISO(`${baseDate}T${startTime1}`)
  const end1 = parseISO(`${baseDate}T${endTime1}`)
  const start2 = parseISO(`${baseDate}T${startTime2}`)
  const end2 = parseISO(`${baseDate}T${endTime2}`)

  // Check for overlap
  return (
    ((isAfter(start1, start2) || isEqual(start1, start2)) && isBefore(start1, end2)) ||
    ((isAfter(start2, start1) || isEqual(start2, start1)) && isBefore(start2, end1))
  )
}

/**
 * Calculate appointment duration in minutes
 */
export const calculateAppointmentDuration = (startTime: string, endTime: string): number => {
  const baseDate = "2000-01-01"
  const start = parseISO(`${baseDate}T${startTime}`)
  const end = parseISO(`${baseDate}T${endTime}`)

  // Return duration in minutes
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

/**
 * Group appointments by date
 */
export const groupAppointmentsByDate = (appointments: any[]): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {}

  appointments.forEach((appointment) => {
    if (!appointment.date) return

    const dateKey = format(new Date(appointment.date), "yyyy-MM-dd")

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }

    grouped[dateKey].push(appointment)
  })

  // Sort appointments within each date by start time
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      if (a.startTime < b.startTime) return -1
      if (a.startTime > b.startTime) return 1
      return 0
    })
  })

  return grouped
}

/**
 * Get appointment status color
 */
export const getAppointmentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return "#3498db" // Blue
    case "confirmed":
      return "#2ecc71" // Green
    case "completed":
      return "#27ae60" // Dark Green
    case "cancelled":
      return "#e74c3c" // Red
    case "no-show":
      return "#f39c12" // Orange
    default:
      return "#95a5a6" // Gray
  }
}

/**
 * Check if an appointment can be cancelled
 */
export const canCancelAppointment = (appointment: any): boolean => {
  if (!appointment) return false

  // Cannot cancel completed or already cancelled appointments
  if (["completed", "cancelled", "no-show"].includes(appointment.status)) {
    return false
  }

  // Check if appointment is in the past
  const appointmentDate = new Date(appointment.date)
  appointmentDate.setHours(
    Number.parseInt(appointment.startTime.split(":")[0]),
    Number.parseInt(appointment.startTime.split(":")[1]),
  )

  return isAfter(appointmentDate, new Date())
}

