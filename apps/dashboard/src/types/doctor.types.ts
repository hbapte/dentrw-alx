import type { UserInfo } from "./patient.types"

// Basic doctor information
export interface Doctor {
  id: string
  _id?: string
  user?: UserInfo
  specialization: string
  qualifications: string[]
  experience: number
  licenseNumber: string
  bio: string
  languages: string[]
  consultationFee: number
  availability: Availability[]
  ratings?: Rating[]
  averageRating: number
  createdAt: string
  updatedAt: string
}

// Form data for creating/updating doctors - matches the form schema
// export interface DoctorFormData {
//   userId?: string
//   specialization: string
//   qualifications: string
//   experience: number
//   licenseNumber: string
//   bio: string
//   languages: string
//   consultationFee: number
//   availability: Availability[]
// }


export interface DoctorFormData {
  // Staff Info (Step 1)
  picture?: string
  pictureFile?: File
  type: 'full-time' | 'part-time'
  names: string
  specialization: string[]
  email: string
  address: string
  
  // Assigned Services (Step 2)
  dentalSpecialties: string[]
  
  // Working Hours (Step 3)
  workingHours: {
    day: string
    isWorking: boolean
    slots: {
      startTime: string
      endTime: string
      breakStart?: string
      breakEnd?: string
    }[]
  }[]
  
  // Days Off (Step 4)
  daysOff: {
    name: string
    startDate: string
    endDate: string
    repeatYearly: boolean
  }[]
}

export interface DoctorFormStore {
  formData: DoctorFormData
  currentStep: number
  isSubmitting: boolean
  uploadProgress: number
  errors: Record<string, string>
  
  // Actions
  updateFormData: (data: Partial<DoctorFormData>) => void
  setCurrentStep: (step: number) => void
  setError: (field: string, error: string) => void
  clearErrors: () => void
  uploadPicture: (file: File) => Promise<void>
  submitForm: () => Promise<void>
  resetForm: () => void
  
  // Validation
  validateStep: (step: number) => boolean
  canProceedToNextStep: () => boolean
}


// Availability schedule
export interface Availability {
  day: DayOfWeek
  slots: TimeSlot[]
}

// Time slot for availability
export interface TimeSlot {
  startTime: string
  endTime: string
  id?: string // For UI operations
}

// Days of the week
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

// Rating information
export interface Rating {
  rating: number
  review: string
  patient: string
  patientId?: string
  date: string
}

// Doctor statistics
export interface DoctorStatistics {
  totalDoctors: number
  specializationDistribution: Record<string, number>
  averageRating: number
  recentDoctors: Doctor[]
  topRatedDoctors?: Doctor[]
  specializations?: string[]
  languages?: string[]
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
export interface DoctorFilters {
  search: string
  specialization: string
  minExperience?: number
  maxExperience?: number
  language: string
  minRating?: number
  sortBy: string
  sortOrder: "asc" | "desc"
}

// Doctor state for the store
export interface DoctorState {
  doctors: Doctor[]
  selectedDoctor: Doctor | null
  loading: boolean
  error: string | null
  pagination: Pagination
  filters: DoctorFilters
  setFilters: (filters: Partial<DoctorFilters>) => void
  fetchDoctors: (page?: number, limit?: number) => Promise<void>
  fetchDoctorById: (id: string) => Promise<void>
  createDoctor: (data: DoctorFormData) => Promise<Doctor>
  updateDoctor: (id: string, data: Partial<DoctorFormData>) => Promise<Doctor>
  deleteDoctor: (id: string) => Promise<void>
  addRating: (doctorId: string, rating: number, review: string) => Promise<void>
  clearSelectedDoctor: () => void
  clearError: () => void
}
