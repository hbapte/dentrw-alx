import { z } from "zod"

/**
 * Validation schema for patient form data
 */
export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Date of birth must be in YYYY-MM-DD format",
  }),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
})

/**
 * Validation schema for emergency contact
 */
export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
})

/**
 * Validation schema for insurance information
 */
export const insuranceInfoSchema = z.object({
  provider: z.string().min(1, "Insurance provider is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  groupNumber: z.string().optional(),
  expiryDate: z.string().refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Expiry date must be in YYYY-MM-DD format",
  }).optional(),
})

/**
 * Validation schema for medical history
 */
export const medicalHistorySchema = z.object({
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

/**
 * Comprehensive patient validation schema
 */
export const completePatientSchema = patientSchema.extend({
  emergencyContact: emergencyContactSchema.optional(),
  insuranceInfo: insuranceInfoSchema.optional(),
  medicalHistory: medicalHistorySchema.optional(),
})

export type PatientFormSchema = z.infer<typeof patientSchema>
export type CompletePatientSchema = z.infer<typeof completePatientSchema>
