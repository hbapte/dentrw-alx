/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserProfileData {
    names?: string
    username?: string
    phoneNumber?: string
    preferredLanguage?: "en" | "fr" | "rw"
  }
  
  export interface PatientProfileData {
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    address?: {
      street?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
    emergencyContact?: {
      name?: string
      relationship?: string
      phoneNumber?: string
    }
    medicalHistory?: {
      allergies?: string[]
      conditions?: string[]
      medications?: string[]
      notes?: string
    }
    insuranceInfo?: {
      provider?: string
      policyNumber?: string
      expiryDate?: string
      coverageDetails?: string
    }
  }
  
  export interface DoctorProfileData {
    specialization?: string
    qualifications?: string[]
    experience?: number
    bio?: string
    languages?: string[]
    consultationFee?: number
    availability?: any // Using any for now, can be typed more specifically if needed
  }
  
  export interface PasswordData {
    currentPassword: string
    newPassword: string
  }
  
  export interface SetPasswordData {
    newPassword: string
  }
  
  export interface ProfileError {
    status?: number
    message: string
    details?: any
  }