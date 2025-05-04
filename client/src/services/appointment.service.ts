/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { Appointment, AppointmentFormData, AvailabilityCheckData } from "../types/appointment.types"
import { formatAppointmentFormData } from "../utils/appointment.utils"

const AppointmentService = {
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get("/appointments")
    return response.data.data.appointments || response.data
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`)
    return response.data.data || response.data
  },

  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get("/appointments/upcoming")
    return response.data.data.appointments || response.data
  },

  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/by-date?date=${date}`)
    return response.data.data.appointments || response.data
  },

  getAppointmentStats: async (): Promise<any> => {
    const response = await api.get("/appointments/stats")
    return response.data.data
  },

  createAppointment: async (data: AppointmentFormData): Promise<Appointment> => {
    const formattedData = formatAppointmentFormData(data)
    const response = await api.post("/appointments", formattedData)
    return response.data.data || response.data
  },

  updateAppointment: async (id: string, data: Partial<AppointmentFormData>): Promise<Appointment> => {
    const formattedData = formatAppointmentFormData(data)
    const response = await api.put(`/appointments/${id}`, formattedData)
    return response.data.data || response.data
  },

  cancelAppointment: async (id: string, reason: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason })
    return response.data.data || response.data
  },

  changeAppointmentStatus: async (id: string, status: Appointment["status"]): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/status`, { status })
    return response.data.data || response.data
  },

  addAppointmentReminder: async (id: string, type: "email" | "sms"): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/reminders`, { type })
    return response.data.data || response.data
  },

  checkDoctorAvailability: async (data: AvailabilityCheckData): Promise<boolean> => {
    const response = await api.post("/appointments/check-availability", data)
    return response.data.data.available || false
  },
}

export default AppointmentService
