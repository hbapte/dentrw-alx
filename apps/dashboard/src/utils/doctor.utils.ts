/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Doctor, DoctorFormData, Availability, TimeSlot, DayOfWeek } from "../types/doctor.types"

/**
 * Formats a doctor's full name
 */
export const getDoctorFullName = (doctor: Doctor): string => {
  if (doctor.user?.names) {
    return doctor.user.names
  }
  return "Dr. Unknown"
}

/**
 * Converts a doctor object to form data for editing
 */
export const doctorToFormData = (doctor: Doctor): DoctorFormData => {
  return {
    userId: doctor.user?._id?.toString(),
    specialization: doctor.specialization || "",
    qualifications: doctor.qualifications?.join(", ") || "",
    experience: doctor.experience || 0,
    licenseNumber: doctor.licenseNumber || "",
    bio: doctor.bio || "",
    languages: doctor.languages?.join(", ") || "",
    consultationFee: doctor.consultationFee || 0,
    availability: doctor.availability || [],
  }
}

/**
 * Formats form data for API submission
 */
export const formatDoctorFormData = (formData: DoctorFormData): any => {
  const result: any = {
    specialization: formData.specialization,
    experience: formData.experience,
    licenseNumber: formData.licenseNumber,
    bio: formData.bio,
    consultationFee: formData.consultationFee,
  }

  if (formData.userId) {
    result.user = formData.userId
  }

  if (formData.qualifications) {
    result.qualifications = formData.qualifications.split(",").map((q) => q.trim())
  }

  if (formData.languages) {
    result.languages = formData.languages.split(",").map((l) => l.trim())
  }

  if (formData.availability) {
    result.availability = formData.availability
  }

  return result
}

/**
 * Creates a new empty time slot
 */
export const createEmptyTimeSlot = (): TimeSlot => {
  return {
    startTime: "09:00",
    endTime: "10:00",
    id: Math.random().toString(36).substring(2, 9),
  }
}

/**
 * Creates a new empty availability for a day
 */
export const createEmptyAvailability = (day: DayOfWeek): Availability => {
  return {
    day,
    slots: [createEmptyTimeSlot()],
  }
}

/**
 * Gets the days of the week in order
 */
export const getDaysOfWeek = (): DayOfWeek[] => {
  return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}

/**
 * Formats a day of the week for display
 */
export const formatDayOfWeek = (day: DayOfWeek): string => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

/**
 * Checks if a doctor is available on a specific day
 */
export const isDoctorAvailableOnDay = (doctor: Doctor, day: DayOfWeek): boolean => {
  return doctor.availability?.some((a) => a.day === day && a.slots.length > 0) || false
}

/**
 * Gets all available time slots for a specific day
 */
export const getAvailableSlotsForDay = (doctor: Doctor, day: DayOfWeek): TimeSlot[] => {
  const availability = doctor.availability?.find((a) => a.day === day)
  return availability?.slots || []
}

/**
 * Formats a rating as stars (e.g., "★★★★☆")
 */
export const formatRatingAsStars = (rating: number): string => {
  const fullStars = Math.floor(rating)
  const emptyStars = 5 - fullStars
  return "★".repeat(fullStars) + "☆".repeat(emptyStars)
}
