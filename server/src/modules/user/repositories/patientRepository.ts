/* eslint-disable @typescript-eslint/no-explicit-any */
import Patient from "../../../database/models/patient"
import User from "../../../database/models/user"
import type { Types } from "mongoose"

interface PatientQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  gender?: "male" | "female" | "other"
}

class PatientRepository {
  /**
   * Find a patient by ID
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return Patient.findById(id).populate("user", "-password -totpSecret")
  }

  /**
   * Find a patient by user ID
   */
  async findByUserId(userId: string | Types.ObjectId): Promise<any> {
    return Patient.findOne({ user: userId }).populate("user", "-password -totpSecret")
  }

  /**
   * Find patients with pagination and filtering
   */
  async findPatients(
    options: PatientQueryOptions = {},
  ): Promise<{ patients: any[]; total: number; page: number; limit: number; pages: number }> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", search = "", gender } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    // Add gender filter
    if (gender) query.gender = gender

    // Get all patients matching the query
    let patients

    if (search) {
      // If search is provided, we need to search in the User model first
      const userIds = await User.find({
        $or: [
          { names: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
        role: "patient",
      }).distinct("_id")

      // Then find patients with those user IDs
      query.user = { $in: userIds }
      patients = await Patient.find(query)
        .populate("user", "-password -totpSecret")
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)

      // Count total
      const total = await Patient.countDocuments(query)

      return {
        patients,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    } else {
      // If no search, just query the Patient model directly
      patients = await Patient.find(query)
        .populate("user", "-password -totpSecret")
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)

      // Count total
      const total = await Patient.countDocuments(query)

      return {
        patients,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: any): Promise<any> {
    const patient = new Patient(patientData)
    return patient.save()
  }

  /**
   * Update a patient
   */
  async updatePatient(id: string | Types.ObjectId, updateData: any): Promise<any> {
    return Patient.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).populate(
      "user",
      "-password -totpSecret",
    )
  }

  /**
   * Delete a patient
   */
  async deletePatient(id: string | Types.ObjectId): Promise<any> {
    return Patient.findByIdAndDelete(id)
  }

  /**
   * Count patients
   */
  async countPatients(): Promise<number> {
    return Patient.countDocuments({})
  }

  /**
   * Count patients by gender
   */
  async countByGender(): Promise<{ male: number; female: number; other: number; unspecified: number }> {
    const [male, female, other, total] = await Promise.all([
      Patient.countDocuments({ gender: "male" }),
      Patient.countDocuments({ gender: "female" }),
      Patient.countDocuments({ gender: "other" }),
      Patient.countDocuments({}),
    ])

    const unspecified = total - male - female - other

    return { male, female, other, unspecified }
  }

  /**
   * Get recently added patients
   */
  async getRecentPatients(limit = 5): Promise<any[]> {
    return Patient.find({}).populate("user", "-password -totpSecret").sort({ createdAt: -1 }).limit(limit)
  }
}

export default new PatientRepository()

