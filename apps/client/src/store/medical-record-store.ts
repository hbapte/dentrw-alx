// client\src\store\medical-record-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import MedicalRecordService from "../services/medical-record.service"
import type { MedicalRecordState, MedicalRecordFilters } from "../types/medical-record.types"

// Default pagination state
const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

// Default filters
const DEFAULT_FILTERS: MedicalRecordFilters = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
}

export const useMedicalRecordStore = create<MedicalRecordState>((set, get) => ({
  records: [],
  selectedRecord: null,
  patientHistory: [],
  followUpRecords: [],
  statistics: null,
  loading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  pagination: DEFAULT_PAGINATION,

  // Filter actions
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 }, // Reset to page 1 when filters change
    }))
    // Optionally fetch records with new filters
    if (newFilters.page === undefined) {
      // Don't auto-fetch if just changing page
      get().fetchRecords()
    }
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS })
    get().fetchRecords()
  },

  fetchRecords: async (params) => {
    try {
      set({ loading: true, error: null })

      // Use provided params or current filters
      const queryParams = params || get().filters

      const result = await MedicalRecordService.getAllRecords(queryParams)

      console.log("Fetched records:", result.records)
      console.log("Fetched pagination:", result.pagination)
      console.log("Fetched links:", result.links)

      set({
        records: result.records,
        pagination: result.pagination || DEFAULT_PAGINATION,
        loading: false,
      })
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

  fetchPatientHistory: async (patientId, params) => {
    try {
      set({ loading: true, error: null })

      const result = await MedicalRecordService.getPatientHistory(patientId, params)

      set({
        patientHistory: result.records,
        pagination: result.pagination || DEFAULT_PAGINATION,
        loading: false,
      })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch patient history",
        loading: false,
      })
    }
  },

  fetchFollowUpRecords: async (params) => {
    try {
      set({ loading: true, error: null })

      const result = await MedicalRecordService.getFollowUpRecords(params)

      set({
        followUpRecords: result.records,
        pagination: result.pagination || DEFAULT_PAGINATION,
        loading: false,
      })
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

      // Add the new record to the records array
      set((state) => ({
        records: [...state.records, newRecord],
        selectedRecord: newRecord,
      }))
      // Optionally, you can also set the selected record to the newly created one
      // set({ selectedRecord: newRecord })

      // Refresh the records list to include the new record
      await get().fetchRecords()

      set({ loading: false })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create medical record"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  updateRecord: async (id, data) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.updateRecord(id, data)

      // Update the record in the records array
      set((state) => ({
        records: state.records.map((record) => (record.id === id || record._id === id ? updatedRecord : record)),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update medical record"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  deleteRecord: async (id) => {
    try {
      set({ loading: true, error: null })
      await MedicalRecordService.deleteRecord(id)

      // Remove the record from the records array
      set((state) => ({
        records: state.records.filter((record) => record.id !== id && record._id !== id),
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete medical record"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  addPrescription: async (recordId, prescription) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.addPrescription(recordId, prescription)

      // Update the record in the records array and the selected record
      set((state) => ({
        records: state.records.map((record) =>
          record.id === recordId || record._id === recordId ? updatedRecord : record,
        ),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to add prescription"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  updatePrescription: async (recordId, prescriptionId, prescription) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.updatePrescription(recordId, prescriptionId, prescription)

      // Update the record in the records array and the selected record
      set((state) => ({
        records: state.records.map((record) =>
          record.id === recordId || record._id === recordId ? updatedRecord : record,
        ),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update prescription"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  removePrescription: async (recordId, prescriptionId) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.removePrescription(recordId, prescriptionId)

      // Update the record in the records array and the selected record
      set((state) => ({
        records: state.records.map((record) =>
          record.id === recordId || record._id === recordId ? updatedRecord : record,
        ),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to remove prescription"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  addAttachment: async (recordId, formData) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.addAttachment(recordId, formData)

      // Update the record in the records array and the selected record
      set((state) => ({
        records: state.records.map((record) =>
          record.id === recordId || record._id === recordId ? updatedRecord : record,
        ),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to add attachment"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  removeAttachment: async (recordId, attachmentId) => {
    try {
      set({ loading: true, error: null })
      const updatedRecord = await MedicalRecordService.removeAttachment(recordId, attachmentId)

      // Update the record in the records array and the selected record
      set((state) => ({
        records: state.records.map((record) =>
          record.id === recordId || record._id === recordId ? updatedRecord : record,
        ),
        selectedRecord: updatedRecord,
        loading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to remove attachment"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  clearSelectedRecord: () => set({ selectedRecord: null }),
  clearError: () => set({ error: null }),
}))
