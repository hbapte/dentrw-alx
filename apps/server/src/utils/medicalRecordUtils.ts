/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns"
import { sendMedicalRecordEmail } from "../services/emailService"
import { sendMedicalRecordSMS } from "../services/smsService"

/**
 * Format a medical record for display
 */
export const formatMedicalRecord = (record: any) => {
  // Format dates
  const createdAt = record.createdAt ? format(new Date(record.createdAt), "MMMM dd, yyyy") : "N/A"
  const followUpDate = record.followUpDate ? format(new Date(record.followUpDate), "MMMM dd, yyyy") : "N/A"

  // Format patient and doctor names
  const patientName = record.patient?.user?.names || record.patient?.names || "Unknown Patient"
  const doctorName = record.doctor?.user?.names || "Unknown Doctor"

  // Format appointment date
  const appointmentDate = record.appointment?.date ? format(new Date(record.appointment.date), "MMMM dd, yyyy") : "N/A"

  return {
    ...record,
    formattedCreatedAt: createdAt,
    formattedFollowUpDate: followUpDate,
    patientName,
    doctorName,
    appointmentDate,
  }
}

/**
 * Notify patient about a new medical record
 */
export const notifyPatientAboutMedicalRecord = async (record: any) => {
  try {
    const patient = record.patient
    const doctor = record.doctor?.user

    if (!patient || !doctor) {
      return { success: false, error: "Patient or doctor information missing" }
    }

    const patientName = patient.names
    const doctorName = doctor.names
    const recordDate = format(new Date(record.createdAt), "MMMM dd, yyyy")

    let emailSent = false
    let smsSent = false

    // Send email notification if patient has email
    if (patient.email) {
      await sendMedicalRecordEmail(patient.email, patientName, doctorName, recordDate, record.diagnosis)
      emailSent = true
    }

    // Send SMS notification if patient has phone number
    if (patient.phoneNumber) {
      await sendMedicalRecordSMS(patient.phoneNumber, patientName)
      smsSent = true
    }

    return {
      success: true,
      emailSent,
      smsSent,
    }
  } catch (error) {
    console.error("Error notifying patient about medical record:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Generate a prescription PDF content
 */
export const generatePrescriptionContent = (record: any) => {
  if (!record || !record.prescription || record.prescription.length === 0) {
    return "No prescription available"
  }

  const patient = record.patient
  const doctor = record.doctor?.user
  const patientName = patient?.names || "Unknown Patient"
  const doctorName = doctor?.names || "Unknown Doctor"
  const date = format(new Date(record.createdAt), "MMMM dd, yyyy")

  let content = `
    PRESCRIPTION
    
    Date: ${date}
    
    Patient: ${patientName}
    Doctor: ${doctorName}
    
    Diagnosis: ${record.diagnosis}
    
    Medications:
  `

  record.prescription.forEach((item: any, index: number) => {
    content += `
    ${index + 1}. ${item.medication}
       Dosage: ${item.dosage}
       Frequency: ${item.frequency}
       Duration: ${item.duration}
       ${item.notes ? `Notes: ${item.notes}` : ""}
    `
  })

  content += `
    
    Additional Notes:
    ${record.notes || "None"}
    
    Signature: ____________________
    Dr. ${doctorName}
  `

  return content
}

/**
 * Check if a medical record has all required fields
 */
export const validateMedicalRecord = (record: any) => {
  const requiredFields = ["patient", "doctor", "appointment", "diagnosis", "treatment"]
  const missingFields = requiredFields.filter((field) => !record[field])

  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
    }
  }

  return { valid: true }
}

