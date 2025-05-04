/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import AppointmentService from "../services/appointment.service"
import type { AppointmentState } from "../types/appointment.types"

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  selectedAppointment: null,
  upcomingAppointments: [],
  appointmentsByDate: [],
  statistics: null,
  loading: false,
  error: null,

  fetchAppointments: async () => {
    try {
      set({ loading: true, error: null })
      const appointments = await AppointmentService.getAllAppointments()
      set({ appointments, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch appointments",
        loading: false,
      })
    }
  },

  fetchAppointmentById: async (id) => {
    try {
      set({ loading: true, error: null })
      const appointment = await AppointmentService.getAppointmentById(id)
      set({ selectedAppointment: appointment, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch appointment",
        loading: false,
      })
    }
  },

  fetchUpcomingAppointments: async () => {
    try {
      set({ loading: true, error: null })
      const appointments = await AppointmentService.getUpcomingAppointments()
      set({ upcomingAppointments: appointments, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch upcoming appointments",
        loading: false,
      })
    }
  },

  fetchAppointmentsByDate: async (date) => {
    try {
      set({ loading: true, error: null })
      const appointments = await AppointmentService.getAppointmentsByDate(date)
      set({ appointmentsByDate: appointments, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch appointments by date",
        loading: false,
      })
    }
  },

  fetchStatistics: async () => {
    try {
      set({ loading: true, error: null })
      const statistics = await AppointmentService.getAppointmentStats()
      set({ statistics, loading: false })
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch statistics",
        loading: false,
      })
    }
  },

  createAppointment: async (data) => {
    try {
      set({ loading: true, error: null })
      const newAppointment = await AppointmentService.createAppointment(data)
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create appointment",
        loading: false,
      })
      throw err
    }
  },

  updateAppointment: async (id, data) => {
    try {
      set({ loading: true, error: null })
      const updatedAppointment = await AppointmentService.updateAppointment(id, data)
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: updatedAppointment,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update appointment",
        loading: false,
      })
      throw err
    }
  },

  cancelAppointment: async (id, reason) => {
    try {
      set({ loading: true, error: null })
      const updatedAppointment = await AppointmentService.cancelAppointment(id, reason)
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: updatedAppointment,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to cancel appointment",
        loading: false,
      })
      throw err
    }
  },

  changeAppointmentStatus: async (id, status) => {
    try {
      set({ loading: true, error: null })
      const updatedAppointment = await AppointmentService.changeAppointmentStatus(id, status)
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: updatedAppointment,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to change appointment status",
        loading: false,
      })
      throw err
    }
  },

  addAppointmentReminder: async (id, type) => {
    try {
      set({ loading: true, error: null })
      const updatedAppointment = await AppointmentService.addAppointmentReminder(id, type)
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: updatedAppointment,
        loading: false,
      }))
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to add appointment reminder",
        loading: false,
      })
      throw err
    }
  },

  checkDoctorAvailability: async (data) => {
    try {
      set({ loading: true, error: null })
      const isAvailable = await AppointmentService.checkDoctorAvailability(data)
      set({ loading: false })
      return isAvailable
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to check doctor availability",
        loading: false,
      })
      return false
    }
  },

  clearSelectedAppointment: () => set({ selectedAppointment: null }),
  clearError: () => set({ error: null }),
}))
