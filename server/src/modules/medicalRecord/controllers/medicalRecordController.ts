import type { Request, Response } from "express"
import httpStatus from "http-status"
import medicalRecordRepository from "../repositories/medicalRecordRepository"
import appointmentRepository from "../../appointments/repositories/appointmentRepository"
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from "../../../utils/responseHandler"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"

/**
 * Get all medical records with pagination and filtering
 */
export const getAllMedicalRecords = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
    doctorId,
    patientId,
    appointmentId,
    startDate,
    endDate,
    followUpRequired,
  } = req.query

  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    doctorId: doctorId as string,
    patientId: patientId as string,
    appointmentId: appointmentId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    followUpRequired: followUpRequired === "true" ? true : followUpRequired === "false" ? false : undefined,
  }

  const result = await medicalRecordRepository.findMedicalRecords(options)

  return successResponse(res, result, "Medical records retrieved successfully")
})

/**
 * Get medical record by ID
 */
export const getMedicalRecordById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const medicalRecord = await medicalRecordRepository.findById(id)

  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  return successResponse(res, { medicalRecord }, "Medical record retrieved successfully")
})

/**
 * Create a new medical record
 */
export const createMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
  const {
    patientId,
    doctorId,
    appointmentId,
    diagnosis,
    treatment,
    prescription,
    notes,
    followUpRequired,
    followUpDate,
  } = req.body

  // Validate required fields
  if (!patientId || !doctorId || !appointmentId || !diagnosis || !treatment) {
    return badRequestResponse(res, "Missing required fields")
  }

  // Check if appointment exists
  const appointment = await appointmentRepository.findById(appointmentId)
  if (!appointment) {
    return notFoundResponse(res, "Appointment not found")
  }

  // Check if appointment belongs to the specified patient and doctor
  if (appointment.patient.toString() !== patientId || appointment.doctor.toString() !== doctorId) {
    return badRequestResponse(res, "Appointment does not match the specified patient and doctor")
  }

  // Create medical record
  const medicalRecordData = {
    patient: patientId,
    doctor: doctorId,
    appointment: appointmentId,
    diagnosis,
    treatment,
    prescription: prescription || [],
    notes: notes || "",
    followUpRequired: followUpRequired || false,
    followUpDate: followUpRequired && followUpDate ? new Date(followUpDate) : undefined,
  }

  const newMedicalRecord = await medicalRecordRepository.createMedicalRecord(medicalRecordData)

  // Update appointment status to completed
  await appointmentRepository.changeAppointmentStatus(appointmentId, "completed")

  // Log the action
  await logAction(req, "create_medical_record", "medicalRecord", newMedicalRecord._id.toString(), {
    patientId,
    doctorId,
    appointmentId,
  })

  return successResponse(
    res,
    { medicalRecord: newMedicalRecord },
    "Medical record created successfully",
    httpStatus.CREATED,
  )
})

/**
 * Update a medical record
 */
export const updateMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { diagnosis, treatment, notes, followUpRequired, followUpDate } = req.body

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Update medical record
  const updateData: any = {}
  if (diagnosis) updateData.diagnosis = diagnosis
  if (treatment) updateData.treatment = treatment
  if (notes !== undefined) updateData.notes = notes
  if (followUpRequired !== undefined) updateData.followUpRequired = followUpRequired

  // Only update followUpDate if followUpRequired is true
  if (followUpRequired && followUpDate) {
    updateData.followUpDate = new Date(followUpDate)
  } else if (followUpRequired === false) {
    updateData.followUpDate = null
  }

  const updatedMedicalRecord = await medicalRecordRepository.updateMedicalRecord(id, updateData)

  // Log the action
  await logAction(req, "update_medical_record", "medicalRecord", id, { updatedFields: Object.keys(updateData) })

  return successResponse(res, { medicalRecord: updatedMedicalRecord }, "Medical record updated successfully")
})

/**
 * Delete a medical record
 */
export const deleteMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Delete medical record
  await medicalRecordRepository.deleteMedicalRecord(id)

  // Log the action
  await logAction(req, "delete_medical_record", "medicalRecord", id)

  return successResponse(res, null, "Medical record deleted successfully")
})

/**
 * Add a prescription to a medical record
 */
export const addPrescription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { medication, dosage, frequency, duration, notes } = req.body

  // Validate required fields
  if (!medication || !dosage || !frequency || !duration) {
    return badRequestResponse(res, "Missing required prescription fields")
  }

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Add prescription
  const prescriptionData = {
    medication,
    dosage,
    frequency,
    duration,
    notes: notes || "",
  }

  const updatedMedicalRecord = await medicalRecordRepository.addPrescription(id, prescriptionData)

  // Log the action
  await logAction(req, "add_prescription", "medicalRecord", id, { medication, dosage })

  return successResponse(res, { medicalRecord: updatedMedicalRecord }, "Prescription added successfully")
})

/**
 * Update a prescription in a medical record
 */
export const updatePrescription = asyncHandler(async (req: Request, res: Response) => {
  const { id, prescriptionId } = req.params
  const { medication, dosage, frequency, duration, notes } = req.body

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Update prescription
  const prescriptionData: any = {}
  if (medication) prescriptionData.medication = medication
  if (dosage) prescriptionData.dosage = dosage
  if (frequency) prescriptionData.frequency = frequency
  if (duration) prescriptionData.duration = duration
  if (notes !== undefined) prescriptionData.notes = notes

  try {
    const updatedMedicalRecord = await medicalRecordRepository.updatePrescription(id, prescriptionId, prescriptionData)

    // Log the action
    await logAction(req, "update_prescription", "medicalRecord", id, {
      prescriptionId,
      updatedFields: Object.keys(prescriptionData),
    })

    return successResponse(res, { medicalRecord: updatedMedicalRecord }, "Prescription updated successfully")
  } catch (error: any) {
    return errorResponse(res, error.message, httpStatus.BAD_REQUEST)
  }
})

/**
 * Remove a prescription from a medical record
 */
export const removePrescription = asyncHandler(async (req: Request, res: Response) => {
  const { id, prescriptionId } = req.params

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Remove prescription
  const updatedMedicalRecord = await medicalRecordRepository.removePrescription(id, prescriptionId)

  // Log the action
  await logAction(req, "remove_prescription", "medicalRecord", id, { prescriptionId })

  return successResponse(res, { medicalRecord: updatedMedicalRecord }, "Prescription removed successfully")
})

/**
 * Add an attachment to a medical record
 */
export const addAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, fileUrl, fileType } = req.body

  // Validate required fields
  if (!name || !fileUrl || !fileType) {
    return badRequestResponse(res, "Missing required attachment fields")
  }

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Add attachment
  const attachmentData = {
    name,
    fileUrl,
    fileType,
  }

  const updatedMedicalRecord = await medicalRecordRepository.addAttachment(id, attachmentData)

  // Log the action
  await logAction(req, "add_attachment", "medicalRecord", id, { name, fileType })

  return successResponse(res, { medicalRecord: updatedMedicalRecord }, "Attachment added successfully")
})

/**
 * Remove an attachment from a medical record
 */
export const removeAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { id, attachmentId } = req.params

  // Check if medical record exists
  const medicalRecord = await medicalRecordRepository.findById(id)
  if (!medicalRecord) {
    return notFoundResponse(res, "Medical record not found")
  }

  // Remove attachment
  const updatedMedicalRecord = await medicalRecordRepository.removeAttachment(id, attachmentId)

  // Log the action
  await logAction(req, "remove_attachment", "medicalRecord", id, { attachmentId })

  return successResponse(res, { medicalRecord: updatedMedicalRecord }, "Attachment removed successfully")
})

/**
 * Get patient medical history
 */
export const getPatientMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params

  const medicalHistory = await medicalRecordRepository.getPatientMedicalHistory(patientId)

  return successResponse(res, { medicalHistory }, "Patient medical history retrieved successfully")
})

/**
 * Get records that need follow-up
 */
export const getFollowUpRecords = asyncHandler(async (req: Request, res: Response) => {
  const { daysAhead = "7" } = req.query

  const records = await medicalRecordRepository.getFollowUpRecords(Number.parseInt(daysAhead as string))

  return successResponse(res, { records }, "Follow-up records retrieved successfully")
})

/**
 * Get medical record statistics
 */
export const getMedicalRecordStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await medicalRecordRepository.getMedicalRecordStats()
  return successResponse(res, stats, "Medical record statistics retrieved successfully")
})

