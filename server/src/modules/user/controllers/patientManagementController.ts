// server\src\modules\user\controllers\patientManagementController.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"


declare module "express-serve-static-core" {
  interface Request {
    startTime?: number;
  }
}

import patientRepository from "../repositories/patientRepository"
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  badRequestResponse,
  databaseErrorResponse,
  conflictResponse,
} from "../../../utils/api-response"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"

/**
 * Get all patients with pagination and filtering
 */
export const getAllPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", search = "", gender } = req.query

  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    search: search as string,
    gender: gender as "male" | "female" | "other" | undefined,
  }

  try {
    const result = await patientRepository.findPatients(options)

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

    return successResponse(res, result.patients, "Patients retrieved successfully", {
      startTime: req.startTime,
      pagination,
      cacheControl,
      // Add warnings if applicable
      warnings: result.patients.length === 0 ? ["No patients match your search criteria."] : undefined,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve patients", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Get patient by ID
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) {
    return badRequestResponse(res, "Patient ID is required", null, {
      help: "Please provide a valid patient ID in the URL path.",
      startTime: req.startTime,
    })
  }

  try {
    const patient = await patientRepository.findById(id)

    if (!patient) {
      return notFoundResponse(res, "Patient not found", {
        help: "Check if the patient ID is correct or the patient might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=300" // Cache for 5 minutes

    return successResponse(res, { patient }, "Patient retrieved successfully", {
      startTime: req.startTime,
      cacheControl,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve patient", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Update patient profile
 */
export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo } = req.body

  try {
    // Check if patient exists
    const patient = await patientRepository.findById(id)
    if (!patient) {
      return notFoundResponse(res, "Patient not found", {
        help: "Check if the patient ID is correct or the patient might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Validate input data
    if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
      return validationErrorResponse(
        res,
        "Invalid date of birth format",
        { dateOfBirth },
        {
          help: "Date of birth should be in ISO format (YYYY-MM-DD).",
          startTime: req.startTime,
        },
      )
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return validationErrorResponse(
        res,
        "Invalid gender value",
        { gender },
        {
          help: "Gender must be one of: male, female, other.",
          startTime: req.startTime,
        },
      )
    }

    // Update patient
    const updateData: any = {}
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
    if (gender) updateData.gender = gender
    if (address) updateData.address = { ...patient.address, ...address }
    if (emergencyContact) updateData.emergencyContact = { ...patient.emergencyContact, ...emergencyContact }
    if (medicalHistory) updateData.medicalHistory = { ...patient.medicalHistory, ...medicalHistory }
    if (insuranceInfo) updateData.insuranceInfo = { ...patient.insuranceInfo, ...insuranceInfo }

    const updatedPatient = await patientRepository.updatePatient(id, updateData)

    // Log the action
    await logAction(req, "update_patient", "patient", id, { updatedFields: Object.keys(updateData) })

    // Check if any fields were actually updated
    const warnings =
      Object.keys(updateData).length === 0
        ? ["No fields were updated. Request body contained no valid update fields."]
        : undefined

    return successResponse(res, { patient: updatedPatient }, "Patient updated successfully", {
      startTime: req.startTime,
      warnings,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update patient", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Get patient statistics
 */
export const getPatientStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get total count
    const totalPatients = await patientRepository.countPatients()

    // Get gender distribution
    const genderDistribution = await patientRepository.countByGender()

    // Get recent patients
    const recentPatients = await patientRepository.getRecentPatients(5)

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=300" // Cache for 5 minutes

    return successResponse(
      res,
      {
        totalPatients,
        genderDistribution,
        recentPatients,
      },
      "Patient statistics retrieved successfully",
      {
        startTime: req.startTime,
        cacheControl,
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve patient statistics", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Delete patient by ID
 */
export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Check if patient exists
    const patient = await patientRepository.findById(id)
    if (!patient) {
      return notFoundResponse(res, "Patient not found", {
        help: "Check if the patient ID is correct or the patient might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if patient has active appointments
    // This is just an example - implement according to your actual data model
    const hasActiveAppointments = false // await appointmentRepository.hasActiveAppointments(id);

    if (hasActiveAppointments) {
      return conflictResponse(
        res,
        "Cannot delete patient with active appointments",
        { hasActiveAppointments },
        {
          help: "Cancel or reschedule all active appointments before deleting the patient.",
          startTime: req.startTime,
        },
      )
    }

    // Delete patient
    await patientRepository.deletePatient(id)

    // Log the action
    await logAction(req, "delete_patient", "patient", id)

    return successResponse(res, null, "Patient deleted successfully", {
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to delete patient", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Create a new patient
 */
export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo } = req.body

  try {
    // Validate required fields
    if (!req.user || !req.user.userId) {
      return validationErrorResponse(res, "User information is required", null, {
        help: "Authentication is required to create a patient.",
        startTime: req.startTime,
      })
    }

    // Validate input data
    if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
      return validationErrorResponse(
        res,
        "Invalid date of birth format",
        { dateOfBirth },
        {
          help: "Date of birth should be in ISO format (YYYY-MM-DD).",
          startTime: req.startTime,
        },
      )
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return validationErrorResponse(
        res,
        "Invalid gender value",
        { gender },
        {
          help: "Gender must be one of: male, female, other.",
          startTime: req.startTime,
        },
      )
    }

    // Check if patient already exists for this user
    const existingPatient = await patientRepository.findByUserId(req.user.userId)
    if (existingPatient) {
      return conflictResponse(
        res,
        "Patient record already exists for this user",
        { patientId: existingPatient._id },
        {
          help: "Update the existing patient record instead of creating a new one.",
          startTime: req.startTime,
        },
      )
    }

    // Create patient data
    const patientData = {
      user: req.user.userId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      emergencyContact,
      medicalHistory,
      insuranceInfo,
    }

    // Save patient to the database
    const newPatient = await patientRepository.createPatient(patientData)

    // Log the action
    await logAction(req, "create_patient", "patient", newPatient._id.toString())

    return successResponse(res, { patient: newPatient }, "Patient created successfully", {
      statusCode: 201, // Created
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to create patient", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})
