import type { Request, Response } from "express"
import patientRepository from "../repositories/patientRepository"
import { successResponse, notFoundResponse } from "../../../utils/responseHandler"
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

  const result = await patientRepository.findPatients(options)

  return successResponse(res, result, "Patients retrieved successfully")
})

/**
 * Get patient by ID
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const patient = await patientRepository.findById(id)

  if (!patient) {
    return notFoundResponse(res, "Patient not found")
  }

  return successResponse(res, { patient }, "Patient retrieved successfully")
})

/**
 * Update patient profile
 */
export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo } = req.body

  // Check if patient exists
  const patient = await patientRepository.findById(id)
  if (!patient) {
    return notFoundResponse(res, "Patient not found")
  }

  // Update patient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return successResponse(res, { patient: updatedPatient }, "Patient updated successfully")
})

/**
 * Get patient statistics
 */
export const getPatientStats = asyncHandler(async (req: Request, res: Response) => {
  // Get total count
  const totalPatients = await patientRepository.countPatients()

  // Get gender distribution
  const genderDistribution = await patientRepository.countByGender()

  // Get recent patients
  const recentPatients = await patientRepository.getRecentPatients(5)

  return successResponse(
    res,
    {
      totalPatients,
      genderDistribution,
      recentPatients,
    },
    "Patient statistics retrieved successfully",
  )
})

