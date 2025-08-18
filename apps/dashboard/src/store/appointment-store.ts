/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import AppointmentService from "../services/appointment.service"
import type { 
  AppointmentState, 
  // AppointmentPaginationParams, 
  AppointmentFilterParams,
  PaginationMeta
} from "../types/appointment.types"

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
}

const DEFAULT_FILTERS: AppointmentFilterParams = {
  doctorId: undefined,
  patientId: undefined,
  status: undefined,
  type: undefined,
  startDate: undefined,
  endDate: undefined,
  search: undefined
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  selectedAppointment: null,
  upcomingAppointments: [],
  appointmentsByDate: [],
  statistics: null,
  loading: false,
  error: null,
  pagination: DEFAULT_PAGINATION,
  filters: DEFAULT_FILTERS,

  fetchAppointments: async (params) => {
    try {
      set({ loading: true, error: null })
      
      // Combine current filters with any new params
      const currentFilters = get().filters
      const currentPage = get().pagination.page
      
      const queryParams = {
        page: params?.page || currentPage,
        limit: params?.limit || 10,
        ...currentFilters,
        ...params
      }
      
      const result = await AppointmentService.getAllAppointments(queryParams)
      
      set({ 
        appointments: result.appointments, 
        pagination: result.pagination,
        loading: false 
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to fetch appointments"
      
      set({
        error: errorMessage,
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
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to fetch appointment"
      
      set({
        error: errorMessage,
        loading: false,
      })
    }
  },

  fetchUpcomingAppointments: async (limit) => {
    try {
      set({ loading: true, error: null })
      const appointments = await AppointmentService.getUpcomingAppointments(limit)
      set({ upcomingAppointments: appointments, loading: false })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to fetch upcoming appointments"
      
      set({
        error: errorMessage,
        loading: false,
      })
    }
  },

  fetchAppointmentsByDate: async (date, doctorId) => {
    try {
      set({ loading: true, error: null })
      const appointments = await AppointmentService.getAppointmentsByDate(date, doctorId)
      set({ appointmentsByDate: appointments, loading: false })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to fetch appointments by date"
      
      set({
        error: errorMessage,
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
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to fetch statistics"
      
      set({
        error: errorMessage,
        loading: false,
      })
    }
  },

  createAppointment: async (data) => {
    try {
      set({ loading: true, error: null })
      const newAppointment = await AppointmentService.createAppointment(data)
      
      // Update appointments list if we have appointments loaded
      set((state) => {
        if (state.appointments.length > 0) {
          return {
            appointments: [...state.appointments, newAppointment],
            loading: false,
          }
        }
        return { loading: false }
      })
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to create appointment"
      
      set({
        error: errorMessage,
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
          appointment.id === id || appointment._id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: state.selectedAppointment && 
          (state.selectedAppointment.id === id || state.selectedAppointment._id === id) 
            ? updatedAppointment 
            : state.selectedAppointment,
        loading: false,
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to update appointment"
      
      set({
        error: errorMessage,
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
          appointment.id === id || appointment._id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: state.selectedAppointment && 
          (state.selectedAppointment.id === id || state.selectedAppointment._id === id) 
            ? updatedAppointment 
            : state.selectedAppointment,
        loading: false,
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to cancel appointment"
      
      set({
        error: errorMessage,
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
          appointment.id === id || appointment._id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: state.selectedAppointment && 
          (state.selectedAppointment.id === id || state.selectedAppointment._id === id) 
            ? updatedAppointment 
            : state.selectedAppointment,
        loading: false,
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to change appointment status"
      
      set({
        error: errorMessage,
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
          appointment.id === id || appointment._id === id ? updatedAppointment : appointment,
        ),
        selectedAppointment: state.selectedAppointment && 
          (state.selectedAppointment.id === id || state.selectedAppointment._id === id) 
            ? updatedAppointment 
            : state.selectedAppointment,
        loading: false,
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to add appointment reminder"
      
      set({
        error: errorMessage,
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
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to check doctor availability"
      
      set({
        error: errorMessage,
        loading: false,
      })
      return false
    }
  },
  
  // Filter and pagination actions
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      // Reset to page 1 when filters change
      pagination: { ...state.pagination, page: 1 }
    }))
    
    // Fetch appointments with new filters
    get().fetchAppointments({ page: 1, ...filters })
  },
  
  resetFilters: () => {
    set({ 
      filters: DEFAULT_FILTERS,
      pagination: { ...get().pagination, page: 1 }
    })
    
    // Fetch appointments with reset filters
    get().fetchAppointments({ page: 1 })
  },
  
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }))
    
    // Fetch appointments for the new page
    get().fetchAppointments({ page })
  },

  clearSelectedAppointment: () => set({ selectedAppointment: null }),
  clearError: () => set({ error: null }),
}))
