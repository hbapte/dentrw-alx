// server\src\modules\appointments\controllers\appointmentController.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import httpStatus from "http-status"
import appointmentRepository from "../repositories/appointmentRepository"
import doctorRepository from "../../user/repositories/doctorRepository"
import patientRepository from "../../user/repositories/patientRepository"
import { 
  successResponse, 
  notFoundResponse, 
  badRequestResponse, 
  validationErrorResponse,
  conflictResponse,
  internalErrorResponse
} from "../../../utils/api-response"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"
import { sendAppointmentConfirmationEmail } from "../../../services/emailService"
import { sendAppointmentConfirmationSMS } from "../../../services/smsService"

/**
 * Get all appointments with pagination and filtering
 */
export const getAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
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

  const pageNum = Number.parseInt(page as string)
  const limitNum = Number.parseInt(limit as string)

  const options = {
    page: pageNum,
    limit: limitNum,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    doctorId: doctorId as string,
    patientId: patientId as string,
    status: status as string,
    type: type as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  }

  try {
    const result = await appointmentRepository.findAppointments(options)
    
    // Generate pagination metadata
    const paginationMeta = {
      page: pageNum,
      pageSize: limitNum,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / limitNum),
      hasNextPage: pageNum < Math.ceil(result.total / limitNum),
      hasPreviousPage: pageNum > 1
    }

    // Generate HATEOAS links
    const links: { doctors: string; patients: string; doctor?: string; patient?: string } = {
      doctors: `/api/v1/doctors`,
      patients: `/api/v1/patients`,
    }

    if (doctorId) {
      links.doctor = `/api/v1/doctors/${doctorId}`
    }
    
    if (patientId) {
      links.patient = `/api/v1/patients/${patientId}`
    }

    return successResponse(res, result.appointments, "Appointments retrieved successfully", {
      startTime,
      pagination: paginationMeta,
      links,
      cacheControl: "private, max-age=60" // Cache for 1 minute
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to retrieve appointments", {
      startTime,
      debug: error
    })
  }
})

/**
 * Get appointment by ID
 */
export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  
  try {
    const appointment = await appointmentRepository.findById(id)

    if (!appointment) {
      return notFoundResponse(res, "Appointment not found", {
        startTime,
        help: "Check the appointment ID and ensure it exists"
      })
    }

    // Generate HATEOAS links
    const links = {
      self: `/api/v1/appointments/${id}`,
      doctor: `/api/v1/doctors/${appointment.doctor._id}`,
      patient: `/api/v1/patients/${appointment.patient._id}`,
      cancel: `/api/v1/appointments/${id}/cancel`,
      updateStatus: `/api/v1/appointments/${id}/status`
    }

    return successResponse(res, { appointment }, "Appointment retrieved successfully", {
      startTime,
      links
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to retrieve appointment", {
      startTime,
      debug: error
    })
  }
})

/**
 * Create a new appointment
 */
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { patientId, doctorId, date, startTime: apptStartTime, endTime: apptEndTime, type, reason, notes } = req.body

  // Validate required fields
  if (!patientId || !doctorId || !date || !apptStartTime || !apptEndTime || !type || !reason) {
    return validationErrorResponse(res, "Missing required fields", {
      missingFields: Object.entries({
        patientId, doctorId, date, startTime: apptStartTime, endTime: apptEndTime, type, reason
      }).filter(([, value]) => !value).map(([key]) => key)
    }, {
      startTime,
      help: "Please provide all required fields: patientId, doctorId, date, startTime, endTime, type, and reason"
    })
  }

  try {
    // Check if patient exists
    const patient = await patientRepository.findById(patientId)
    if (!patient) {
      return notFoundResponse(res, "Patient not found", {
        startTime,
        help: "Verify the patient ID is correct and the patient exists in the system"
      })
    }

    // Check if doctor exists
    const doctor = await doctorRepository.findById(doctorId)
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found", {
        startTime,
        help: "Verify the doctor ID is correct and the doctor exists in the system"
      })
    }

    // Check if the time slot is available
    const isAvailable = await appointmentRepository.checkAvailability(doctorId, new Date(date), apptStartTime, apptEndTime)

    if (!isAvailable) {
      return conflictResponse(res, "The selected time slot is not available", {
        timeSlot: { date, startTime: apptStartTime, endTime: apptEndTime }
      }, {
        startTime,
        help: "Please select a different time or date for your appointment"
      })
    }

    // Create appointment
    const appointmentData = {
      patient: patientId,
      doctor: doctorId,
      date: new Date(date),
      startTime: apptStartTime,
      endTime: apptEndTime,
      status: "scheduled",
      type,
      reason,
      notes: notes || "",
      reminders: [],
    }

    const newAppointment = await appointmentRepository.createAppointment(appointmentData)

    // Send notifications in parallel
    const notificationPromises = []

    // Send confirmation email if patient has email
    if (patient.user && patient.user.email) {
      const patientName = patient.user.names
      const doctorName = doctor.user ? doctor.user.names : "your doctor"
      const formattedDate = new Date(date).toLocaleDateString()

      notificationPromises.push(
        sendAppointmentConfirmationEmail(
          patient.user.email,
          patientName,
          doctorName,
          formattedDate,
          apptStartTime,
          type,
        ).catch(error => console.error("Error sending confirmation email:", error))
      )
    }

    // Send confirmation SMS if patient has phone number
    if (patient.user && patient.user.phoneNumber) {
      const patientName = patient.user.names
      const doctorName = doctor.user ? doctor.user.names : "your doctor"
      const formattedDate = new Date(date).toLocaleDateString()

      notificationPromises.push(
        sendAppointmentConfirmationSMS(
          patient.user.phoneNumber, 
          patientName, 
          doctorName, 
          formattedDate, 
          apptStartTime
        ).catch(error => console.error("Error sending confirmation SMS:", error))
      )
    }

    // Wait for notifications to be sent (but don't block response)
    Promise.all(notificationPromises).catch(error => 
      console.error("Error sending notifications:", error)
    )

    // Log the action
    await logAction(req, "create_appointment", "appointment", newAppointment._id.toString(), {
      patientId,
      doctorId,
      date,
      type,
    })

    // Generate HATEOAS links
    const links = {
      self: `/api/v1/appointments/${newAppointment._id}`,
      doctor: `/api/v1/doctors/${doctorId}`,
      patient: `/api/v1/patients/${patientId}`,
      cancel: `/api/v1/appointments/${newAppointment._id}/cancel`,
      updateStatus: `/api/v1/appointments/${newAppointment._id}/status`
    }

    return successResponse(
      res, 
      { appointment: newAppointment }, 
      "Appointment created successfully", 
      {
        statusCode: httpStatus.CREATED,
        startTime,
        links
      }
    )
  } catch (error) {
    return internalErrorResponse(res, "Failed to create appointment", {
      startTime,
      debug: error
    })
  }
})

/**
 * Update an appointment
 */
export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { date, startTime: apptStartTime, endTime: apptEndTime, type, reason, notes } = req.body

  // Check if any update data is provided
  if (!date && !apptStartTime && !apptEndTime && !type && !reason && notes === undefined) {
    return validationErrorResponse(res, "No update data provided", null, {
      startTime,
      help: "Please provide at least one field to update"
    })
  }

  try {
    // Check if appointment exists
    const appointment = await appointmentRepository.findById(id)
    if (!appointment) {
      return notFoundResponse(res, "Appointment not found", {
        startTime,
        help: "Check the appointment ID and ensure it exists"
      })
    }

    // If date or time is changing, check availability
    if (
      (date && date !== appointment.date.toISOString().split("T")[0]) ||
      (apptStartTime && apptStartTime !== appointment.startTime) ||
      (apptEndTime && apptEndTime !== appointment.endTime)
    ) {
      const checkDate = date ? new Date(date) : appointment.date
      const checkStartTime = apptStartTime || appointment.startTime
      const checkEndTime = apptEndTime || appointment.endTime

      const isAvailable = await appointmentRepository.checkAvailability(
        appointment.doctor._id,
        checkDate,
        checkStartTime,
        checkEndTime,
        id,
      )

      if (!isAvailable) {
        return conflictResponse(res, "The selected time slot is not available", {
          timeSlot: { date: checkDate, startTime: checkStartTime, endTime: checkEndTime }
        }, {
          startTime,
          help: "Please select a different time or date for your appointment"
        })
      }
    }

    // Update appointment
    const updateData: any = {}
    if (date) updateData.date = new Date(date)
    if (apptStartTime) updateData.startTime = apptStartTime
    if (apptEndTime) updateData.endTime = apptEndTime
    if (type) updateData.type = type
    if (reason) updateData.reason = reason
    if (notes !== undefined) updateData.notes = notes

    const updatedAppointment = await appointmentRepository.updateAppointment(id, updateData)

    // Log the action
    await logAction(req, "update_appointment", "appointment", id, { updatedFields: Object.keys(updateData) })

    // Generate HATEOAS links
    const links = {
      self: `/api/v1/appointments/${id}`,
      doctor: `/api/v1/doctors/${updatedAppointment.doctor._id}`,
      patient: `/api/v1/patients/${updatedAppointment.patient._id}`,
      cancel: `/api/v1/appointments/${id}/cancel`,
      updateStatus: `/api/v1/appointments/${id}/status`
    }

    return successResponse(res, { appointment: updatedAppointment }, "Appointment updated successfully", {
      startTime,
      links
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to update appointment", {
      startTime,
      debug: error
    })
  }
})

/**
 * Cancel an appointment
 */
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { cancellationReason } = req.body

  try {
    // Check if appointment exists
    const appointment = await appointmentRepository.findById(id)
    if (!appointment) {
      return notFoundResponse(res, "Appointment not found", {
        startTime,
        help: "Check the appointment ID and ensure it exists"
      })
    }

    // Check if appointment can be cancelled
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return badRequestResponse(res, `Cannot cancel an appointment that is already ${appointment.status}`, null, {
        startTime,
        help: "Only scheduled or confirmed appointments can be cancelled"
      })
    }

    // Update appointment status
    const updatedAppointment = await appointmentRepository.updateAppointment(id, {
      status: "cancelled",
      notes: cancellationReason ? `${appointment.notes}\nCancellation reason: ${cancellationReason}` : appointment.notes,
    })

    // Log the action
    await logAction(req, "cancel_appointment", "appointment", id, { cancellationReason })

    // Generate HATEOAS links
    const links = {
      self: `/api/v1/appointments/${id}`,
      doctor: `/api/v1/doctors/${updatedAppointment.doctor._id}`,
      patient: `/api/v1/patients/${updatedAppointment.patient._id}`
    }

    const warnings = appointment.date < new Date() ? 
      ["Cancelling a past appointment. This is for record-keeping only."] : 
      undefined

    return successResponse(res, { appointment: updatedAppointment }, "Appointment cancelled successfully", {
      startTime,
      links,
      warnings
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to cancel appointment", {
      startTime,
      debug: error
    })
  }
})

/**
 * Change appointment status
 */
export const changeAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ["scheduled", "confirmed", "completed", "cancelled", "no-show"]
  
  if (!status || !validStatuses.includes(status)) {
    return validationErrorResponse(res, "Valid status is required", {
      providedStatus: status,
      validStatuses
    }, {
      startTime,
      help: `Status must be one of: ${validStatuses.join(', ')}`
    })
  }

  try {
    // Check if appointment exists
    const appointment = await appointmentRepository.findById(id)
    if (!appointment) {
      return notFoundResponse(res, "Appointment not found", {
        startTime,
        help: "Check the appointment ID and ensure it exists"
      })
    }

    // Update appointment status
    const updatedAppointment = await appointmentRepository.changeAppointmentStatus(id, status)

    // Log the action
    await logAction(req, "change_appointment_status", "appointment", id, { status })

    // Generate HATEOAS links
    const links = {
      self: `/api/v1/appointments/${id}`,
      doctor: `/api/v1/doctors/${updatedAppointment.doctor._id}`,
      patient: `/api/v1/patients/${updatedAppointment.patient._id}`
    }

    return successResponse(
      res,
      { appointment: updatedAppointment },
      `Appointment status changed to ${status} successfully`,
      {
        startTime,
        links
      }
    )
  } catch (error) {
    return internalErrorResponse(res, "Failed to change appointment status", {
      startTime,
      debug: error
    })
  }
})

/**
 * Get appointment statistics
 */
export const getAppointmentStats = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  
  try {
    const stats = await appointmentRepository.getAppointmentStats()
    
    return successResponse(res, stats, "Appointment statistics retrieved successfully", {
      startTime,
      cacheControl: "private, max-age=300" // Cache for 5 minutes
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to retrieve appointment statistics", {
      startTime,
      debug: error
    })
  }
})

/**
 * Get appointments by date
 */
export const getAppointmentsByDate = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { date, doctorId } = req.query

  if (!date) {
    return validationErrorResponse(res, "Date is required", null, {
      startTime,
      help: "Please provide a valid date in the format YYYY-MM-DD"
    })
  }

  try {
    const appointments = await appointmentRepository.getAppointmentsByDate(
      new Date(date as string), 
      doctorId as string
    )

    // Generate HATEOAS links
    const links: any = {
      self: `/api/v1/appointments/by-date?date=${date}`
    }

    if (doctorId) {
      links.doctor = `/api/v1/doctors/${doctorId}`
      links.self += `&doctorId=${doctorId}`
    }

    return successResponse(res, { appointments }, "Appointments retrieved successfully", {
      startTime,
      links,
      cacheControl: "private, max-age=60" // Cache for 1 minute
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to retrieve appointments by date", {
      startTime,
      debug: error
    })
  }
})

/**
 * Get upcoming appointments
 */
export const getUpcomingAppointments = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { limit = "10" } = req.query
  const limitNum = Number.parseInt(limit as string)

  try {
    const appointments = await appointmentRepository.getUpcomingAppointments(limitNum)

    return successResponse(res, { appointments }, "Upcoming appointments retrieved successfully", {
      startTime,
      links: {
        self: `/api/v1/appointments/upcoming?limit=${limitNum}`
      }
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to retrieve upcoming appointments", {
      startTime,
      debug: error
    })
  }
})

/**
 * Add a reminder to an appointment
 */
export const addAppointmentReminder = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { type, status } = req.body

  const validTypes = ["email", "sms"]
  
  if (!type || !validTypes.includes(type)) {
    return validationErrorResponse(res, "Valid reminder type is required", {
      providedType: type,
      validTypes
    }, {
      startTime,
      help: `Type must be one of: ${validTypes.join(', ')}`
    })
  }

  try {
    // Check if appointment exists
    const appointment = await appointmentRepository.findById(id)
    if (!appointment) {
      return notFoundResponse(res, "Appointment not found", {
        startTime,
        help: "Check the appointment ID and ensure it exists"
      })
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

    return successResponse(res, { appointment: updatedAppointment }, "Reminder added successfully", {
      startTime,
      links: {
        self: `/api/v1/appointments/${id}`,
        appointment: `/api/v1/appointments/${id}`
      }
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to add appointment reminder", {
      startTime,
      debug: error
    })
  }
})

/**
 * Check doctor availability
 */
export const checkDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { doctorId, date, startTime: apptStartTime, endTime: apptEndTime, appointmentId } = req.body

  if (!doctorId || !date || !apptStartTime || !apptEndTime) {
    return validationErrorResponse(res, "Missing required fields", {
      missingFields: Object.entries({
        doctorId, date, startTime: apptStartTime, endTime: apptEndTime
      }).filter(([, value]) => !value).map(([key]) => key)
    }, {
      startTime,
      help: "Please provide all required fields: doctorId, date, startTime, and endTime"
    })
  }

  try {
    const isAvailable = await appointmentRepository.checkAvailability(
      doctorId,
      new Date(date),
      apptStartTime,
      apptEndTime,
      appointmentId,
    )

    return successResponse(res, { available: isAvailable }, "Availability checked successfully", {
      startTime,
      links: {
        doctor: `/api/v1/doctors/${doctorId}`,
        availability: `/api/v1/doctors/${doctorId}/availability`
      }
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to check doctor availability", {
      startTime,
      debug: error
    })
  }
})

/**
 * Get appointments needing reminders
 */
export const getAppointmentsNeedingReminders = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { hoursAhead = "24" } = req.query
  const hoursAheadNum = Number.parseInt(hoursAhead as string)

  try {
    const appointments = await appointmentRepository.getAppointmentsNeedingReminders(hoursAheadNum)

    return successResponse(res, { appointments }, "Appointments needing reminders retrieved successfully", {
      startTime,
      links: {
        self: `/api/v1/appointments/needing-reminders?hoursAhead=${hoursAheadNum}`
      }
    })
  } catch (error) {
    return internalErrorResponse(res, "Failed to retrieve appointments needing reminders", {
      startTime,
      debug: error
    })
  }
})