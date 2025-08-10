/* eslint-disable @typescript-eslint/no-explicit-any */
import Payment from "../../../database/models/payment"
import type { Types } from "mongoose"
import { generateInvoiceNumber } from "../utils/paymentUtils"

interface PaymentQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  patientId?: string
  appointmentId?: string
  doctorId?: string
  status?: "pending" | "completed" | "failed" | "refunded"
  paymentMethod?: "stripe" | "MoMo" | "cash"
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

class PaymentRepository {
  /**
   * Find a payment by ID with populated data
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return Payment.findById(id)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "names email phoneNumber picture preferredLanguage",
        },
      })
      .populate({
        path: "appointment",
        populate: [
          {
            path: "doctor",
            select: "user specialization consultationFee",
            populate: {
              path: "user",
              select: "names email phoneNumber picture",
            },
          },
          {
            path: "patient",
            select: "_id",
          },
        ],
      })
  }

  /**
   * Find payments with pagination and filtering
   */
  async findPayments(options: PaymentQueryOptions = {}): Promise<{
    payments: any[]
    total: number
    page: number
    limit: number
    pages: number
    totalAmount: number
  }> {
    const {
      page = 1,
      limit = 10,
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
    } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    if (patientId) query.patient = patientId
    if (appointmentId) query.appointment = appointmentId
    if (status) query.status = status
    if (paymentMethod) query.paymentMethod = paymentMethod

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {}
      if (minAmount !== undefined) query.amount.$gte = minAmount
      if (maxAmount !== undefined) query.amount.$lte = maxAmount
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = startDate
      if (endDate) query.createdAt.$lte = endDate
    }

    // Filter by doctor ID (through appointment)
    let appointmentIds = []
    if (doctorId) {
      appointmentIds = await this.getAppointmentIdsByDoctor(doctorId)
      if (appointmentIds.length === 0) {
        // No appointments found for this doctor, return empty result
        return {
          payments: [],
          total: 0,
          page,
          limit,
          pages: 0,
          totalAmount: 0,
        }
      }
      query.appointment = { $in: appointmentIds }
    }

    // Execute query with population
    const payments = await Payment.find(query)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "names email phoneNumber picture preferredLanguage",
        },
      })
      .populate({
        path: "appointment",
        populate: [
          {
            path: "doctor",
            select: "user specialization consultationFee",
            populate: {
              path: "user",
              select: "names email phoneNumber picture",
            },
          },
          {
            path: "patient",
            select: "_id",
          },
        ],
      })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)

    const total = await Payment.countDocuments(query)

    // Calculate total amount for the filtered payments
    const totalAmountResult = await Payment.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0

    return {
      payments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      totalAmount,
    }
  }

  /**
   * Get appointment IDs by doctor ID
   */
  private async getAppointmentIdsByDoctor(doctorId: string): Promise<string[]> {
    const appointments = await Payment.find({ "appointment.doctor": doctorId }).distinct("appointment")
    return appointments.map((appointment: Types.ObjectId) => appointment.toString())
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentData: any): Promise<any> {
    // Generate invoice number if not provided
    if (!paymentData.invoiceNumber) {
      paymentData.invoiceNumber = await generateInvoiceNumber()
    }

    const payment = new Payment(paymentData)
    return payment.save()
  }

  /**
   * Update a payment
   */
  async updatePayment(id: string | Types.ObjectId, updateData: any): Promise<any> {
    return Payment.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "names email phoneNumber picture preferredLanguage",
        },
      })
      .populate({
        path: "appointment",
        populate: [
          {
            path: "doctor",
            select: "user specialization consultationFee",
            populate: {
              path: "user",
              select: "names email phoneNumber picture",
            },
          },
          {
            path: "patient",
            select: "_id",
          },
        ],
      })
  }

  /**
   * Process a refund
   */
  async processRefund(
    id: string | Types.ObjectId,
    refundData: { refundAmount: number; refundReason: string },
  ): Promise<any> {
    const { refundAmount, refundReason } = refundData

    return Payment.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "refunded",
          refundAmount,
          refundReason,
        },
      },
      { new: true, runValidators: true },
    )
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "names email phoneNumber picture preferredLanguage",
        },
      })
      .populate({
        path: "appointment",
        populate: [
          {
            path: "doctor",
            select: "user specialization consultationFee",
            populate: {
              path: "user",
              select: "names email phoneNumber picture",
            },
          },
          {
            path: "patient",
            select: "_id",
          },
        ],
      })
  }

  /**
   * Delete a payment (for administrative purposes)
   */
  async deletePayment(id: string | Types.ObjectId): Promise<any> {
    return Payment.findByIdAndDelete(id)
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<any> {
    const dateQuery: any = {}
    if (startDate || endDate) {
      dateQuery.createdAt = {}
      if (startDate) dateQuery.createdAt.$gte = startDate
      if (endDate) dateQuery.createdAt.$lte = endDate
    }

    const [totalRevenue, paymentMethodStats, statusStats, dailyRevenue, averagePaymentAmount, refundStats] =
      await Promise.all([
        // Total revenue
        Payment.aggregate([
          { $match: { ...dateQuery, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        // Payment method breakdown
        Payment.aggregate([
          { $match: dateQuery },
          { $group: { _id: "$paymentMethod", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
          { $sort: { amount: -1 } },
        ]),

        // Status breakdown
        Payment.aggregate([
          { $match: dateQuery },
          { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
          { $sort: { count: -1 } },
        ]),

        // Daily revenue (last 30 days if no date range specified)
        Payment.aggregate([
          {
            $match: {
              ...dateQuery,
              status: "completed",
              createdAt: {
                $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                $lte: endDate || new Date(),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Average payment amount
        Payment.aggregate([
          { $match: { ...dateQuery, status: "completed" } },
          { $group: { _id: null, average: { $avg: "$amount" } } },
        ]),

        // Refund statistics
        Payment.aggregate([
          { $match: { ...dateQuery, status: "refunded" } },
          {
            $group: {
              _id: null,
              totalRefunded: { $sum: "$refundAmount" },
              count: { $sum: 1 },
              averageRefund: { $avg: "$refundAmount" },
            },
          },
        ]),
      ])

    // Format payment method stats
    const paymentMethods: Record<string, { count: number; amount: number; percentage: number }> = {}
    const totalAmount = paymentMethodStats.reduce((sum, item) => sum + item.amount, 0)

    paymentMethodStats.forEach((item) => {
      paymentMethods[item._id] = {
        count: item.count,
        amount: item.amount,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      }
    })

    // Format status stats
    const statuses: Record<string, { count: number; amount: number }> = {}
    statusStats.forEach((item) => {
      statuses[item._id] = {
        count: item.count,
        amount: item.amount,
      }
    })

    return {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      paymentMethods,
      statuses,
      dailyRevenue,
      averagePaymentAmount: averagePaymentAmount.length > 0 ? averagePaymentAmount[0].average : 0,
      refundStats: refundStats.length > 0 ? refundStats[0] : { totalRefunded: 0, count: 0, averageRefund: 0 },
    }
  }

  /**
   * Get patient payment history
   */
  async getPatientPaymentHistory(patientId: string | Types.ObjectId): Promise<any[]> {
    return Payment.find({ patient: patientId })
      .populate({
        path: "appointment",
        populate: {
          path: "doctor",
          select: "user specialization",
          populate: {
            path: "user",
            select: "names",
          },
        },
      })
      .sort({ createdAt: -1 })
  }

  /**
   * Get payments by appointment
   */
  async getPaymentsByAppointment(appointmentId: string | Types.ObjectId): Promise<any[]> {
    return Payment.find({ appointment: appointmentId })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "names email phoneNumber",
        },
      })
      .sort({ createdAt: -1 })
  }

  /**
   * Get payments by doctor
   */
  async getPaymentsByDoctor(doctorId: string | Types.ObjectId): Promise<any[]> {
    // First get all appointments for this doctor
    const appointmentIds = await this.getAppointmentIdsByDoctor(doctorId.toString())

    // Then get all payments for these appointments
    return Payment.find({ appointment: { $in: appointmentIds } })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "names email phoneNumber picture preferredLanguage",
      },
    })
    .populate({
      path: "doctor",
      select: "user specialization qualifications experience languages consultationFee averageRating",
      populate: {
        path: "user",
        select: "names email phoneNumber picture",
      },
    })
    .populate({
      path: "appointment",
      select: "date startTime endTime status type notes reason reminders",
      populate: [
        {
          path: "patient",
          select: "_id",
        },
        {
          path: "doctor",
          select: "_id",
        },
      ],
    })
      .sort({ createdAt: -1 })
  }

  /**
   * Get outstanding payments
   */
  async getOutstandingPayments(): Promise<any[]> {
    return Payment.find({ status: "pending" })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "names email phoneNumber",
        },
      })
      .populate({
        path: "appointment",
        populate: {
          path: "doctor",
          select: "user specialization",
          populate: {
            path: "user",
            select: "names",
          },
        },
      })
      .sort({ createdAt: 1 })
  }
}

export default new PaymentRepository()
