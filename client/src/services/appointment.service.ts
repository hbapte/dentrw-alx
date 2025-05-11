// client\src\services\appointment.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "./api"
import type { 
  Appointment, 
  AppointmentFormData, 
  AvailabilityCheckData,
  AppointmentPaginationParams,
  AppointmentFilterParams,
  PaginatedAppointmentsResponse
} from "../types/appointment.types"
import { formatAppointmentFormData } from "../utils/appointment.utils"

const AppointmentService = {
  getAllAppointments: async (params?: AppointmentPaginationParams & AppointmentFilterParams): Promise<PaginatedAppointmentsResponse> => {
    const queryParams = new URLSearchParams()
    
    // Add pagination params
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    // Add filter params
    if (params?.doctorId) queryParams.append('doctorId', params.doctorId)
    if (params?.patientId) queryParams.append('patientId', params.patientId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    
    const url = `/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await api.get(url)
    
    return {
      appointments: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      },
      links: response.data.links || {}
    }
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`)
    return response.data.data?.appointment || response.data.data || response.data
  },

  getUpcomingAppointments: async (limit?: number): Promise<Appointment[]> => {
    const queryParams = limit ? `?limit=${limit}` : ''
    const response = await api.get(`/appointments/upcoming${queryParams}`)
    return response.data.data?.appointments || response.data.data || response.data
  },

  getAppointmentsByDate: async (date: string, doctorId?: string): Promise<Appointment[]> => {
    const queryParams = new URLSearchParams()
    queryParams.append('date', date)
    if (doctorId) queryParams.append('doctorId', doctorId)
    
    const response = await api.get(`/appointments/by-date?${queryParams.toString()}`)
    return response.data.data?.appointments || response.data.data || response.data
  },

  getAppointmentStats: async (): Promise<any> => {
    const response = await api.get("/appointments/stats")
    return response.data.data || response.data
  },

  createAppointment: async (data: AppointmentFormData): Promise<Appointment> => {
    const formattedData = formatAppointmentFormData({
      ...data,
      patientId: data.patientId || "",
      doctorId: data.doctorId || "",
      date: data.date || "",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      type: data.type || "consultation",
      notes: data.notes || "",
      reason: data.reason || ""
    })
    const response = await api.post("/appointments", formattedData)
    return response.data.data?.appointment || response.data.data || response.data
  },

  updateAppointment: async (id: string, data: Partial<AppointmentFormData>): Promise<Appointment> => {
    const formattedData = formatAppointmentFormData({
      ...data,
      patientId: data.patientId || "",
      doctorId: data.doctorId || "",
      date: data.date || "",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      type: data.type || "",
      notes: data.notes || "",
      reason: data.reason || ""
    })
    const response = await api.put(`/appointments/${id}`, formattedData)
    return response.data.data?.appointment || response.data.data || response.data
  },

  cancelAppointment: async (id: string, reason: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/cancel`, { cancellationReason: reason })
    return response.data.data?.appointment || response.data.data || response.data
  },

  changeAppointmentStatus: async (id: string, status: Appointment["status"]): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/status`, { status })
    return response.data.data?.appointment || response.data.data || response.data
  },

  addAppointmentReminder: async (id: string, type: "email" | "sms"): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/reminders`, { type })
    return response.data.data?.appointment || response.data.data || response.data
  },

  checkDoctorAvailability: async (data: AvailabilityCheckData): Promise<boolean> => {
    const response = await api.post("/appointments/check-availability", data)
    return response.data.data?.available || false
  },

  getAppointmentsNeedingReminders: async (hoursAhead: number = 24): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/needing-reminders?hoursAhead=${hoursAhead}`)
    return response.data.data?.appointments || response.data.data || response.data
  }
}

export default AppointmentService
