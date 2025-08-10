// client\src\types\dental-appointment.types.ts
export interface DentalAppointment {
  _id: string
  patient: {
    _id: string
    names: string
    email?: string
    phoneNumber?: string
  }
  doctor: {
    _id: string
    user: {
      names: string
      email: string
    }
    specialization: string[]
  }
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  type: "consultation" | "checkup" | "treatment" | "follow-up"
  notes?: string
  reason: string
  payment?: string
  reminders?: Array<{
    type: "email" | "sms"
    sentAt: Date
    status: "sent" | "failed"
  }>
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  _id: string
  user: {
    _id: string
    names: string
    email: string
    phoneNumber?: string
  }
  specialization: string[]
  subSpecializations?: string[]
  qualifications: Array<{
    degree: string
    institution: string
    year: number
    country: string
  }>
  experience: number
  licenseNumber: string
  bio?: string
  languages: string[]
  dentalSpecialties: string[]
  procedures: string[]
  workingHours: Array<{
    day: string
    isWorking: boolean
    slots: Array<{
      startTime: string
      endTime: string
      breakStart?: string
      breakEnd?: string
    }>
  }>
  availability: Array<{
    day: string
    slots: Array<{
      startTime: string
      endTime: string
      maxPatients: number
      appointmentDuration: number
    }>
  }>
  isActive: boolean
  isVerified: boolean
  averageRating: number
  totalReviews: number
}

export interface Patient {
  _id: string
  names: string
  email?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  address?: string
}
