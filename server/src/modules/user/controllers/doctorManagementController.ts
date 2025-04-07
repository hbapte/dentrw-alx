import type { Request, Response } from "express"
import doctorRepository from "../repositories/doctorRepository"
import { successResponse, notFoundResponse, badRequestResponse } from "../../../utils/responseHandler"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"

/**
 * Get all doctors with pagination and filtering
 */
export const getAllDoctors = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
    search = "",
    specialization,
    minExperience,
    maxExperience,
    language,
    minRating,
  } = req.query

  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    search: search as string,
    specialization: specialization as string,
    minExperience: minExperience ? Number.parseInt(minExperience as string) : undefined,
    maxExperience: maxExperience ? Number.parseInt(maxExperience as string) : undefined,
    language: language as string,
    minRating: minRating ? Number.parseFloat(minRating as string) : undefined,
  }

  const result = await doctorRepository.findDoctors(options)

  return successResponse(res, result, "Doctors retrieved successfully")
})

/**
 * Get doctor by ID
 */
export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const doctor = await doctorRepository.findById(id)

  if (!doctor) {
    return notFoundResponse(res, "Doctor not found")
  }

  return successResponse(res, { doctor }, "Doctor retrieved successfully")
})

/**
 * Update doctor profile
 */
export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { specialization, qualifications, experience, licenseNumber, bio, languages, consultationFee, availability } =
    req.body

  // Check if doctor exists
  const doctor = await doctorRepository.findById(id)
  if (!doctor) {
    return notFoundResponse(res, "Doctor not found")
  }

  // Update doctor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}
  if (specialization) updateData.specialization = specialization
  if (qualifications) updateData.qualifications = qualifications
  if (experience !== undefined) updateData.experience = experience
  if (licenseNumber) updateData.licenseNumber = licenseNumber
  if (bio) updateData.bio = bio
  if (languages) updateData.languages = languages
  if (consultationFee !== undefined) updateData.consultationFee = consultationFee
  if (availability) updateData.availability = availability

  const updatedDoctor = await doctorRepository.updateDoctor(id, updateData)

  // Log the action
  await logAction(req, "update_doctor", "doctor", id, { updatedFields: Object.keys(updateData) })

  return successResponse(res, { doctor: updatedDoctor }, "Doctor updated successfully")
})

/**
 * Add a rating to a doctor
 */
export const addDoctorRating = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { patientId, rating, review } = req.body

  if (!patientId || !rating || rating < 1 || rating > 5) {
    return badRequestResponse(res, "Patient ID and valid rating (1-5) are required")
  }

  // Check if doctor exists
  const doctor = await doctorRepository.findById(id)
  if (!doctor) {
    return notFoundResponse(res, "Doctor not found")
  }

  // Add rating
  const updatedDoctor = await doctorRepository.addRating(id, patientId, rating, review || "")

  // Log the action
  await logAction(req, "add_doctor_rating", "doctor", id, { patientId, rating, review })

  return successResponse(res, { doctor: updatedDoctor }, "Rating added successfully")
})

/**
 * Get doctor statistics
 */
export const getDoctorStats = asyncHandler(async (req: Request, res: Response) => {
  // Get total count
  const totalDoctors = await doctorRepository.countDoctors()

  // Get specialization distribution
  const specializationDistribution = await doctorRepository.countBySpecialization()

  // Get top rated doctors
  const topRatedDoctors = await doctorRepository.getTopRatedDoctors(5)

  // Get recent doctors
  const recentDoctors = await doctorRepository.getRecentDoctors(5)

  // Get all specializations
  const specializations = await doctorRepository.getAllSpecializations()

  // Get all languages
  const languages = await doctorRepository.getAllLanguages()

  return successResponse(
    res,
    {
      totalDoctors,
      specializationDistribution,
      topRatedDoctors,
      recentDoctors,
      specializations,
      languages,
    },
    "Doctor statistics retrieved successfully",
  )
})

