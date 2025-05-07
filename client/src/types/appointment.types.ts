import type { Patient } from "./patient.types"
import type { Doctor } from "./doctor.types"

// Basic appointment information
export interface Appointment {
  id: string
  _id?: string 
  patient: string | Patient | null
  doctor: string | Doctor
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  type: "consultation" | "checkup" | "treatment" | "follow-up"
  notes?: string
  reason: string
  payment?: string 
  reminders: AppointmentReminder[]
  createdAt: string
  updatedAt: string
}

// Appointment reminder information
export interface AppointmentReminder {
  type: "email" | "sms"
  sentAt: string
  status: "sent" | "failed"
}

// Form data for creating/updating appointments
export interface AppointmentFormData {
  patientId: string
  doctorId: string
  date: string
  startTime: string
  endTime: string
  type: "consultation" | "checkup" | "treatment" | "follow-up"
  notes?: string
  reason: string
}

// Data for checking doctor availability
export interface AvailabilityCheckData {
  doctorId: string
  date: string
  startTime?: string
  endTime?: string
  appointmentId?: string
}

// Appointment statistics
export interface AppointmentStatistics {
  totalAppointments: number
  appointmentsToday: number
  appointmentsThisWeek: number
  appointmentsByStatus: Record<string, number>
  appointmentsByType: Record<string, number>
  upcomingAppointments: Appointment[]
}

// Pagination parameters
export interface AppointmentPaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Filter parameters
export interface AppointmentFilterParams {
  doctorId?: string
  patientId?: string
  status?: string
  type?: string
  startDate?: string
  endDate?: string
  search?: string
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// HATEOAS links
export interface AppointmentLinks {
  self?: string
  doctors?: string
  patients?: string
  doctor?: string
  patient?: string
  cancel?: string
  updateStatus?: string
}

// Paginated response
export interface PaginatedAppointmentsResponse {
  appointments: Appointment[]
  pagination: PaginationMeta
  links?: AppointmentLinks
}

// Appointment state for the store
export interface AppointmentState {
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  upcomingAppointments: Appointment[]
  appointmentsByDate: Appointment[]
  statistics: AppointmentStatistics | null
  loading: boolean
  error: string | null
  pagination: PaginationMeta
  filters: AppointmentFilterParams
  
  // Actions
  fetchAppointments: (params?: AppointmentPaginationParams & AppointmentFilterParams) => Promise<void>
  fetchAppointmentById: (id: string) => Promise<void>
  fetchUpcomingAppointments: (limit?: number) => Promise<void>
  fetchAppointmentsByDate: (date: string, doctorId?: string) => Promise<void>
  fetchStatistics: () => Promise<void>
  createAppointment: (data: AppointmentFormData) => Promise<void>
  updateAppointment: (id: string, data: Partial<AppointmentFormData>) => Promise<void>
  cancelAppointment: (id: string, reason: string) => Promise<void>
  changeAppointmentStatus: (id: string, status: Appointment["status"]) => Promise<void>
  addAppointmentReminder: (id: string, type: "email" | "sms") => Promise<void>
  checkDoctorAvailability: (data: AvailabilityCheckData) => Promise<boolean>
  
  // Filter and pagination actions
  setFilters: (filters: Partial<AppointmentFilterParams>) => void
  resetFilters: () => void
  setPage: (page: number) => void
  
  // Utility actions
  clearSelectedAppointment: () => void
  clearError: () => void
}
