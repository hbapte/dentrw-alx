import { z } from "zod"
import { getDaysOfWeek } from "../utils/doctor.utils"

const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  id: z.string().optional(),
})

const availabilitySchema = z.object({
  day: z.enum(getDaysOfWeek() as [string, ...string[]]),
  slots: z.array(timeSlotSchema),
})

/**
 * Validation schema for doctor form data
 */
export const doctorSchema = z.object({
  userId: z.string().optional(),
  specialization: z.string().min(1, "Specialization is required"),
  qualifications: z.string().min(1, "Qualifications are required"),
  experience: z.number().min(0, "Experience must be a positive number"),
  licenseNumber: z.string().min(1, "License number is required"),
  bio: z.string().optional(),
  languages: z.string().min(1, "Languages are required"),
  consultationFee: z.number().min(0, "Consultation fee must be a positive number"),
  availability: z.array(availabilitySchema).optional(),
})

/**
 * Validation schema for doctor rating
 */
export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().min(1, "Review is required"),
})

export type DoctorFormSchema = z.infer<typeof doctorSchema>
export type RatingSchema = z.infer<typeof ratingSchema>
