/* eslint-disable @typescript-eslint/no-explicit-any */
import MedicalRecord from "../../../database/models/medicalRecord"
import type { Types } from "mongoose"

interface MedicalRecordQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  doctorId?: string
  patientId?: string
  appointmentId?: string
  startDate?: Date
  endDate?: Date
  followUpRequired?: boolean
}

class MedicalRecordRepository {
  /**
   * Find a medical record by ID
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return MedicalRecord.findById(id)
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .populate("appointment")
  }

  /**
   * Find medical records with pagination and filtering
   */
  async findMedicalRecords(options: MedicalRecordQueryOptions = {}): Promise<{
    records: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      doctorId,
      patientId,
      appointmentId,
      startDate,
      endDate,
      followUpRequired,
    } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    if (doctorId) query.doctor = doctorId
    if (patientId) query.patient = patientId
    if (appointmentId) query.appointment = appointmentId
    if (followUpRequired !== undefined) query.followUpRequired = followUpRequired

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = startDate
      if (endDate) query.createdAt.$lte = endDate
    }

    // Execute query
    const records = await MedicalRecord.find(query)
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .populate("appointment", "date startTime endTime type")
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)

    const total = await MedicalRecord.countDocuments(query)

    return {
      records,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  /**
   * Create a new medical record
   */
  async createMedicalRecord(recordData: any): Promise<any> {
    const medicalRecord = new MedicalRecord(recordData)
    return medicalRecord.save()
  }

  /**
   * Update a medical record
   */
  async updateMedicalRecord(id: string | Types.ObjectId, updateData: any): Promise<any> {
    return MedicalRecord.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate("patient", "names email phoneNumber picture")
      .populate({
        path: "doctor",
        select: "user specialization",
        populate: {
          path: "user",
          select: "names email phoneNumber picture",
        },
      })
      .populate("appointment", "date startTime endTime type")
  }

  /**
   * Delete a medical record
   */
  async deleteMedicalRecord(id: string | Types.ObjectId): Promise<any> {
    return MedicalRecord.findByIdAndDelete(id)
  }

  /**
   * Add an attachment to a medical record
   */
  async addAttachment(
    id: string | Types.ObjectId,
    attachmentData: { name: string; fileUrl: string; fileType: string },
  ): Promise<any> {
    return MedicalRecord.findByIdAndUpdate(
      id,
      {
        $push: {
          attachments: {
            ...attachmentData,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    )
  }

  /**
   * Remove an attachment from a medical record
   */
  async removeAttachment(id: string | Types.ObjectId, attachmentId: string): Promise<any> {
    return MedicalRecord.findByIdAndUpdate(id, { $pull: { attachments: { _id: attachmentId } } }, { new: true })
  }

  /**
   * Add a prescription to a medical record
   */
  async addPrescription(id: string | Types.ObjectId, prescriptionData: any): Promise<any> {
    return MedicalRecord.findByIdAndUpdate(
      id,
      { $push: { prescription: prescriptionData } },
      { new: true, runValidators: true },
    )
  }

  /**
   * Update a prescription in a medical record
   */
  async updatePrescription(id: string | Types.ObjectId, prescriptionId: string, prescriptionData: any): Promise<any> {
    // First find the medical record
    const medicalRecord = await MedicalRecord.findById(id)

    if (!medicalRecord) {
      throw new Error("Medical record not found")
    }

    // Find the prescription index
    const prescriptionIndex = medicalRecord.prescription.findIndex((p: any) => p._id.toString() === prescriptionId)

    if (prescriptionIndex === -1) {
      throw new Error("Prescription not found")
    }

    // Update the prescription
    const updatePath = `prescription.${prescriptionIndex}`
    const updateObj: any = {}

    for (const [key, value] of Object.entries(prescriptionData)) {
      updateObj[`${updatePath}.${key}`] = value
    }

    return MedicalRecord.findByIdAndUpdate(id, { $set: updateObj }, { new: true, runValidators: true })
  }

  /**
   * Remove a prescription from a medical record
   */
  async removePrescription(id: string | Types.ObjectId, prescriptionId: string): Promise<any> {
    return MedicalRecord.findByIdAndUpdate(id, { $pull: { prescription: { _id: prescriptionId } } }, { new: true })
  }

  /**
   * Get patient medical history
   */
  async getPatientMedicalHistory(patientId: string | Types.ObjectId): Promise<any[]> {
    return MedicalRecord.find({ patient: patientId })
      .populate({
        path: "doctor",
        select: "user specialization",
        populate: {
          path: "user",
          select: "names",
        },
      })
      .populate("appointment", "date type")
      .sort({ createdAt: -1 })
  }

  /**
   * Get records that need follow-up
   */
  async getFollowUpRecords(daysAhead = 7): Promise<any[]> {
    const now = new Date()
    const futureDate = new Date(now)
    futureDate.setDate(now.getDate() + daysAhead)

    return MedicalRecord.find({
      followUpRequired: true,
      followUpDate: { $gte: now, $lte: futureDate },
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
      .sort({ followUpDate: 1 })
  }

  /**
   * Get medical record statistics
   */
  async getMedicalRecordStats(): Promise<any> {
    const [totalRecords, recordsWithFollowUp, diagnosisCounts] = await Promise.all([
      MedicalRecord.countDocuments({}),
      MedicalRecord.countDocuments({ followUpRequired: true }),
      MedicalRecord.aggregate([
        {
          $group: {
            _id: "$diagnosis",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ])

    // Format diagnosis counts
    const commonDiagnoses: Record<string, number> = {}
    diagnosisCounts.forEach((item: any) => {
      commonDiagnoses[item._id] = item.count
    })

    return {
      totalRecords,
      recordsWithFollowUp,
      followUpPercentage: (recordsWithFollowUp / totalRecords) * 100,
      commonDiagnoses,
    }
  }
}

export default new MedicalRecordRepository()

