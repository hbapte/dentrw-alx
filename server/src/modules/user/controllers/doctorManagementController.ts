//server\src\modules\user\controllers\doctorManagementController.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import doctorRepository from "../repositories/doctorRepository"
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  validationErrorResponse,
  databaseErrorResponse,
  conflictResponse,
} from "../../../utils/api-response"
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

  try {
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

    // Validate numeric parameters
    const validationErrors: Record<string, string> = {}

    if (minExperience && isNaN(options.minExperience!)) {
      validationErrors.minExperience = "Must be a valid number"
    }

    if (maxExperience && isNaN(options.maxExperience!)) {
      validationErrors.maxExperience = "Must be a valid number"
    }

    if (minRating && isNaN(options.minRating!)) {
      validationErrors.minRating = "Must be a valid number"
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(res, "Invalid query parameters", validationErrors, {
        help: "Please provide valid numeric values for experience and rating filters.",
        startTime: req.startTime,
      })
    }

    const result = await doctorRepository.findDoctors(options)

    // Create pagination metadata
    const pagination = {
      page: result.page,
      pageSize: result.limit,
      totalItems: result.total,
      totalPages: result.pages,
      hasNextPage: result.page < result.pages,
      hasPreviousPage: result.page > 1,
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=60" // Cache for 1 minute

    // Generate warnings if applicable
    const warnings: string[] = []
    if (result.doctors.length === 0) {
      warnings.push("No doctors match your search criteria.")
    }

    if (options.minExperience && options.maxExperience && options.minExperience > options.maxExperience) {
      warnings.push("minExperience is greater than maxExperience, which may yield unexpected results.")
    }

    return successResponse(res, result.doctors, "Doctors retrieved successfully", {
      startTime: req.startTime,
      pagination,
      cacheControl,
      warnings: warnings.length > 0 ? warnings : undefined,
      links: {
        documentation: "/docs/api/doctors",
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve doctors", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Get doctor by ID
 */
export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!id) {
      return badRequestResponse(res, "Doctor ID is required", null, {
        help: "Please provide a valid doctor ID in the URL path.",
        startTime: req.startTime,
      })
    }

    const doctor = await doctorRepository.findById(id)

    if (!doctor) {
      return notFoundResponse(res, "Doctor not found", {
        help: "Check if the doctor ID is correct or the doctor might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=300" // Cache for 5 minutes

    return successResponse(res, { doctor }, "Doctor retrieved successfully", {
      startTime: req.startTime,
      cacheControl,
      links: {
        self: `/api/doctors/${id}`,
        ratings: `/api/doctors/${id}/ratings`,
        availability: `/api/doctors/${id}/availability`,
        documentation: "/docs/api/doctors/details",
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve doctor", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Update doctor profile
 */
export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { specialization, qualifications, experience, licenseNumber, bio, languages, consultationFee, availability } =
    req.body

  try {
    // Check if doctor exists
    const doctor = await doctorRepository.findById(id)
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found", {
        help: "Check if the doctor ID is correct or the doctor might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Validate input data
    const validationErrors: Record<string, string> = {}

    if (experience !== undefined && (isNaN(experience) || experience < 0)) {
      validationErrors.experience = "Experience must be a non-negative number"
    }

    if (consultationFee !== undefined && (isNaN(consultationFee) || consultationFee < 0)) {
      validationErrors.consultationFee = "Consultation fee must be a non-negative number"
    }

    if (languages && !Array.isArray(languages)) {
      validationErrors.languages = "Languages must be an array"
    }

    if (qualifications && !Array.isArray(qualifications)) {
      validationErrors.qualifications = "Qualifications must be an array"
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(res, "Invalid input data", validationErrors, {
        help: "Please provide valid values for all fields.",
        startTime: req.startTime,
      })
    }

    // Update doctor
  
    const updateData: any = {}
    if (specialization) updateData.specialization = specialization
    if (qualifications) updateData.qualifications = qualifications
    if (experience !== undefined) updateData.experience = experience
    if (licenseNumber) updateData.licenseNumber = licenseNumber
    if (bio) updateData.bio = bio
    if (languages) updateData.languages = languages
    if (consultationFee !== undefined) updateData.consultationFee = consultationFee
    if (availability) updateData.availability = availability

    // Check if any fields were actually updated
    if (Object.keys(updateData).length === 0) {
      return successResponse(res, { doctor }, "No changes made to doctor profile", {
        startTime: req.startTime,
        warnings: ["No fields were updated. Request body contained no valid update fields."],
      })
    }

    const updatedDoctor = await doctorRepository.updateDoctor(id, updateData)

    // Log the action
    await logAction(req, "update_doctor", "doctor", id, { updatedFields: Object.keys(updateData) })

    return successResponse(res, { doctor: updatedDoctor }, "Doctor updated successfully", {
      startTime: req.startTime,
      links: {
        self: `/api/doctors/${id}`,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update doctor", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Add a rating to a doctor
 */
export const addDoctorRating = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { patientId, rating, review } = req.body

  try {
    // Validate required fields
    if (!patientId) {
      return validationErrorResponse(
        res,
        "Patient ID is required",
        { patientId: "This field is required" },
        {
          help: "Please provide the ID of the patient giving the rating.",
          startTime: req.startTime,
        },
      )
    }

    if (!rating) {
      return validationErrorResponse(
        res,
        "Rating is required",
        { rating: "This field is required" },
        {
          help: "Please provide a rating between 1 and 5.",
          startTime: req.startTime,
        },
      )
    }

    // Validate rating value
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return validationErrorResponse(
        res,
        "Invalid rating value",
        { rating: "Must be a number between 1 and 5" },
        {
          help: "Please provide a rating between 1 and 5.",
          startTime: req.startTime,
        },
      )
    }

    // Check if doctor exists
    const doctor = await doctorRepository.findById(id)
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found", {
        help: "Check if the doctor ID is correct or the doctor might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if patient has already rated this doctor
    const existingRating = doctor.ratings?.find((r) => r.patientId.toString() === patientId.toString())
    if (existingRating) {
      return conflictResponse(
        res,
        "Patient has already rated this doctor",
        { existingRating },
        {
          help: "A patient can only submit one rating per doctor. You can update the existing rating instead.",
          startTime: req.startTime,
        },
      )
    }

    // Add rating
    const updatedDoctor = await doctorRepository.addRating(id, patientId, rating, review || "")

    // Log the action
    await logAction(req, "add_doctor_rating", "doctor", id, { patientId, rating, review })

    return successResponse(res, { doctor: updatedDoctor }, "Rating added successfully", {
      startTime: req.startTime,
      links: {
        doctor: `/api/doctors/${id}`,
        patient: `/api/patients/${patientId}`,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to add rating", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Get doctor statistics
 */
export const getDoctorStats = asyncHandler(async (req: Request, res: Response) => {
  try {
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

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=300" // Cache for 5 minutes

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
      {
        startTime: req.startTime,
        cacheControl,
        links: {
          documentation: "/docs/api/doctors/statistics",
          doctors: "/api/doctors",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve doctor statistics", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Delete doctor by ID
 */
export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Check if doctor exists
    const doctor = await doctorRepository.findById(id)
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found", {
        help: "Check if the doctor ID is correct or the doctor might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if doctor has active appointments
    // This is just an example - implement according to your actual data model
    const hasActiveAppointments = false // await appointmentRepository.hasDoctorAppointments(id);

    if (hasActiveAppointments) {
      return conflictResponse(
        res,
        "Cannot delete doctor with active appointments",
        { hasActiveAppointments },
        {
          help: "Cancel or reschedule all active appointments before deleting the doctor.",
          startTime: req.startTime,
        },
      )
    }

    // Delete doctor
    await doctorRepository.deleteDoctor(id)

    // Log the action
    await logAction(req, "delete_doctor", "doctor", id)

    return successResponse(res, null, "Doctor deleted successfully", {
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to delete doctor", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Create a new doctor
 */
export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { specialization, qualifications, experience, licenseNumber, bio, languages, consultationFee, availability } =
    req.body

  try {
    // Validate required fields
    if (!req.user || !req.user.userId) {
      return validationErrorResponse(res, "User information is required", null, {
        help: "Authentication is required to create a doctor profile.",
        startTime: req.startTime,
      })
    }

    // Validate input data
    const validationErrors: Record<string, string> = {}

    if (!specialization) {
      validationErrors.specialization = "Specialization is required"
    }

    if (experience !== undefined && (isNaN(experience) || experience < 0)) {
      validationErrors.experience = "Experience must be a non-negative number"
    }

    if (consultationFee !== undefined && (isNaN(consultationFee) || consultationFee < 0)) {
      validationErrors.consultationFee = "Consultation fee must be a non-negative number"
    }

    if (languages && !Array.isArray(languages)) {
      validationErrors.languages = "Languages must be an array"
    }

    if (qualifications && !Array.isArray(qualifications)) {
      validationErrors.qualifications = "Qualifications must be an array"
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(res, "Invalid input data", validationErrors, {
        help: "Please provide valid values for all fields.",
        startTime: req.startTime,
      })
    }

    // Check if doctor profile already exists for this user
    const existingDoctor = await doctorRepository.findByUserId(req.user.userId)
    if (existingDoctor) {
      return conflictResponse(
        res,
        "Doctor profile already exists for this user",
        { doctorId: existingDoctor._id },
        {
          help: "Update the existing doctor profile instead of creating a new one.",
          startTime: req.startTime,
        },
      )
    }

    // Create doctor
    const doctorData = {
      user: req.user.userId,
      specialization: specialization || "General Dentistry",
      qualifications: qualifications || [],
      experience: experience || 0,
      licenseNumber: licenseNumber || "TBD",
      bio: bio || "",
      languages: languages || ["English"],
      consultationFee: consultationFee || 0,
      availability: availability || [],
    }

    const newDoctor = await doctorRepository.createDoctor(doctorData)

    // Log the action
    await logAction(req, "create_doctor", "doctor", newDoctor._id.toString())

    return successResponse(res, { doctor: newDoctor }, "Doctor created successfully", {
      statusCode: 201, // Created
      startTime: req.startTime,
      links: {
        self: `/api/doctors/${newDoctor._id}`,
        user: `/api/users/${req.user.userId}`,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to create doctor", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})
