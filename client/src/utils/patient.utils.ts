/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Patient, PatientFormData } from "../types/patient.types"

/**
 * Formats a patient's full name
 */
export const getPatientFullName = (patient: Patient): string => {
  if (patient.firstName && patient.lastName) {
    return `${patient.firstName} ${patient.lastName}`
  }
  
  if (patient.user?.names) {
    return patient.user.names
  }
  
  return "Unknown Patient"
}

/**
 * Converts a patient object to form data for editing
 */
export const patientToFormData = (patient: Patient): PatientFormData => {
  return {
    firstName: patient.firstName || patient.user?.names?.split(" ")[0] || "",
    lastName: patient.lastName || patient.user?.names?.split(" ").slice(1).join(" ") || "",
    email: patient.email || patient.user?.email || "",
    phone: patient.phone || patient.user?.phoneNumber || "",
    dateOfBirth: patient.dateOfBirth || "",
    gender: patient.gender,
    address: patient.address?.street
      ? `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.postalCode}, ${patient.address.country}`
      : "",
    medicalHistory: patient.medicalHistory?.notes || "",
  }
}

/**
 * Parses an address string into components
 */
export const parseAddressString = (addressString: string): {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
} => {
  if (!addressString) return {}
  
  const parts = addressString.split(',').map(part => part.trim())
  
  if (parts.length < 3) return { street: addressString }
  
  const street = parts[0]
  const city = parts[1]
  
  // Handle the state and postal code which might be in the same part
  const statePostalParts = parts[2].split(' ').filter(Boolean)
  const state = statePostalParts[0]
  const postalCode = statePostalParts.length > 1 ? statePostalParts.slice(1).join(' ') : ''
  
  // Country is the last part if it exists
  const country = parts.length > 3 ? parts[3] : ''
  
  return {
    street,
    city,
    state,
    postalCode,
    country
  }
}

/**
 * Formats form data for API submission
 */
export const formatPatientFormData = (formData: PatientFormData): any => {
  const result: any = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
  }
  
  if (formData.address) {
    result.address = parseAddressString(formData.address)
  }
  
  if (formData.medicalHistory) {
    result.medicalHistory = {
      notes: formData.medicalHistory
    }
  }
  
  return result
}
