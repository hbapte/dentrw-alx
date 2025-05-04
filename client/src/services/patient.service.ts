/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { Patient, PatientFormData } from "../types/patient.types"
import { formatPatientFormData } from "../utils/patient.utils"

const PatientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get("/patients")
    return response.data.data.patients || response.data
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`)
    return response.data.data || response.data
  },

  createPatient: async (data: PatientFormData): Promise<Patient> => {
    const formattedData = formatPatientFormData({
  
      // Add other required fields with default values here
      ...data,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
      dateOfBirth: data.dateOfBirth || "",

    })
    const response = await api.post("/patients", formattedData)
    return response.data.data || response.data
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
    return response.data.data || response.data
  },

  deletePatient: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`)
  },

  getPatientStats: async (): Promise<any> => {
    const response = await api.get("/patients/stats")
    return response.data.data
  },
}

export default PatientService
