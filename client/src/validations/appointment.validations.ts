import { z } from "zod"

/**
 * Validation schema for appointment form data
 */
export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  type: z.enum(["consultation", "checkup", "treatment", "follow-up"], {
    required_error: "Appointment type is required",
  }),
  notes: z.string().optional(),
  reason: z.string().min(1, "Reason for appointment is required"),
})

/**
 * Validation schema for checking doctor availability
 */
export const availabilityCheckSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
})

/**
 * Validation schema for cancelling an appointment
 */
export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
})

/**
 * Validation schema for changing appointment status
 */
export const changeStatusSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no-show"], {
    required_error: "Status is required",
  }),
})

/**
 * Validation schema for adding a reminder
 */
export const reminderSchema = z.object({
  type: z.enum(["email", "sms"], {
    required_error: "Reminder type is required",
  }),
})

export type AppointmentFormSchema = z.infer<typeof appointmentSchema>
export type AvailabilityCheckSchema = z.infer<typeof availabilityCheckSchema>
export type CancelAppointmentSchema = z.infer<typeof cancelAppointmentSchema>
export type ChangeStatusSchema = z.infer<typeof changeStatusSchema>
export type ReminderSchema = z.infer<typeof reminderSchema>
