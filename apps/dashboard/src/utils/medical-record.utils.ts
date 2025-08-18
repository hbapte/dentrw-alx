// client\src\utils\medical-record.utils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MedicalRecord, MedicalRecordFormData, Prescription } from "../types/medical-record.types"
// import { getPatientFullName } from "./patient.utils"
import { getDoctorFullName } from "./doctor.utils"
import { formatDate } from "./format-utils"


// export const formatMedicalRecordFormData = (data: Partial<MedicalRecordFormData>) => {
//   return {
//     ...data,
//     followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : undefined,
//   }
// }

export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}


export const getAppointmentTypeBadgeColor = (type: string) => {
  switch (type) {
    case "emergency":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "treatment":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "follow-up":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "consultation":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "checkup":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export const getFollowUpBadgeColor = (required: boolean) => {
  return required
    ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
    : "bg-green-100 text-green-800 hover:bg-green-200"
}

export const getRiskBadgeColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "high":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "moderate":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "low":
    default:
      return "bg-green-100 text-green-800 hover:bg-green-200"
  }
}




export const getPrescriptionSummary = (prescriptions: any[]): string => {
  if (!prescriptions || prescriptions.length === 0) return "No prescriptions"

  if (prescriptions.length === 1) {
    return prescriptions[0].medication
  }

  return `${prescriptions[0].medication} +${prescriptions.length - 1} more`
}

export const exportMedicalRecords = (records: MedicalRecord[], format: "csv" | "excel" | "pdf") => {
  // This would be implemented with actual export logic
  const data = records.map((record) => ({
    recordId: record._id,
    patientName: record.patient.user.names,
    patientEmail: record.patient.user.email,
    doctorName: record.doctor.user.names,
    appointmentDate: new Date(record.appointment.date).toLocaleDateString(),
    appointmentType: record.appointment.type,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    prescriptions: getPrescriptionSummary(record.prescription),
    followUpRequired: record.followUpRequired ? "Yes" : "No",
    followUpDate: record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : "N/A",
    createdAt: new Date(record.createdAt).toLocaleDateString(),
  }))

  if (format === "csv") {
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header as keyof typeof row] || ""}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medical-records-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
}

/**
 * Formats a medical record for display
 */
export const formatMedicalRecord = (record: MedicalRecord): any => {

  const doctorName = typeof record.doctor === "object" ? getDoctorFullName(record.doctor) : "Unknown Doctor"

  return {
    ...record,
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
        ? record.patient._id || record.patient._id?.toString() || ""
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
