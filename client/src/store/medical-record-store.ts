/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import MedicalRecordService from "../services/medical-record.service"
import type { MedicalRecordState } from "../types/medical-record.types"

export const useMedicalRecordStore = create<MedicalRecordState>((set) => ({
  records: [],
  selectedRecord: null,
  patientHistory: [],
  followUpRecords: [],
  statistics: null,
  loading: false,
  error: null,

  fetchRecords: async () => {
    try {
      set({ loading: true, error: null })
      const records = await MedicalRecordService.getAllRecords()
      set({ records, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch medical records",
        loading: false,
      })
    }
  },

  fetchRecordById: async (id) => {
    try {
      set({ loading: true, error: null })
      const record = await MedicalRecordService.getRecordById(id)
      set({ selectedRecord: record, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch medical record",
        loading: false,
      })
    }
  },

  fetchPatientHistory: async (patientId) => {
    try {
      set({ loading: true, error: null })
      const records = await MedicalRecordService.getPatientHistory(patientId)
      set({ patientHistory: records, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch patient history",
        loading: false,
      })
    }
  },

  fetchFollowUpRecords: async () => {
    try {
      set({ loading: true, error: null })
      const records = await MedicalRecordService.getFollowUpRecords()
      set({ followUpRecords: records, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch follow-up records",
        loading: false,
      })
    }
  },

  fetchStatistics: async () => {
    try {
      set({ loading: true, error: null })
      const statistics = await MedicalRecordService.getStatistics()
      set({ statistics, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch statistics",
        loading: false,
      })
    }
  },

  createRecord: async (data) => {
    try {
      set({ loading: true, error: null })
      const newRecord = await MedicalRecordService.createRecord(data)
      set((state) => ({
        records: [...state.records, newRecord],
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create medical record",
        loading: false,
      })
      throw err
    }
  },

  updateRecord: async (id, data) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.updateRecord(id, data)
      set((state) => ({
        records: state.records.map((record) => (record.id === id ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update medical record",
        loading: false,
      })
      throw err
    }
  },

  deleteRecord: async (id) => {
    try {
      set({ loading: true, error: null })
      await MedicalRecordService.deleteRecord(id)
      set((state) => ({
        records: state.records.filter((record) => record.id !== id),
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete medical record",
        loading: false,
      })
      throw err
    }
  },

  addPrescription: async (recordId, prescription) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.addPrescription(recordId, prescription)
      set((state) => ({
        records: state.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to add prescription",
        loading: false,
      })
      throw err
    }
  },

  updatePrescription: async (recordId, prescriptionId, prescription) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.updatePrescription(recordId, prescriptionId, prescription)
      set((state) => ({
        records: state.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update prescription",
        loading: false,
      })
      throw err
    }
  },

  removePrescription: async (recordId, prescriptionId) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.removePrescription(recordId, prescriptionId)
      set((state) => ({
        records: state.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to remove prescription",
        loading: false,
      })
      throw err
    }
  },

  addAttachment: async (recordId, formData) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.addAttachment(recordId, formData)
      set((state) => ({
        records: state.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to add attachment",
        loading: false,
      })
      throw err
    }
  },

  removeAttachment: async (recordId, attachmentId) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.removeAttachment(recordId, attachmentId)
      set((state) => ({
        records: state.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to remove attachment",
        loading: false,
      })
      throw err
    }
  },

  clearSelectedRecord: () => set({ selectedRecord: null }),
  clearError: () => set({ error: null }),
}))
