// client\src\utils\medical-record.utils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MedicalRecord, MedicalRecordFormData, Prescription } from "../types/medical-record.types"
import { formatDate } from "./date-utils"
import { getPatientFullName } from "./patient.utils"
import { getDoctorFullName } from "./doctor.utils"

/**
 * Formats a medical record for display
 */
export const formatMedicalRecord = (record: MedicalRecord): any => {
  const patientName = typeof record.patient === "object" ? getPatientFullName(record.patient) : "Unknown Patient"
  const doctorName = typeof record.doctor === "object" ? getDoctorFullName(record.doctor) : "Unknown Doctor"

  return {
    ...record,
    patientName,
    doctorName,
    formattedDate: formatDate(record.createdAt),
    formattedFollowUpDate: record.followUpDate ? formatDate(record.followUpDate) : null,
  }
}

/**
 * Converts a medical record object to form data for editing
 */
export const recordToFormData = (record: MedicalRecord): MedicalRecordFormData => {
  return {
    patientId:
      typeof record.patient === "object"
        ? record.patient.id || record.patient._id?.toString() || ""
        : record.patient?.toString() || "",
    doctorId:
      typeof record.doctor === "object"
        ? record.doctor.id || record.doctor._id?.toString() || ""
        : record.doctor?.toString() || "",
    appointmentId:
      typeof record.appointment === "object" && record.appointment !== null
        ? String(record.appointment)
        : record.appointment?.toString() || "",
    diagnosis: record.diagnosis || "",
    treatment: record.treatment || "",
    notes: record.notes || "",
    followUpRequired: record.followUpRequired || false,
    followUpDate: record.followUpDate || "",
    prescription: record.prescription || [],
  }
}

/**
 * Formats form data for API submission
 */
export const formatMedicalRecordFormData = (formData: Partial<MedicalRecordFormData>): any => {
  return {
    patient: formData.patientId,
    doctor: formData.doctorId,
    appointment: formData.appointmentId,
    diagnosis: formData.diagnosis,
    treatment: formData.treatment,
    notes: formData.notes,
    followUpRequired: formData.followUpRequired,
    followUpDate: formData.followUpRequired ? formData.followUpDate : null,
    prescription: formData.prescription,
  }
}

/**
 * Creates a new empty prescription
 */
export const createEmptyPrescription = (): Prescription => {
  return {
    id: Math.random().toString(36).substring(2, 9),
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  }
}

/**
 * Gets the file icon based on file type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes("image")) return "image"
  if (fileType.includes("pdf")) return "file-text"
  if (fileType.includes("word") || fileType.includes("document")) return "file-text"
  if (fileType.includes("excel") || fileType.includes("sheet")) return "file-spreadsheet"
  if (fileType.includes("video")) return "video"
  if (fileType.includes("audio")) return "music"
  return "file"
}

/**
 * Gets the file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Checks if a follow-up is due soon (within 7 days)
 */
export const isFollowUpDueSoon = (followUpDate?: string): boolean => {
  if (!followUpDate) return false

  const today = new Date()
  const followUp = new Date(followUpDate)
  const diffTime = followUp.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= 7
}

/**
 * Checks if a follow-up is overdue
 */
export const isFollowUpOverdue = (followUpDate?: string): boolean => {
  if (!followUpDate) return false

  const today = new Date()
  const followUp = new Date(followUpDate)

  return followUp < today
}

/**
 * Gets the status of a medical record
 */
export const getMedicalRecordStatus = (
  record: MedicalRecord,
): "completed" | "follow-up-required" | "follow-up-due-soon" | "follow-up-overdue" => {
  if (!record.followUpRequired) return "completed"
  if (isFollowUpOverdue(record.followUpDate)) return "follow-up-overdue"
  if (isFollowUpDueSoon(record.followUpDate)) return "follow-up-due-soon"
  return "follow-up-required"
}

/**
 * Gets the color for a medical record status
 */
export const getStatusColor = (
  status: "completed" | "follow-up-required" | "follow-up-due-soon" | "follow-up-overdue",
): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "follow-up-required":
      return "bg-blue-100 text-blue-800"
    case "follow-up-due-soon":
      return "bg-yellow-100 text-yellow-800"
    case "follow-up-overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Gets the label for a medical record status
 */
export const getStatusLabel = (
  status: "completed" | "follow-up-required" | "follow-up-due-soon" | "follow-up-overdue",
): string => {
  switch (status) {
    case "completed":
      return "Completed"
    case "follow-up-required":
      return "Follow-up Required"
    case "follow-up-due-soon":
      return "Follow-up Due Soon"
    case "follow-up-overdue":
      return "Follow-up Overdue"
    default:
      return "Unknown"
  }
}
