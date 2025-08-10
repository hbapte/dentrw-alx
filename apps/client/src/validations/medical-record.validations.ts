import { z } from "zod"

/**
 * Validation schema for prescription
 */
export const prescriptionSchema = z.object({
  id: z.string().optional(),
  medication: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
})

/**
 * Validation schema for attachment
 */
export const attachmentSchema = z.object({
  name: z.string().min(1, "File name is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  fileType: z.string().min(1, "File type is required"),
})

/**
 * Validation schema for medical record form data
 */
export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentId: z.string().min(1, "Appointment is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  treatment: z.string().min(1, "Treatment is required"),
  notes: z.string().optional(),
  followUpRequired: z.boolean(),
  followUpDate: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Follow-up date must be in YYYY-MM-DD format",
    }),
  prescription: z.array(prescriptionSchema),
})

export type PrescriptionSchema = z.infer<typeof prescriptionSchema>
export type AttachmentSchema = z.infer<typeof attachmentSchema>
export type MedicalRecordSchema = z.infer<typeof medicalRecordSchema>
