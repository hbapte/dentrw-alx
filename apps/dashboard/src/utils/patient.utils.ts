 
import type { Patient, PatientFormData } from "../types/patient.types"

export const formatPatientFormData = (data: PatientFormData) => {
  return {
    names: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phoneNumber: data.phone,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    nationalId: data.nationalId,
    maritalStatus: data.maritalStatus,
    occupation: data.occupation,
    address: data.address,
    emergencyContact: data.emergencyContact,
    medicalHistory: data.medicalHistory,
    insuranceInfo: data.insuranceInfo,
    preferences: data.preferences,
  }
}

// export const formatPhoneNumber = (phone: string): string => {
//   if (!phone) return ""

//   // Remove any non-digit characters
//   const cleaned = phone.replace(/\D/g, "")

//   // Format Rwanda phone numbers
//   if (cleaned.startsWith("250")) {
//     return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
//   } else if (cleaned.startsWith("07") || cleaned.startsWith("08") || cleaned.startsWith("09")) {
//     return `+250 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
//   }

//   return phone
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

export const getRiskBadgeColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "moderate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export const getInsuranceBadgeColor = (hasInsurance: boolean) => {
  return hasInsurance
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
}

export const getAnxietyBadgeColor = (level: string) => {
  switch (level) {
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "moderate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}


/**
 * Formats a patient's full name
 */
export const getPatientFullName = (patient: Patient): string => {
  // if (patient.firstName && patient.lastName) {
  //   return `${patient.firstName} ${patient.lastName}`
  // }
  
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

// /**
//  * Formats form data for API submission
//  */
// export const formatPatientFormData = (formData: PatientFormData): any => {
//   const result: any = {
//     firstName: formData.firstName,
//     lastName: formData.lastName,
//     email: formData.email,
//     phone: formData.phone,
//     dateOfBirth: formData.dateOfBirth,
//     gender: formData.gender,
//   }
  
//   if (formData.address) {
//     result.address = parseAddressString(formData.address)
//   }
  
//   if (formData.medicalHistory) {
//     result.medicalHistory = {
//       notes: formData.medicalHistory
//     }
//   }
  
//   return result
// }
