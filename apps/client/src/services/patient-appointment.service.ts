/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"
import type { DentalAppointment } from "@/types/dental-appointment.types"

interface PatientAppointmentsResponse {
  success: boolean
  data: {
    appointments: DentalAppointment[]
  }
  message: string
  error: null
  metadata: {
    requestId: string
    serverTimestamp: number
    processingTime: number
    serverTimeZone: string
    apiVersion: string
    requestMethod: string
    requestPath: string
    userAgent: string
    clientIp: string
    environment: string
    serverName: string
    responseTime: string
    links: {
      self: string
      patient: string
    }
  }
}

interface AppointmentFormData {
  patientId: string
  doctorId: string
  date: string
  startTime: string
  endTime: string
  type: "consultation" | "checkup" | "treatment" | "follow-up"
  reason: string
  notes?: string
}

const PatientAppointmentService = {
  getPatientAppointments: async (patientId: string): Promise<DentalAppointment[]> => {
    const response = await api.get<PatientAppointmentsResponse>(`/appointments/by-patient/${patientId}`)
    return response.data.data.appointments || []
  },

  createAppointment: async (data: AppointmentFormData): Promise<DentalAppointment> => {
    const response = await api.post<{ data: DentalAppointment }>("/appointments", {
      patient: data.patientId,
      doctor: data.doctorId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
      reason: data.reason,
      notes: data.notes || "",
      status: "scheduled",
    })
    return response.data.data
  },

  updateAppointment: async (appointmentId: string, data: Partial<AppointmentFormData>): Promise<DentalAppointment> => {
    const updateData: any = {}

    if (data.doctorId) updateData.doctor = data.doctorId
    if (data.date) updateData.date = data.date
    if (data.startTime) updateData.startTime = data.startTime
    if (data.endTime) updateData.endTime = data.endTime
    if (data.type) updateData.type = data.type
    if (data.reason) updateData.reason = data.reason
    if (data.notes !== undefined) updateData.notes = data.notes

    const response = await api.put<{ data: DentalAppointment }>(`/appointments/${appointmentId}`, updateData)
    return response.data.data
  },

  cancelAppointment: async (appointmentId: string, reason: string): Promise<DentalAppointment> => {
    const response = await api.patch<{ data: DentalAppointment }>(`/appointments/${appointmentId}/cancel`, {
      cancellationReason: reason,
    })
    return response.data.data
  },

  changeAppointmentStatus: async (
    appointmentId: string,
    status: DentalAppointment["status"],
  ): Promise<DentalAppointment> => {
    const response = await api.patch<{ data: DentalAppointment }>(`/appointments/${appointmentId}/status`, { status })
    return response.data.data
  },
}

export default PatientAppointmentService
