/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { Patient, PatientFormData } from "../types/patient.types"
import { formatPatientFormData } from "../utils/patient.utils"

const PatientService = {
  getAllPatients: async (params?: {
    page?: number
    limit?: number
    search?: string
    gender?: "male" | "female" | "other"
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<{
    patients: Patient[]
    pagination: {
      page: number
      pageSize: number
      totalItems: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }> => {
    const queryParams = new URLSearchParams()
    
    // Add all params to query string
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    const response = await api.get(`/patients${queryString}`)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to fetch patients")
    }
    
    return {
      patients: response.data.data || [],
      pagination: response.data.metadata?.pagination || {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to fetch patient")
    }
    
    return response.data.data.patient
  },

  createPatient: async (data: PatientFormData): Promise<Patient> => {
    const formattedData = formatPatientFormData({
      ...data,
      gender: data.gender || undefined, // Ensure gender matches the expected type
    })
    
    const response = await api.post("/patients", formattedData)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to create patient")
    }
    
    return response.data.data.patient
  },

  updatePatient: async (id: string, data: Partial<PatientFormData>): Promise<Patient> => {
    const formattedData = formatPatientFormData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
      dateOfBirth: data.dateOfBirth || "",
      ...data,
    })
    
    const response = await api.put(`/patients/${id}`, formattedData)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to update patient")
    }
    
    return response.data.data.patient
  },

  deletePatient: async (id: string): Promise<void> => {
    const response = await api.delete(`/patients/${id}`)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to delete patient")
    }
  },

  getPatientStats: async (): Promise<any> => {
    const response = await api.get("/patients/stats")
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to fetch patient statistics")
    }
    
    return response.data.data
  },
}

export default PatientService
