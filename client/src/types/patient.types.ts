export interface Patient {
  id: string
  _id?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: Address
  medicalHistory?: MedicalHistory
  emergencyContact?: EmergencyContact
  insuranceInfo?: InsuranceInfo
  gender?: "male" | "female" | "other"
  user?: UserInfo
  createdAt: string
  updatedAt: string
}

// Form data for creating/updating patients
export interface PatientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address?: string
  medicalHistory?: string
  gender?: "male" | "female" | "other"
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
