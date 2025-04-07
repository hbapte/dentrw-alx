/* eslint-disable @typescript-eslint/no-explicit-any */
import Appointment from "../../../database/models/appointment"
import type { Types } from "mongoose"

interface AppointmentQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  doctorId?: string
  patientId?: string
  status?: string
  type?: string
  startDate?: Date
  endDate?: Date
}

class AppointmentRepository {
  /**
   * Find an appointment by ID
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return Appointment.findById(id)
      .populate("patient", "-password -totpSecret")
      .populate("doctor", "-password -totpSecret")
      .populate("payment")
  }

  /**
   * Find appointments with pagination and filtering
   */
  async findAppointments(options: AppointmentQueryOptions = {}): Promise<{
    appointments: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
      doctorId,
      patientId,
      status,
      type,
      startDate,
      endDate,
    } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    if (doctorId) query.doctor = doctorId
    if (patientId) query.patient = patientId
    if (status) query.status = status
    if (type) query.type = type

    // Date range filter
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }

    // Execute query
    const appointments = await Appointment.find(query)
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization consultationFee",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .populate("payment", "amount status paymentMethod")
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)

    const total = await Appointment.countDocuments(query)

    return {
      appointments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: any): Promise<any> {
    const appointment = new Appointment(appointmentData)
    return appointment.save()
  }

  /**
   * Update an appointment
   */
  async updateAppointment(id: string | Types.ObjectId, updateData: any): Promise<any> {
    return Appointment.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization consultationFee",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .populate("payment", "amount status paymentMethod")
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string | Types.ObjectId): Promise<any> {
    return Appointment.findByIdAndDelete(id)
  }

  /**
   * Change appointment status
   */
  async changeAppointmentStatus(id: string | Types.ObjectId, status: string): Promise<any> {
    return Appointment.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true })
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization consultationFee",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .populate("payment", "amount status paymentMethod")
  }

  /**
   * Add a reminder to an appointment
   */
  async addReminder(
    id: string | Types.ObjectId,
    reminderData: { type: string; sentAt: Date; status: string },
  ): Promise<any> {
    return Appointment.findByIdAndUpdate(id, { $push: { reminders: reminderData } }, { new: true, runValidators: true })
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(limit = 10): Promise<any[]> {
    const now = new Date()

    return Appointment.find({
      date: { $gte: now },
      status: { $in: ["scheduled", "confirmed"] },
    })
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization consultationFee",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .sort({ date: 1, startTime: 1 })
      .limit(limit)
  }

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsByDate(date: Date, doctorId?: string): Promise<any[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const query: any = {
      date: { $gte: startOfDay, $lte: endOfDay },
    }

    if (doctorId) {
      query.doctor = doctorId
    }

    return Appointment.find(query)
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization consultationFee",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .sort({ startTime: 1 })
  }

  /**
   * Check for time slot availability
   */
  async checkAvailability(
    doctorId: string | Types.ObjectId,
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const query: any = {
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["scheduled", "confirmed"] },
      $or: [
        // New appointment starts during an existing appointment
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        // New appointment ends during an existing appointment
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        // New appointment completely contains an existing appointment
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    }

    // Exclude the current appointment if updating
    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId }
    }

    const conflictingAppointments = await Appointment.countDocuments(query)

    return conflictingAppointments === 0
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(): Promise<any> {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const [totalAppointments, todayAppointments, weekAppointments, monthAppointments, statusCounts, typeCounts] =
      await Promise.all([
        Appointment.countDocuments({}),
        Appointment.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }),
        Appointment.countDocuments({ date: { $gte: startOfWeek, $lte: endOfWeek } }),
        Appointment.countDocuments({ date: { $gte: startOfMonth, $lte: endOfMonth } }),
        Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Appointment.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      ])

    // Format status counts
    const statusDistribution: Record<string, number> = {}
    statusCounts.forEach((item: any) => {
      statusDistribution[item._id] = item.count
    })

    // Format type counts
    const typeDistribution: Record<string, number> = {}
    typeCounts.forEach((item: any) => {
      typeDistribution[item._id] = item.count
    })

    return {
      totalAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      statusDistribution,
      typeDistribution,
    }
  }

  /**
   * Get appointments that need reminders
   */
  async getAppointmentsNeedingReminders(hoursAhead = 24): Promise<any[]> {
    const now = new Date()
    const futureDate = new Date(now)
    futureDate.setHours(now.getHours() + hoursAhead)

    return Appointment.find({
      date: { $gte: now, $lte: futureDate },
      status: "confirmed",
      "reminders.sentAt": { $exists: false },
    })
      .populate("patient", "names email phoneNumber")
      .populate({
        path: "doctor",
        select: "user",
        populate: {
          path: "user",
          select: "names",
        },
      })
  }
}

export default new AppointmentRepository()

