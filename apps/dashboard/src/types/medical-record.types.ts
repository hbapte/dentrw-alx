/* eslint-disable @typescript-eslint/no-explicit-any */
// client\src\types\medical-record.types.ts
// import type { Patient } from "./patient.types"
// import type { Doctor } from "./doctor.types"
import type { Pagination } from "./common.types"

// Filters for medical records
export interface MedicalRecordFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  patientId?: string
  doctorId?: string
  appointmentId?: string
  startDate?: string
  endDate?: string
  followUpRequired?: boolean
  daysAhead?: number
  searchTerm?: string
}


// Basic medical record information
export interface MedicalRecord {
  _id: string
  patient: {
    _id: string
    user: {
      _id: string
      names: string
      email: string
      preferredLanguage: string
      phoneNumber: string
      picture?: string
    }
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
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    nationalId?: string
    maritalStatus?: string
    occupation?: string
    createdAt: string
    updatedAt: string
  }
  doctor: {
    _id: string
    user: {
      _id: string
      names: string
      email: string
      phoneNumber: string
      picture?: string
    }
    specialization: string[]
    qualifications: Array<{
      degree: string
      institution: string
      year: number
      country: string
      _id: string
    }>
    experience: number
    languages: string[]
    averageRating: number
    consultationFee: {
      initial: number
      followUp: number
      emergency: number
      currency: string
    }
  }
  appointment: {
    _id: string
    patient: {
      _id: string
    }
    doctor: {
      _id: string
    }
    date: string
    startTime: string
    endTime: string
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
    type: "consultation" | "checkup" | "treatment" | "follow-up" | "emergency"
    notes?: string
    reason?: string
    reminders: any[]
  }
  diagnosis: string
  treatment: string
  prescription: Prescription[]
  notes?: string
  followUpRequired: boolean
  followUpDate?: string
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}
// export interface MedicalRecord {
//   id: string
//   _id?: string 
//   patient: string | Patient
//   doctor: string | Doctor
//   appointment: string 
//   diagnosis: string
//   treatment: string
//   prescription: Prescription[]
//   notes?: string
//   attachments: Attachment[]
//   followUpRequired: boolean
//   followUpDate?: string
//   createdAt: string
//   updatedAt: string
// }

// Form data for creating/updating medical records
export interface MedicalRecordFormData {
  patientId: string
  doctorId: string
  appointmentId: string
  diagnosis: string
  treatment: string
  notes?: string
  followUpRequired: boolean
  followUpDate?: string
  prescription: Prescription[]
}

// Prescription information
export interface Prescription {
  id?: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

// Attachment information
export interface Attachment {
  id?: string
  name: string
  fileUrl: string
  fileType: string
  uploadedAt: string
}

// Medical record statistics
export interface MedicalRecordStatistics {
  totalRecords: number
  recordsThisMonth: number
  recordsLastMonth: number
  followUpRequired: number
  diagnosisDistribution: Record<string, number>
  recentRecords: MedicalRecord[]
}


// Paginated response for medical records
export interface PaginatedMedicalRecordsResponse {
  records: MedicalRecord[]
  pagination: Pagination
  links?: Record<string, string>
}

// Medical record state for the store
export interface MedicalRecordState {
  records: MedicalRecord[]
  selectedRecord: MedicalRecord | null
  patientHistory: MedicalRecord[]
  followUpRecords: MedicalRecord[]
  statistics: MedicalRecordStatistics | null
  loading: boolean
  error: string | null
  filters: MedicalRecordFilters
  pagination: Pagination
  
  // Actions
  setFilters: (filters: Partial<MedicalRecordFilters>) => void
  resetFilters: () => void
  
  // Fetch operations
  fetchRecords: (params?: MedicalRecordFilters) => Promise<void>
  fetchRecordById: (id: string) => Promise<void>
  fetchPatientHistory: (patientId: string, params?: Partial<MedicalRecordFilters>) => Promise<void>
  fetchFollowUpRecords: (params?: Partial<MedicalRecordFilters>) => Promise<void>
  fetchStatistics: () => Promise<void>
  
  // CRUD operations
  createRecord: (data: MedicalRecordFormData) => Promise<void>
  updateRecord: (id: string, data: Partial<MedicalRecordFormData>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  
  // Prescription operations
  addPrescription: (recordId: string, prescription: Prescription) => Promise<void>
  updatePrescription: (recordId: string, prescriptionId: string, prescription: Prescription) => Promise<void>
  removePrescription: (recordId: string, prescriptionId: string) => Promise<void>
  
  // Attachment operations
  addAttachment: (recordId: string, attachment: FormData) => Promise<void>
  removeAttachment: (recordId: string, attachmentId: string) => Promise<void>
  
  // Utility actions
  clearSelectedRecord: () => void
  clearError: () => void
}



export interface MedicalRecordStats {
  totalRecords: number
  recordsThisMonth: number
  followUpsPending: number
  averageRecordsPerDay: number
  topDiagnoses: Array<{
    diagnosis: string
    count: number
  }>
  topTreatments: Array<{
    treatment: string
    count: number
  }>
  recordsByType: Array<{
    type: string
    count: number
  }>
  recordsByDoctor: Array<{
    doctorId: string
    doctorName: string
    count: number
  }>
}
