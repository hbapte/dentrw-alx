import type { Request, Response } from "express"
import httpStatus from "http-status"
import appointmentRepository from "../repositories/appointmentRepository"
import doctorRepository from "../../user/repositories/doctorRepository"
import patientRepository from "../../user/repositories/patientRepository"
import { successResponse, notFoundResponse, badRequestResponse } from "../../../utils/responseHandler"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"
import { sendAppointmentConfirmationEmail } from "../../../services/emailService"
import { sendAppointmentConfirmationSMS } from "../../../services/smsService"

/**
 * Get all appointments with pagination and filtering
 */
export const getAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    sortBy = "date",
    sortOrder = "desc",
    doctorId,
    patientId,
    status,
    type,
    startDate,
    endDate,
  } = req.query

  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    doctorId: doctorId as string,
    patientId: patientId as string,
    status: status as string,
    type: type as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  }

  const result = await appointmentRepository.findAppointments(options)

  return successResponse(res, result, "Appointments retrieved successfully")
})

/**
 * Get appointment by ID
 */
export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const appointment = await appointmentRepository.findById(id)

  if (!appointment) {
    return notFoundResponse(res, "Appointment not found")
  }

  return successResponse(res, { appointment }, "Appointment retrieved successfully")
})

/**
 * Create a new appointment
 */
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { patientId, doctorId, date, startTime, endTime, type, reason, notes } = req.body

  // Validate required fields
  if (!patientId || !doctorId || !date || !startTime || !endTime || !type || !reason) {
    return badRequestResponse(res, "Missing required fields")
  }

  // Check if patient exists
  const patient = await patientRepository.findById(patientId)
  if (!patient) {
    return notFoundResponse(res, "Patient not found")
  }

  // Check if doctor exists
  const doctor = await doctorRepository.findById(doctorId)
  if (!doctor) {
    return notFoundResponse(res, "Doctor not found")
  }

  // Check if the time slot is available
  const isAvailable = await appointmentRepository.checkAvailability(doctorId, new Date(date), startTime, endTime)

  if (!isAvailable) {
    return badRequestResponse(res, "The selected time slot is not available")
  }

  // Create appointment
  const appointmentData = {
    patient: patientId,
    doctor: doctorId,
    date: new Date(date),
    startTime,
    endTime,
    status: "scheduled",
    type,
    reason,
    notes: notes || "",
    reminders: [],
  }

  const newAppointment = await appointmentRepository.createAppointment(appointmentData)

  // Send confirmation email if patient has email
  if (patient.user && patient.user.email) {
    try {
      const patientName = patient.user.names
      const doctorName = doctor.user ? doctor.user.names : "your doctor"
      const formattedDate = new Date(date).toLocaleDateString()

      await sendAppointmentConfirmationEmail(
        patient.user.email,
        patientName,
        doctorName,
        formattedDate,
        startTime,
        type,
      )
    } catch (error) {
      console.error("Error sending confirmation email:", error)
    }
  }

  // Send confirmation SMS if patient has phone number
  if (patient.user && patient.user.phoneNumber) {
    try {
      const patientName = patient.user.names
      const doctorName = doctor.user ? doctor.user.names : "your doctor"
      const formattedDate = new Date(date).toLocaleDateString()

      await sendAppointmentConfirmationSMS(patient.user.phoneNumber, patientName, doctorName, formattedDate, startTime)
    } catch (error) {
      console.error("Error sending confirmation SMS:", error)
    }
  }

  // Log the action
  await logAction(req, "create_appointment", "appointment", newAppointment._id.toString(), {
    patientId,
    doctorId,
    date,
    type,
  })

  return successResponse(res, { appointment: newAppointment }, "Appointment created successfully", httpStatus.CREATED)
})

/**
 * Update an appointment
 */
export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { date, startTime, endTime, type, reason, notes } = req.body

  // Check if appointment exists
  const appointment = await appointmentRepository.findById(id)
  if (!appointment) {
    return notFoundResponse(res, "Appointment not found")
  }

  // If date or time is changing, check availability
  if (
    (date && date !== appointment.date.toISOString().split("T")[0]) ||
    (startTime && startTime !== appointment.startTime) ||
    (endTime && endTime !== appointment.endTime)
  ) {
    const checkDate = date ? new Date(date) : appointment.date
    const checkStartTime = startTime || appointment.startTime
    const checkEndTime = endTime || appointment.endTime

    const isAvailable = await appointmentRepository.checkAvailability(
      appointment.doctor._id,
      checkDate,
      checkStartTime,
      checkEndTime,
      id,
    )

    if (!isAvailable) {
      return badRequestResponse(res, "The selected time slot is not available")
    }
  }

  // Update appointment
  const updateData: any = {}
  if (date) updateData.date = new Date(date)
  if (startTime) updateData.startTime = startTime
  if (endTime) updateData.endTime = endTime
  if (type) updateData.type = type
  if (reason) updateData.reason = reason
  if (notes !== undefined) updateData.notes = notes

  const updatedAppointment = await appointmentRepository.updateAppointment(id, updateData)

  // Log the action
  await logAction(req, "update_appointment", "appointment", id, { updatedFields: Object.keys(updateData) })

  return successResponse(res, { appointment: updatedAppointment }, "Appointment updated successfully")
})

/**
 * Cancel an appointment
 */
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { cancellationReason } = req.body

  // Check if appointment exists
  const appointment = await appointmentRepository.findById(id)
  if (!appointment) {
    return notFoundResponse(res, "Appointment not found")
  }

  // Check if appointment can be cancelled
  if (appointment.status === "completed" || appointment.status === "cancelled") {
    return badRequestResponse(res, `Cannot cancel an appointment that is already ${appointment.status}`)
  }

  // Update appointment status
  const updatedAppointment = await appointmentRepository.updateAppointment(id, {
    status: "cancelled",
    notes: cancellationReason ? `${appointment.notes}\nCancellation reason: ${cancellationReason}` : appointment.notes,
  })

  // Log the action
  await logAction(req, "cancel_appointment", "appointment", id, { cancellationReason })

  return successResponse(res, { appointment: updatedAppointment }, "Appointment cancelled successfully")
})

/**
 * Change appointment status
 */
export const changeAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !["scheduled", "confirmed", "completed", "cancelled", "no-show"].includes(status)) {
    return badRequestResponse(res, "Valid status is required")
  }

  // Check if appointment exists
  const appointment = await appointmentRepository.findById(id)
  if (!appointment) {
    return notFoundResponse(res, "Appointment not found")
  }

  // Update appointment status
  const updatedAppointment = await appointmentRepository.changeAppointmentStatus(id, status)

  // Log the action
  await logAction(req, "change_appointment_status", "appointment", id, { status })

  return successResponse(
    res,
    { appointment: updatedAppointment },
    `Appointment status changed to ${status} successfully`,
  )
})

/**
 * Get appointment statistics
 */
export const getAppointmentStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await appointmentRepository.getAppointmentStats()
  return successResponse(res, stats, "Appointment statistics retrieved successfully")
})

/**
 * Get appointments by date
 */
export const getAppointmentsByDate = asyncHandler(async (req: Request, res: Response) => {
  const { date, doctorId } = req.query

  if (!date) {
    return badRequestResponse(res, "Date is required")
  }

  const appointments = await appointmentRepository.getAppointmentsByDate(new Date(date as string), doctorId as string)

  return successResponse(res, { appointments }, "Appointments retrieved successfully")
})

/**
 * Get upcoming appointments
 */
export const getUpcomingAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { limit = "10" } = req.query

  const appointments = await appointmentRepository.getUpcomingAppointments(Number.parseInt(limit as string))

  return successResponse(res, { appointments }, "Upcoming appointments retrieved successfully")
})

/**
 * Add a reminder to an appointment
 */
export const addAppointmentReminder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { type, status } = req.body

  if (!type || !["email", "sms"].includes(type)) {
    return badRequestResponse(res, "Valid reminder type is required (email or sms)")
  }

  // Check if appointment exists
  const appointment = await appointmentRepository.findById(id)
  if (!appointment) {
    return notFoundResponse(res, "Appointment not found")
  }

  // Add reminder
  const reminderData = {
    type,
    sentAt: new Date(),
    status: status || "sent",
  }

  const updatedAppointment = await appointmentRepository.addReminder(id, reminderData)

  // Log the action
  await logAction(req, "add_appointment_reminder", "appointment", id, { reminderType: type })

  return successResponse(res, { appointment: updatedAppointment }, "Reminder added successfully")
})

/**
 * Check doctor availability
 */
export const checkDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId, date, startTime, endTime, appointmentId } = req.body

  if (!doctorId || !date || !startTime || !endTime) {
    return badRequestResponse(res, "Doctor ID, date, start time, and end time are required")
  }

  const isAvailable = await appointmentRepository.checkAvailability(
    doctorId,
    new Date(date),
    startTime,
    endTime,
    appointmentId,
  )

  return successResponse(res, { available: isAvailable }, "Availability checked successfully")
})

/**
 * Get appointments needing reminders
 */
export const getAppointmentsNeedingReminders = asyncHandler(async (req: Request, res: Response) => {
  const { hoursAhead = "24" } = req.query

  const appointments = await appointmentRepository.getAppointmentsNeedingReminders(
    Number.parseInt(hoursAhead as string),
  )

  return successResponse(res, { appointments }, "Appointments needing reminders retrieved successfully")
})

