// client\src\store\patient-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import PatientService from "../services/patient.service"
import type { PatientState } from "../types/patient.types"
import { toast } from 'react-hot-toast'

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

      // Optional: Only show success toast if it's a manual refresh or first load
      // You might want to remove this if fetching happens too frequently
      // toast.success(`Loaded ${result.patients.length} patients`)
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch patients"
      set({
        error: errorMessage,
        loading: false,
      })
      toast.error(errorMessage)
    }
  },

  fetchPatientById: async (id) => {
    try {
      set({ loading: true, error: null })
      const patient = await PatientService.getPatientById(id)
      set({ selectedPatient: patient, loading: false })
      
      toast.success(`Patient ${patient.firstName} ${patient.lastName} loaded`)
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch patient"
      set({
        error: errorMessage,
        loading: false,
      })
      toast.error(errorMessage)
    }
  },

  createPatient: async (data) => {
    const loadingToast = toast.loading("Creating patient...")
    
    try {
      set({ loading: true, error: null })
      const newPatient = await PatientService.createPatient(data)
      
      set((state) => ({
        patients: [...state.patients, newPatient],
        loading: false,
      }))
      
      toast.success(
        `Patient ${newPatient.firstName} ${newPatient.lastName} created successfully`,
        { id: loadingToast }
      )
      
      return newPatient
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create patient"
      set({
        error: errorMessage,
        loading: false,
      })
      
      toast.error(errorMessage, { id: loadingToast })
      throw err
    }
  },

  updatePatient: async (id, data) => {
    const loadingToast = toast.loading("Updating patient...")
    
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
      
      toast.success(
        `Patient ${updatedPatient.firstName} ${updatedPatient.lastName} updated successfully`,
        { id: loadingToast }
      )
      
      return updatedPatient
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update patient"
      set({
        error: errorMessage,
        loading: false,
      })
      
      toast.error(errorMessage, { id: loadingToast })
      throw err
    }
  },

  deletePatient: async (id) => {
    // Get patient name before deletion for the success message
    const { patients } = get()
    const patientToDelete = patients.find(p => p.id === id || p._id === id)
    const patientName = patientToDelete 
      ? `${patientToDelete.firstName} ${patientToDelete.lastName}` 
      : "Patient"

    const loadingToast = toast.loading("Deleting patient...")
    
    try {
      set({ loading: true, error: null })
      await PatientService.deletePatient(id)
      
      set((state) => ({
        patients: state.patients.filter((patient) => 
          patient.id !== id && patient._id !== id
        ),
        loading: false,
      }))
      
      toast.success(
        `${patientName} deleted successfully`,
        { id: loadingToast }
      )
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete patient"
      set({
        error: errorMessage,
        loading: false,
      })
      
      toast.error(errorMessage, { id: loadingToast })
      throw err
    }
  },

  clearSelectedPatient: () => set({ selectedPatient: null }),
  
  clearError: () => {
    set({ error: null })
    // Optionally dismiss any error toasts
    toast.dismiss()
  },
}))