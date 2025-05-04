/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import DoctorService from "../services/doctor.service"
import type { DoctorState } from "../types/doctor.types"

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,

  fetchDoctors: async () => {
    try {
      set({ loading: true, error: null })
      const doctors = await DoctorService.getAllDoctors()
      set({ doctors, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch doctors",
        loading: false,
      })
    }
  },

  fetchDoctorById: async (id) => {
    try {
      set({ loading: true, error: null })
      const doctor = await DoctorService.getDoctorById(id)
      set({ selectedDoctor: doctor, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch doctor",
        loading: false,
      })
    }
  },

  createDoctor: async (data) => {
    try {
      set({ loading: true, error: null })
      const newDoctor = await DoctorService.createDoctor(data)
      set((state) => ({
        doctors: [...state.doctors, newDoctor],
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create doctor",
        loading: false,
      })
      throw err
    }
  },

  updateDoctor: async (id, data) => {
    try {
      set({ loading: true, error: null })
      const updatedDoctor = await DoctorService.updateDoctor(id, data)
      set((state) => ({
        doctors: state.doctors.map((doctor) => (doctor.id === id ? updatedDoctor : doctor)),
        selectedDoctor: updatedDoctor,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update doctor",
        loading: false,
      })
      throw err
    }
  },

  deleteDoctor: async (id) => {
    try {
      set({ loading: true, error: null })
      await DoctorService.deleteDoctor(id)
      set((state) => ({
        doctors: state.doctors.filter((doctor) => doctor.id !== id),
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete doctor",
        loading: false,
      })
      throw err
    }
  },

  addRating: async (doctorId, rating, review) => {
    try {
      set({ loading: true, error: null })
      await DoctorService.addRating(doctorId, rating, review)

      // Refresh the doctor data to get updated ratings
      await get().fetchDoctorById(doctorId)
      set({ loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to add rating",
        loading: false,
      })
      throw err
    }
  },

  clearSelectedDoctor: () => set({ selectedDoctor: null }),
  clearError: () => set({ error: null }),
}))
