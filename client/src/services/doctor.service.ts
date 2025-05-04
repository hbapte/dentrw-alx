/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { Doctor, DoctorFormData } from "../types/doctor.types"
import { formatDoctorFormData } from "../utils/doctor.utils"

const DoctorService = {
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get("/doctors")
    return response.data.data.doctors || response.data
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`)
    return response.data.data || response.data
  },

  createDoctor: async (data: DoctorFormData): Promise<Doctor> => {
    const completeData: DoctorFormData = {
      ...data,
      specialization: data.specialization || "", // Provide a default value for undefined fields
      qualifications: data.qualifications ? data.qualifications : "", // Ensure qualifications is always a string
    }
    const formattedData = formatDoctorFormData(completeData)
    const response = await api.post("/doctors", formattedData)
    return response.data.data || response.data
  },

  updateDoctor: async (id: string, data: Partial<DoctorFormData>): Promise<Doctor> => {
    const completeData: DoctorFormData = {
      ...data,
      specialization: data.specialization || "", // Provide a default value for undefined fields
      qualifications: data.qualifications || "", // Ensure qualifications is always a string
    }
    const formattedData = formatDoctorFormData(completeData)
    const response = await api.put(`/doctors/${id}`, formattedData)
    return response.data.data || response.data
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await api.delete(`/doctors/${id}`)
  },

  addRating: async (doctorId: string, rating: number, review: string): Promise<void> => {
    await api.post(`/doctors/${doctorId}/ratings`, { rating, review })
  },

  getDoctorStats: async (): Promise<any> => {
    const response = await api.get("/doctors/stats")
    return response.data.data
  },
}

export default DoctorService
