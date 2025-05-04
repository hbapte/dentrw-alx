import type { Patient } from "./patient.types"
import type { Doctor } from "./doctor.types"

// Basic medical record information
export interface MedicalRecord {
  id: string
  _id?: string 
  patient: string | Patient
  doctor: string | Doctor
  appointment: string 
  diagnosis: string
  treatment: string
  prescription: Prescription[]
  notes?: string
  attachments: Attachment[]
  followUpRequired: boolean
  followUpDate?: string
  createdAt: string
  updatedAt: string
}

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

// Medical record state for the store
export interface MedicalRecordState {
  records: MedicalRecord[]
  selectedRecord: MedicalRecord | null
  patientHistory: MedicalRecord[]
  followUpRecords: MedicalRecord[]
  statistics: MedicalRecordStatistics | null
  loading: boolean
  error: string | null
  fetchRecords: () => Promise<void>
  fetchRecordById: (id: string) => Promise<void>
  fetchPatientHistory: (patientId: string) => Promise<void>
  fetchFollowUpRecords: () => Promise<void>
  fetchStatistics: () => Promise<void>
  createRecord: (data: MedicalRecordFormData) => Promise<void>
  updateRecord: (id: string, data: Partial<MedicalRecordFormData>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  addPrescription: (recordId: string, prescription: Prescription) => Promise<void>
  updatePrescription: (recordId: string, prescriptionId: string, prescription: Prescription) => Promise<void>
  removePrescription: (recordId: string, prescriptionId: string) => Promise<void>
  addAttachment: (recordId: string, attachment: FormData) => Promise<void>
  removeAttachment: (recordId: string, attachmentId: string) => Promise<void>
  clearSelectedRecord: () => void
  clearError: () => void
}
