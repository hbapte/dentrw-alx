/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { Doctor, DoctorFormData } from "../types/doctor.types"
import { formatDoctorFormData } from "../utils/doctor.utils"

const DoctorService = {
  getAllDoctors: async (params?: {
    page?: number
    limit?: number
    search?: string
    specialization?: string
    minExperience?: number
    maxExperience?: number
    language?: string
    minRating?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<{
    doctors: Doctor[]
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
    const response = await api.get(`/doctors${queryString}`)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to fetch doctors")
    }
    
    return {
      doctors: response.data.data || [],
      pagination: response.data.metadata.pagination || {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to fetch doctor")
    }
    
    return response.data.data.doctor
  },

  createDoctor: async (data: DoctorFormData): Promise<Doctor> => {
    const formattedData = formatDoctorFormData(data)
    const response = await api.post("/doctors", formattedData)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to create doctor")
    }
    
    return response.data.data.doctor
  },

  updateDoctor: async (id: string, data: Partial<DoctorFormData>): Promise<Doctor> => {
    const formattedData = formatDoctorFormData(data as DoctorFormData)
    const response = await api.put(`/doctors/${id}`, formattedData)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to update doctor")
    }
    
    return response.data.data.doctor
  },

  deleteDoctor: async (id: string): Promise<void> => {
    const response = await api.delete(`/doctors/${id}`)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to delete doctor")
    }
  },

  addRating: async (doctorId: string, rating: number, review: string): Promise<void> => {
    const response = await api.post(`/doctors/${doctorId}/ratings`, { 
      rating, 
      review,
      patientId: localStorage.getItem('userId') // This should be replaced with proper user ID from auth store
    })
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to add rating")
    }
  },

  getDoctorStats: async (): Promise<any> => {
    const response = await api.get("/doctors/stats")
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to fetch doctor statistics")
    }
    
    return response.data.data
  },
}

export default DoctorService
