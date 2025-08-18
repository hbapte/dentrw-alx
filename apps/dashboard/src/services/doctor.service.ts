// client\src\services\doctor.service.ts
import api from "./api"
import type { Doctor } from "@/types/dental-appointment.types"

interface DoctorsResponse {
  success: boolean
  data: Doctor[]
  message: string
  metadata: {
    pagination: {
      page: number
      pageSize: number
      totalItems: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

const DoctorService = {
  getAllDoctors: async (params?: { page?: number; limit?: number }): Promise<Doctor[]> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const url = `/doctors${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await api.get<DoctorsResponse>(url)

    return response.data.data || []
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get<{ data: Doctor }>(`/doctors/${id}`)
    return response.data.data
  },

  createDoctor: async (data: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.post<{ data: Doctor }>("/doctors", data)
    return response.data.data
  },
}

export default DoctorService
