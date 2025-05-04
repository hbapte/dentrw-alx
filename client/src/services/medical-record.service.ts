import api from "./api"
import type { MedicalRecord, MedicalRecordFormData, Prescription } from "../types/medical-record.types"
import { formatMedicalRecordFormData } from "../utils/medical-record.utils"

const MedicalRecordService = {
  getAllRecords: async (): Promise<MedicalRecord[]> => {
    const response = await api.get("/medical-records")
    return response.data.data.records || response.data
  },

  getRecordById: async (id: string): Promise<MedicalRecord> => {
    const response = await api.get(`/medical-records/${id}`)
    return response.data.data || response.data
  },

  getPatientHistory: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await api.get(`/medical-records/patient/${patientId}/history`)
    return response.data.data.records || response.data
  },

  getFollowUpRecords: async (): Promise<MedicalRecord[]> => {
    const response = await api.get("/medical-records/follow-up")
    return response.data.data.records || response.data
  },

  getStatistics: async (): Promise<any> => {
    const response = await api.get("/medical-records/stats")
    return response.data.data
  },

  createRecord: async (data: MedicalRecordFormData): Promise<MedicalRecord> => {
    const formattedData = formatMedicalRecordFormData(data)
    const response = await api.post("/medical-records", formattedData)
    return response.data.data || response.data
  },

  updateRecord: async (id: string, data: Partial<MedicalRecordFormData>): Promise<MedicalRecord> => {
    const formattedData = formatMedicalRecordFormData(data)
    const response = await api.put(`/medical-records/${id}`, formattedData)
    return response.data.data || response.data
  },

  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/medical-records/${id}`)
  },

  addPrescription: async (recordId: string, prescription: Prescription): Promise<MedicalRecord> => {
    const response = await api.post(`/medical-records/${recordId}/prescriptions`, prescription)
    return response.data.data || response.data
  },

  updatePrescription: async (
    recordId: string,
    prescriptionId: string,
    prescription: Prescription,
  ): Promise<MedicalRecord> => {
    const response = await api.put(`/medical-records/${recordId}/prescriptions/${prescriptionId}`, prescription)
    return response.data.data || response.data
  },

  removePrescription: async (recordId: string, prescriptionId: string): Promise<MedicalRecord> => {
    const response = await api.delete(`/medical-records/${recordId}/prescriptions/${prescriptionId}`)
    return response.data.data || response.data
  },

  addAttachment: async (recordId: string, formData: FormData): Promise<MedicalRecord> => {
    const response = await api.post(`/medical-records/${recordId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data || response.data
  },

  removeAttachment: async (recordId: string, attachmentId: string): Promise<MedicalRecord> => {
    const response = await api.delete(`/medical-records/${recordId}/attachments/${attachmentId}`)
    return response.data.data || response.data
  },
}

export default MedicalRecordService
