// client\src\services\medical-record.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { 
  MedicalRecord, 
  MedicalRecordFormData, 
  Prescription,
  PaginatedMedicalRecordsResponse,
  MedicalRecordFilters
} from "../types/medical-record.types"
import { formatMedicalRecordFormData } from "../utils/medical-record.utils"

const MedicalRecordService = {
  getAllRecords: async (params: MedicalRecordFilters = {}): Promise<PaginatedMedicalRecordsResponse> => {
    const { 
      page = 1, 
      limit = 30, 
      sortBy = "createdAt", 
      sortOrder = "desc",
      patientId,
      doctorId,
      appointmentId,
      startDate,
      endDate,
      followUpRequired,
      searchTerm
    } = params

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("page", page.toString())
    queryParams.append("limit", limit.toString())
    queryParams.append("sortBy", sortBy)
    queryParams.append("sortOrder", sortOrder)
    
    if (patientId) queryParams.append("patientId", patientId)
    if (doctorId) queryParams.append("doctorId", doctorId)
    if (appointmentId) queryParams.append("appointmentId", appointmentId)
    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)
    if (followUpRequired !== undefined) queryParams.append("followUpRequired", followUpRequired.toString())
    if (searchTerm) queryParams.append("search", searchTerm)

    const response = await api.get(`/medical-records?${queryParams.toString()}`)

    console.log("Get all records response:", response.data)
    
    // Extract data and pagination from response
    const { data, pagination, links } = response.data
    
    return {
      records: response.data.data || [],
      pagination: pagination || {
        page: 1,
        pageSize: 10,
        totalItems: data.records?.length || 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      links: links || {}
    }
  },

  getRecordById: async (id: string): Promise<MedicalRecord> => {
    const response = await api.get(`/medical-records/${id}`)
    return response.data.data?.medicalRecord || response.data.data || response.data
  },

  getPatientHistory: async (patientId: string, params: Partial<MedicalRecordFilters> = {}): Promise<PaginatedMedicalRecordsResponse> => {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = params

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("page", page.toString())
    queryParams.append("limit", limit.toString())
    queryParams.append("sortBy", sortBy)
    queryParams.append("sortOrder", sortOrder)

    const response = await api.get(`/medical-records/patient/${patientId}/history?${queryParams.toString()}`)
    
    // Extract data and pagination from response
    const { data, pagination, links } = response.data
    
    return {
      records: response.data.data || [],
      pagination: pagination || {
        page: 1,
        pageSize: 10,
        totalItems: data.records?.length || 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      links: links || {}
    }
  },

  getFollowUpRecords: async (params: Partial<MedicalRecordFilters> = {}): Promise<PaginatedMedicalRecordsResponse> => {
    const { 
      page = 1, 
      limit = 10, 
      daysAhead = 7 
    } = params

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("page", page.toString())
    queryParams.append("limit", limit.toString())
    queryParams.append("daysAhead", daysAhead.toString())

    const response = await api.get(`/medical-records/follow-up?${queryParams.toString()}`)
    
    // Extract data and pagination from response
    const { data, pagination, links } = response.data
    
    return {
      records: response.data.data || [],
      pagination: pagination || {
        page: 1,
        pageSize: 10,
        totalItems: data.records?.length || 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      links: links || {}
    }
  },

  getStatistics: async (): Promise<any> => {
    const response = await api.get("/medical-records/stats")
    return response.data.data || response.data
  },

  createRecord: async (data: MedicalRecordFormData): Promise<MedicalRecord> => {
    const formattedData = formatMedicalRecordFormData(data)
    const response = await api.post("/medical-records", formattedData)

    console.log("Create record response:", response.data)
    return response.data.data?.medicalRecord || response.data.data || response.data

    
  },

  updateRecord: async (id: string, data: Partial<MedicalRecordFormData>): Promise<MedicalRecord> => {
    const formattedData = formatMedicalRecordFormData(data)
    const response = await api.put(`/medical-records/${id}`, formattedData)
    return response.data.data?.medicalRecord || response.data.data || response.data
  },

  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/medical-records/${id}`)
  },

  addPrescription: async (recordId: string, prescription: Prescription): Promise<MedicalRecord> => {
    const response = await api.post(`/medical-records/${recordId}/prescriptions`, prescription)
    return response.data.data?.medicalRecord || response.data.data || response.data
  },

  updatePrescription: async (
    recordId: string,
    prescriptionId: string,
    prescription: Prescription,
  ): Promise<MedicalRecord> => {
    const response = await api.put(`/medical-records/${recordId}/prescriptions/${prescriptionId}`, prescription)
    return response.data.data?.medicalRecord || response.data.data || response.data
  },

  removePrescription: async (recordId: string, prescriptionId: string): Promise<MedicalRecord> => {
    const response = await api.delete(`/medical-records/${recordId}/prescriptions/${prescriptionId}`)
    return response.data.data?.medicalRecord || response.data.data || response.data
  },

  addAttachment: async (recordId: string, formData: FormData): Promise<MedicalRecord> => {
    const response = await api.post(`/medical-records/${recordId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data?.medicalRecord || response.data.data || response.data
  },

  removeAttachment: async (recordId: string, attachmentId: string): Promise<MedicalRecord> => {
    const response = await api.delete(`/medical-records/${recordId}/attachments/${attachmentId}`)
    return response.data.data?.medicalRecord || response.data.data || response.data
  },
}

export default MedicalRecordService
