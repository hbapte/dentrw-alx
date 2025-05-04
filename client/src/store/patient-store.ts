/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import PatientService from "../services/patient.service"
import type { PatientState } from "../types/patient.types"

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,

  fetchPatients: async () => {
    try {
      set({ loading: true, error: null })
      const patients = await PatientService.getAllPatients()
      set({ patients, loading: false })
    } catch (err: unknown) {
      set({
        error: err instanceof Error && (err as any).response?.data?.message || "Failed to fetch patients",
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
        error: err.response?.data?.message || "Failed to fetch patient",
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
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create patient",
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
        patients: state.patients.map((patient) => (patient.id === id ? updatedPatient : patient)),
        selectedPatient: updatedPatient,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update patient",
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
        patients: state.patients.filter((patient) => patient.id !== id),
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete patient",
        loading: false,
      })
      throw err
    }
  },

  clearSelectedPatient: () => set({ selectedPatient: null }),
  clearError: () => set({ error: null }),
}))
