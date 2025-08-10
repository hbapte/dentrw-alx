export interface Patient {
  _id: string
  user: {
    _id: string
    names: string
    email: string
    username: string
    role: string
    emailVerified: boolean
    preferredLanguage: string
    phoneNumber: string
    phoneVerified: boolean
    active: boolean
    nationalId?: string
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    maritalStatus?: string
    occupation?: string
    picture?: string
    lastLogin?: string
    createdAt: string
    updatedAt: string
  }
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  nationalId?: string
  maritalStatus?: string
  occupation?: string
  address: {
    street?: string
    sector?: string
    cell?: string
    village?: string
    district?: string
    province?: string
    country?: string
    postalCode?: string
  }
  emergencyContact: {
    name?: string
    relationship?: string
    phoneNumber?: string
    email?: string
    address?: string
  }
  dentalHistory: {
    previousDentist?: string
    lastDentalVisit?: string
    reasonForLastVisit?: string
    currentComplaints: string[]
    painLevel: number
    sensitivityToHotCold: boolean
    bleedingGums: boolean
    badBreath: boolean
    teethGrinding: boolean
    jawPain: boolean
  }
  medicalHistory: {
    allergies: string[]
    chronicConditions: string[]
    currentMedications: string[]
    surgicalHistory: string[]
    familyMedicalHistory?: string
    smokingStatus: "never" | "former" | "current"
    alcoholConsumption: "never" | "occasional" | "regular"
    pregnancyStatus: "not_applicable" | "not_pregnant" | "pregnant" | "breastfeeding"
    notes?: string
  }
  insuranceInfo: {
    hasInsurance: boolean
    provider?: string
    policyNumber?: string
    groupNumber?: string
    expiryDate?: string
    coverageType: "basic" | "premium" | "comprehensive"
    coverageDetails?: string
    copayAmount?: number
  }
  preferences: {
    preferredAppointmentTime: "morning" | "afternoon" | "evening"
    communicationPreference: "phone" | "email" | "sms" | "both"
    reminderPreference: boolean
    treatmentPreferences: string[]
    anxietyLevel: "low" | "moderate" | "high"
    specialNeeds?: string
  }
  clinicalNotes?: {
    riskAssessment?: "low" | "moderate" | "high"
    treatmentPlan?: string
    followUpInstructions?: string
    staffNotes?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PatientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender?: "male" | "female" | "other"
  nationalId?: string
  maritalStatus?: string
  occupation?: string
  address?: {
    street?: string
    sector?: string
    cell?: string
    village?: string
    district?: string
    province?: string
    country?: string
    postalCode?: string
  }
  emergencyContact?: {
    name?: string
    relationship?: string
    phoneNumber?: string
    email?: string
    address?: string
  }
  medicalHistory?: {
    allergies?: string[]
    chronicConditions?: string[]
    currentMedications?: string[]
    surgicalHistory?: string[]
    familyMedicalHistory?: string
    smokingStatus?: "never" | "former" | "current"
    alcoholConsumption?: "never" | "occasional" | "regular"
    pregnancyStatus?: "not_applicable" | "not_pregnant" | "pregnant" | "breastfeeding"
    notes?: string
  }
  insuranceInfo?: {
    hasInsurance?: boolean
    provider?: string
    policyNumber?: string
    groupNumber?: string
    expiryDate?: string
    coverageType?: "basic" | "premium" | "comprehensive"
    coverageDetails?: string
    copayAmount?: number
  }
  preferences?: {
    preferredAppointmentTime?: "morning" | "afternoon" | "evening"
    communicationPreference?: "phone" | "email" | "sms" | "both"
    reminderPreference?: boolean
    treatmentPreferences?: string[]
    anxietyLevel?: "low" | "moderate" | "high"
    specialNeeds?: string
  }
}

// Detailed address information
export interface Address {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

// Medical history information
export interface MedicalHistory {
  allergies: string[]
  conditions: string[]
  medications: string[]
  notes?: string
}

// Emergency contact information
export interface EmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
}

// Insurance information
export interface InsuranceInfo {
  provider: string
  policyNumber: string
  groupNumber?: string
  expiryDate?: string
}

// User information (from the user model)
export interface UserInfo {
  _id?: string 
  names?: string
  email?: string
  username?: string
  role?: string
  phoneNumber?: string
  preferredLanguage?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  active?: boolean
  picture?: string
  createdAt?: string
  updatedAt?: string
  lastLogin?: string
}

// Pagination
export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Filter options
export interface PatientFilters {
  search: string
  gender?: "male" | "female" | "other"
  sortBy: string
  sortOrder: "asc" | "desc"
}

// Patient statistics
export interface PatientStatistics {
  totalPatients: number
  genderDistribution: {
    male: number
    female: number
    other: number
    unspecified: number
  }
  recentPatients: Patient[]
}

// Patient state for the store
export interface PatientState {
  patients: Patient[]
  selectedPatient: Patient | null
  loading: boolean
  error: string | null
  pagination: Pagination
  filters: PatientFilters
  setFilters: (filters: Partial<PatientFilters>) => void
  fetchPatients: (page?: number, limit?: number) => Promise<void>
  fetchPatientById: (id: string) => Promise<void>
  createPatient: (data: PatientFormData) => Promise<Patient>
  updatePatient: (id: string, data: Partial<PatientFormData>) => Promise<Patient>
  deletePatient: (id: string) => Promise<void>
  clearSelectedPatient: () => void
  clearError: () => void
}
