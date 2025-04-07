/* eslint-disable @typescript-eslint/no-explicit-any */
import Doctor from "../../../database/models/doctor"
import User from "../../../database/models/user"
import { Types } from "mongoose"

interface DoctorQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  specialization?: string
  minExperience?: number
  maxExperience?: number
  language?: string
  minRating?: number
}

class DoctorRepository {
  /**
   * Find a doctor by ID
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return Doctor.findById(id).populate("user", "-password -totpSecret")
  }

  /**
   * Find a doctor by user ID
   */
  async findByUserId(userId: string | Types.ObjectId): Promise<any> {
    return Doctor.findOne({ user: userId }).populate("user", "-password -totpSecret")
  }

  /**
   * Find doctors with pagination and filtering
   */
  async findDoctors(
    options: DoctorQueryOptions = {},
  ): Promise<{ doctors: any[]; total: number; page: number; limit: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      specialization,
      minExperience,
      maxExperience,
      language,
      minRating,
    } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    // Add filters
    if (specialization) query.specialization = specialization
    if (minExperience !== undefined) query.experience = { $gte: minExperience }
    if (maxExperience !== undefined) {
      if (query.experience) {
        query.experience.$lte = maxExperience
      } else {
        query.experience = { $lte: maxExperience }
      }
    }
    if (language) query.languages = language
    if (minRating !== undefined) query.averageRating = { $gte: minRating }

    // Get all doctors matching the query
    let doctors

    if (search) {
      // If search is provided, we need to search in the User model first
      const userIds = await User.find({
        $or: [
          { names: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
        role: "doctor",
      }).distinct("_id")

      // Then find doctors with those user IDs
      query.user = { $in: userIds }
      doctors = await Doctor.find(query)
        .populate("user", "-password -totpSecret")
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)

      // Count total
      const total = await Doctor.countDocuments(query)

      return {
        doctors,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    } else {
      // If no search, just query the Doctor model directly
      doctors = await Doctor.find(query)
        .populate("user", "-password -totpSecret")
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)

      // Count total
      const total = await Doctor.countDocuments(query)

      return {
        doctors,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    }
  }

  /**
   * Create a new doctor
   */
  async createDoctor(doctorData: any): Promise<any> {
    const doctor = new Doctor(doctorData)
    return doctor.save()
  }

  /**
   * Update a doctor
   */
  async updateDoctor(id: string | Types.ObjectId, updateData: any): Promise<any> {
    return Doctor.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).populate(
      "user",
      "-password -totpSecret",
    )
  }

  /**
   * Delete a doctor
   */
  async deleteDoctor(id: string | Types.ObjectId): Promise<any> {
    return Doctor.findByIdAndDelete(id)
  }

  /**
   * Count doctors
   */
  async countDoctors(): Promise<number> {
    return Doctor.countDocuments({})
  }

  /**
   * Count doctors by specialization
   */
  async countBySpecialization(): Promise<Record<string, number>> {
    const specializations = await Doctor.aggregate([
      { $group: { _id: "$specialization", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const result: Record<string, number> = {}
    specializations.forEach((item: any) => {
      result[item._id] = item.count
    })

    return result
  }

  /**
   * Get top rated doctors
   */
  async getTopRatedDoctors(limit = 5): Promise<any[]> {
    return Doctor.find({ averageRating: { $gt: 0 } })
      .populate("user", "-password -totpSecret")
      .sort({ averageRating: -1 })
      .limit(limit)
  }

  /**
   * Get recently added doctors
   */
  async getRecentDoctors(limit = 5): Promise<any[]> {
    return Doctor.find({}).populate("user", "-password -totpSecret").sort({ createdAt: -1 }).limit(limit)
  }

  /**
   * Add a rating to a doctor
   */
  async addRating(
    doctorId: string | Types.ObjectId,
    patientId: string | Types.ObjectId,
    rating: number,
    review: string,
  ): Promise<any> {
    const doctor = await Doctor.findById(doctorId)

    if (!doctor) {
      throw new Error("Doctor not found")
    }

    // Add the new rating
    doctor.ratings.push({
      rating,
      review,
      patient: new Types.ObjectId(patientId.toString()),
      date: new Date(),
    })

    // Calculate new average rating
    const totalRatings = doctor.ratings.reduce((sum, item) => sum + item.rating, 0)
    doctor.averageRating = totalRatings / doctor.ratings.length

    return doctor.save()
  }

  /**
   * Get all specializations
   */
  async getAllSpecializations(): Promise<string[]> {
    const specializations = await Doctor.distinct("specialization")
    return specializations
  }

  /**
   * Get all languages
   */
  async getAllLanguages(): Promise<string[]> {
    const languages = await Doctor.distinct("languages")
    return languages.flat()
  }
}

export default new DoctorRepository()

