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
export interface DoctorFormData {
  userId?: string
  specialization: string
  qualifications: string
  experience: number
  licenseNumber: string
  bio: string
  languages: string
  consultationFee: number
  availability: Availability[]
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
