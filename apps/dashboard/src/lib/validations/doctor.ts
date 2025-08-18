import { z } from "zod/v3"

// Base schemas for reusable validation
const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")

const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[+]?[1-9][\d]{0,15}$/, "Invalid phone number format")

const emailSchema = z.string().email("Invalid email format").min(1, "Email is required")

// Days off schema
const dayOffSchema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(["weekly", "monthly", "yearly"]).optional(),
})

// Main doctor form schema
export const doctorFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  profilePicture: z.string().url("Invalid profile picture URL").optional(),

  // Professional Information
  specializations: z.array(z.string()).min(1, "At least one specialization is required"),
  qualifications: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        institution: z.string().min(1, "Institution is required"),
        year: z.number().min(1950, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future"),
      }),
    )
    .min(1, "At least one qualification is required"),
  experience: z.number().min(0, "Experience cannot be negative").max(70, "Experience seems too high"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiryDate: z.string().min(1, "License expiry date is required"),

  // Practice Details
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio must not exceed 1000 characters"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  consultationFee: z.number().min(0, "Consultation fee cannot be negative"),
  followUpFee: z.number().min(0, "Follow-up fee cannot be negative"),
  emergencyFee: z.number().min(0, "Emergency fee cannot be negative"),
  certifications: z
    .array(
      z.object({
        name: z.string().min(1, "Certification name is required"),
        issuedBy: z.string().min(1, "Issuing organization is required"),
        issuedDate: z.string().min(1, "Issue date is required"),
        expiryDate: z.string().optional(),
      }),
    )
    .optional(),

  // Working Hours & Availability
  workingHours: z
    .array(
      z.object({
        day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
        isWorking: z.boolean(),
        shifts: z
          .array(
            z.object({
              startTime: timeSchema,
              endTime: timeSchema,
              breakStart: timeSchema.optional(),
              breakEnd: timeSchema.optional(),
            }),
          )
          .optional(),
      }),
    )
    .length(7, "Working hours for all 7 days are required"),
  daysOff: z.array(dayOffSchema).optional(),

  // Services
  services: z.array(z.string()).min(1, "At least one service must be selected"),

  // Status
  isActive: z.boolean().default(true),
})

export type DoctorFormData = z.infer<typeof doctorFormSchema>

// Step-specific schemas for validation
export const personalInfoSchema = doctorFormSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  profilePicture: true,
})

export const professionalInfoSchema = doctorFormSchema.pick({
  specializations: true,
  qualifications: true,
  experience: true,
  licenseNumber: true,
  licenseExpiryDate: true,
})

export const practiceDetailsSchema = doctorFormSchema.pick({
  bio: true,
  languages: true,
  consultationFee: true,
  followUpFee: true,
  emergencyFee: true,
  certifications: true,
})

export const doctorWorkingHoursSchema = doctorFormSchema.pick({
  workingHours: true,
})

export const doctorDaysOffSchema = doctorFormSchema.pick({
  daysOff: true,
})

export const doctorServicesSchema = doctorFormSchema.pick({
  services: true,
})
