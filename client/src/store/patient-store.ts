/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import PatientService from "../services/patient.service"
import type { PatientState } from "../types/patient.types"

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {
    search: "",
    gender: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  fetchPatients: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null })

      const { filters } = get()
      const result = await PatientService.getAllPatients({
        page,
        limit,
        ...filters,
      })

      set({
        patients: result.patients,
        pagination: result.pagination,
        loading: false,
      })
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch patients",
        loading: false,
      })
    }
  },

  fetchPatientById: async (id) => {
    try {
      set({ loading: true, error: null })
      const patient = await PatientService.getPatientById(id)
      set({ selectedPatient: patient, loading: false })
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch patient",
        loading: false,
      })
    }
  },

  createPatient: async (data) => {
    try {
      set({ loading: true, error: null })
      const newPatient = await PatientService.createPatient(data)
      set((state) => ({
        patients: [...state.patients, newPatient],
        loading: false,
      }))
      return newPatient
    } catch (err: any) {
      set({
        error: err.message || "Failed to create patient",
        loading: false,
      })
      throw err
    }
  },

  updatePatient: async (id, data) => {
    try {
      set({ loading: true, error: null })
      const updatedPatient = await PatientService.updatePatient(id, data)
      set((state) => ({
        patients: state.patients.map((patient) => 
          (patient.id === id || patient._id === id) ? updatedPatient : patient
        ),
        selectedPatient: updatedPatient,
        loading: false,
      }))
      return updatedPatient
    } catch (err: any) {
      set({
        error: err.message || "Failed to update patient",
        loading: false,
      })
      throw err
    }
  },

  deletePatient: async (id) => {
    try {
      set({ loading: true, error: null })
      await PatientService.deletePatient(id)
      set((state) => ({
        patients: state.patients.filter((patient) => 
          patient.id !== id && patient._id !== id
        ),
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.message || "Failed to delete patient",
        loading: false,
      })
      throw err
    }
  },

  clearSelectedPatient: () => set({ selectedPatient: null }),
  clearError: () => set({ error: null }),
}))
