/* eslint-disable @typescript-eslint/no-explicit-any */
// client\src\components\event-calendar\types.ts
export type CalendarView = "month" | "week" | "day" | "agenda"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: EventColor
  // Appointment-specific metadata
  appointmentId?: string
  patientId?: string
  doctorId?: string
  patientName?: string
  doctorName?: string
  type?: "consultation" | "checkup" | "treatment" | "follow-up"
  status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  reason?: string
  notes?: string
  location?: string // e.g., doctor's name or clinic location
  metadata?: Record<string, any> // Additional metadata for flexibility
  createdAt?: string // ISO date string
  updatedAt?: string // ISO date string
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald"
