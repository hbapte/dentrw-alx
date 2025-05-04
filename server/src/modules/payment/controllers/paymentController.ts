/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import httpStatus from "http-status"
import paymentRepository from "../repositories/paymentRepository"
import appointmentRepository from "../../appointments/repositories/appointmentRepository"
import servicePriceRepository from "../repositories/servicePriceRepository"
import { processStripePayment, processMoMoPayment } from "../services/paymentGatewayService"
import { generateInvoice, generateReceipt } from "../utils/invoiceGenerator"
import { logAction } from "../../../utils/auditLogUtil"
import asyncHandler from "../../../utils/asyncHandler"
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  internalErrorResponse,
} from "../../../utils/api-response"


/**
 * Get all payments with pagination and filtering
 */
export const getAllPayments = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const {
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
    patientId,
    appointmentId,
    doctorId,
    status,
    paymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = req.query




  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    patientId: patientId as string,
    appointmentId: appointmentId as string,
    doctorId: doctorId as string,
    status: status as "pending" | "completed" | "failed" | "refunded",
    paymentMethod: paymentMethod as "stripe" | "MoMo" | "cash",
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    minAmount: minAmount ? Number.parseInt(minAmount as string) : undefined,
    maxAmount: maxAmount ? Number.parseInt(maxAmount as string) : undefined,
  }

  const result = await paymentRepository.findPayments(options)

  // Calculate pagination links
  const totalPages = Math.ceil(result.total / options.limit)
  const currentPage = options.page

  return successResponse(res, result.payments, "Payments retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    pagination: {
      page: currentPage,
      pageSize: options.limit,
      totalItems: result.total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
    // summary: {
    //   totalAmount: result.totalAmount,
    //   currency: "RWF", // Default currency
    // },
    links: {
      createPayment: `/api/payments`,
      stats: `/api/payments/stats`,
      outstanding: `/api/payments/outstanding`,
    },
    cacheControl: "private, max-age=60", // Cache for 1 minute
  })
})

/**
 * Get payment by ID
 */
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const payment = await paymentRepository.findById(id)

  if (!payment) {
    return notFoundResponse(res, "Payment not found", { startTime })
  }

  return successResponse(res, { payment }, "Payment retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      update: `/api/payments/${id}`,
      refund: `/api/payments/${id}/refund`,
      invoice: `/api/payments/${id}/invoice`,
      receipt: `/api/payments/${id}/receipt`,
      patient: `/api/patients/${payment.patient._id}`,
      appointment: `/api/appointments/${payment.appointment._id}`,
    },
  })
})

/**
 * Create a new payment
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { appointmentId, patientId, serviceId, amount, currency = "RWF", paymentMethod, metadata } = req.body

  // Check if appointment exists
  const appointment = await appointmentRepository.findById(appointmentId)
  if (!appointment) {
    return notFoundResponse(res, "Appointment not found", { startTime })
  }

  // Check if appointment belongs to the specified patient
  if (appointment.patient.toString() !== patientId) {
    return badRequestResponse(res, "Appointment does not belong to the specified patient", null, { startTime })
  }

  // If serviceId is provided, get the service price
  let paymentAmount = amount
  let serviceName = "Dental Service"

  if (serviceId) {
    const service = await servicePriceRepository.findById(serviceId)
    if (!service) {
      return notFoundResponse(res, "Service not found", { startTime })
    }

    if (!service.active) {
      return badRequestResponse(res, "Service is not active", null, { startTime })
    }

    paymentAmount = service.price
    serviceName = service.name
  }

  // Create payment data
  const paymentData = {
    appointment: appointmentId,
    patient: patientId,
    amount: paymentAmount,
    currency,
    paymentMethod,
    status: "pending",
    transactionId: null, // Add transactionId property
    receiptUrl: null, // Add receiptUrl property
    metadata: {
      ...metadata,
      serviceName,
      serviceId: serviceId || null,
    },
  }

  // Process payment based on payment method
  let paymentResult
  try {
    if (paymentMethod === "stripe") {
      paymentResult = await processStripePayment(paymentAmount, currency, paymentData.metadata)
      paymentData.transactionId = paymentResult.transactionId
      paymentData.receiptUrl = paymentResult.receiptUrl
      paymentData.status = paymentResult.success ? "completed" : "failed"
    } else if (paymentMethod === "MoMo") {
      paymentResult = await processMoMoPayment(paymentAmount, patientId, paymentData.metadata)
      paymentData.transactionId = paymentResult.transactionId
      paymentData.status = paymentResult.success ? "completed" : "failed"
    } else if (paymentMethod === "cash") {
      // Cash payments are marked as completed immediately
      paymentData.status = "completed"
    }
  } catch (error: any) {
    return internalErrorResponse(res, "Payment processing failed", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }

  // Create payment record
  const newPayment = await paymentRepository.createPayment(paymentData)

  // If payment is completed, update appointment payment reference
  if (newPayment.status === "completed") {
    await appointmentRepository.updateAppointment(appointmentId, { payment: newPayment._id })
  }

  // Log the action
  await logAction(req, "create_payment", "payment", newPayment._id.toString(), {
    patientId,
    appointmentId,
    amount: paymentAmount,
    paymentMethod,
  })

  // Generate invoice if payment is completed
  let invoiceUrl = null
  if (newPayment.status === "completed") {
    try {
      invoiceUrl = await generateInvoice(newPayment)
    } catch (error) {
      console.error("Error generating invoice:", error)
    }
  }

  return successResponse(
    res,
    { payment: newPayment, invoiceUrl },
    `Payment ${newPayment.status === "completed" ? "completed" : "initiated"} successfully`,
    {
      statusCode: httpStatus.CREATED,
      startTime,
      links: {
        view: `/api/payments/${newPayment._id}`,
        invoice: `/api/payments/${newPayment._id}/invoice`,
        receipt: `/api/payments/${newPayment._id}/receipt`,
        patient: `/api/patients/${patientId}`,
        appointment: `/api/appointments/${appointmentId}`,
      },
    },
  )
})

/**
 * Update payment status
 */
export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { status, transactionId, receiptUrl } = req.body


  // Check if payment exists
  const payment = await paymentRepository.findById(id)
  if (!payment) {
    return notFoundResponse(res, "Payment not found", { startTime })
  }

  // Update payment
  const updateData: any = { status }
  if (transactionId) updateData.transactionId = transactionId
  if (receiptUrl) updateData.receiptUrl = receiptUrl

  const updatedPayment = await paymentRepository.updatePayment(id, updateData)

  // If payment is completed, update appointment payment reference
  if (updatedPayment.status === "completed" && payment.status !== "completed") {
    await appointmentRepository.updateAppointment(updatedPayment.appointment._id, { payment: updatedPayment._id })
  }

  // Log the action
  await logAction(req, "update_payment_status", "payment", id, { status, previousStatus: payment.status })

  return successResponse(res, { payment: updatedPayment }, "Payment status updated successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      view: `/api/payments/${id}`,
      invoice: `/api/payments/${id}/invoice`,
      receipt: `/api/payments/${id}/receipt`,
    },
  })
})

/**
 * Process a refund
 */
export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { refundAmount, refundReason } = req.body


  // Check if payment exists
  const payment = await paymentRepository.findById(id)
  if (!payment) {
    return notFoundResponse(res, "Payment not found", { startTime })
  }

  // Check if payment is completed
  if (payment.status !== "completed") {
    return badRequestResponse(res, "Only completed payments can be refunded", null, { startTime })
  }

  // Check if refund amount is valid
  if (refundAmount <= 0 || refundAmount > payment.amount) {
    return badRequestResponse(res, "Invalid refund amount", null, { startTime })
  }

  // Process refund based on payment method
  try {
    if (payment.paymentMethod === "stripe") {
      // Process Stripe refund
      // This would call the Stripe API to process the refund
      // For now, we'll just update the payment status
    } else if (payment.paymentMethod === "MoMo") {
      // Process MoMo refund
      // This would call the MoMo API to process the refund
      // For now, we'll just update the payment status
    }
    // Cash refunds are handled manually
  } catch (error: any) {
    return internalErrorResponse(res, "Refund processing failed", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }

  // Update payment with refund information
  const updatedPayment = await paymentRepository.processRefund(id, { refundAmount, refundReason })

  // Log the action
  await logAction(req, "process_refund", "payment", id, { refundAmount, refundReason })

  return successResponse(res, { payment: updatedPayment }, "Refund processed successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      view: `/api/payments/${id}`,
      invoice: `/api/payments/${id}/invoice`,
    },
  })
})

/**
 * Generate invoice
 */
export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { format = "pdf" } = req.query

  // Check if payment exists
  const payment = await paymentRepository.findById(id)
  if (!payment) {
    return notFoundResponse(res, "Payment not found", { startTime })
  }

  try {
    // Generate invoice
    const invoiceUrl = await generateInvoice(payment, format as string)

    return successResponse(res, { invoiceUrl }, "Invoice generated successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        payment: `/api/payments/${id}`,
        download: invoiceUrl,
      },
    })
  } catch (error: any) {
    return internalErrorResponse(res, "Failed to generate invoice", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
})

/**
 * Generate receipt
 */
export const getReceipt = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { format = "pdf" } = req.query

  // Check if payment exists
  const payment = await paymentRepository.findById(id)
  if (!payment) {
    return notFoundResponse(res, "Payment not found", { startTime })
  }

  // Check if payment is completed
  if (payment.status !== "completed") {
    return badRequestResponse(res, "Receipt can only be generated for completed payments", null, { startTime })
  }

  try {
    // Generate receipt
    const receiptUrl = await generateReceipt(payment, format as string)

    return successResponse(res, { receiptUrl }, "Receipt generated successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        payment: `/api/payments/${id}`,
        download: receiptUrl,
      },
    })
  } catch (error: any) {
    return internalErrorResponse(res, "Failed to generate receipt", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
})

/**
 * Get payment statistics
 */
export const getPaymentStats = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { startDate, endDate } = req.query

  const stats = await paymentRepository.getPaymentStats(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined,
  )

  return successResponse(res, stats, "Payment statistics retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      allPayments: `/api/payments`,
      outstanding: `/api/payments/outstanding`,
    },
    cacheControl: "private, max-age=300", // Cache for 5 minutes
  })
})

/**
 * Get patient payment history
 */
export const getPatientPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { patientId } = req.params

  const payments = await paymentRepository.getPatientPaymentHistory(patientId)

  return successResponse(res, { payments }, "Patient payment history retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      patient: `/api/patients/${patientId}`,
      createPayment: `/api/payments`,
    },
  })
})

/**
 * Get doctor payment history
 */
export const getDoctorPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { doctorId } = req.params

  const payments = await paymentRepository.getPaymentsByDoctor(doctorId)

  return successResponse(res, { payments }, "Doctor payment history retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      doctor: `/api/doctors/${doctorId}`,
      createPayment: `/api/payments`,
    },
  })
})

/**
 * Get outstanding payments
 */
export const getOutstandingPayments = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()

  const payments = await paymentRepository.getOutstandingPayments()

  return successResponse(res, { payments }, "Outstanding payments retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      allPayments: `/api/payments`,
      stats: `/api/payments/stats`,
    },
  })
})

/**
 * Get payments by appointment
 */
export const getPaymentsByAppointment = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { appointmentId } = req.params

  const payments = await paymentRepository.getPaymentsByAppointment(appointmentId)

  return successResponse(res, { payments }, "Appointment payments retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      appointment: `/api/appointments/${appointmentId}`,
      createPayment: `/api/payments`,
    },
  })
})
