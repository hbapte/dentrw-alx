import Joi from "joi"

// Create medical record validation schema
export const createMedicalRecordSchema = Joi.object({
  patientId: Joi.string().required().messages({
    "string.empty": "Patient ID is required",
    "any.required": "Patient ID is required",
  }),
  doctorId: Joi.string().required().messages({
    "string.empty": "Doctor ID is required",
    "any.required": "Doctor ID is required",
  }),
  appointmentId: Joi.string().required().messages({
    "string.empty": "Appointment ID is required",
    "any.required": "Appointment ID is required",
  }),
  diagnosis: Joi.string().required().min(3).max(500).messages({
    "string.min": "Diagnosis must be at least 3 characters long",
    "string.max": "Diagnosis cannot exceed 500 characters",
    "any.required": "Diagnosis is required",
  }),
  treatment: Joi.string().required().min(3).max(1000).messages({
    "string.min": "Treatment must be at least 3 characters long",
    "string.max": "Treatment cannot exceed 1000 characters",
    "any.required": "Treatment is required",
  }),
  prescription: Joi.array().items(
    Joi.object({
      medication: Joi.string().required().messages({
        "string.empty": "Medication name is required",
        "any.required": "Medication name is required",
      }),
      dosage: Joi.string().required().messages({
        "string.empty": "Dosage is required",
        "any.required": "Dosage is required",
      }),
      frequency: Joi.string().required().messages({
        "string.empty": "Frequency is required",
        "any.required": "Frequency is required",
      }),
      duration: Joi.string().required().messages({
        "string.empty": "Duration is required",
        "any.required": "Duration is required",
      }),
      notes: Joi.string().allow("").max(500).messages({
        "string.max": "Notes cannot exceed 500 characters",
      }),
    }),
  ),
  notes: Joi.string().max(1000).allow("").messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
  followUpRequired: Joi.boolean().default(false),
  followUpDate: Joi.date().when("followUpRequired", {
    is: true,
    then: Joi.date().required().min("now").messages({
      "date.base": "Follow-up date must be a valid date",
      "date.min": "Follow-up date cannot be in the past",
      "any.required": "Follow-up date is required when follow-up is required",
    }),
  }),
})

// Update medical record validation schema
export const updateMedicalRecordSchema = Joi.object({
  diagnosis: Joi.string().min(3).max(500).messages({
    "string.min": "Diagnosis must be at least 3 characters long",
    "string.max": "Diagnosis cannot exceed 500 characters",
  }),
  treatment: Joi.string().min(3).max(1000).messages({
    "string.min": "Treatment must be at least 3 characters long",
    "string.max": "Treatment cannot exceed 1000 characters",
  }),
  notes: Joi.string().max(1000).allow("").messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
  followUpRequired: Joi.boolean(),
  followUpDate: Joi.date().when("followUpRequired", {
    is: true,
    then: Joi.date().required().min("now").messages({
      "date.base": "Follow-up date must be a valid date",
      "date.min": "Follow-up date cannot be in the past",
      "any.required": "Follow-up date is required when follow-up is required",
    }),
  }),
})

// Prescription validation schema
export const prescriptionSchema = Joi.object({
  medication: Joi.string().required().messages({
    "string.empty": "Medication name is required",
    "any.required": "Medication name is required",
  }),
  dosage: Joi.string().required().messages({
    "string.empty": "Dosage is required",
    "any.required": "Dosage is required",
  }),
  frequency: Joi.string().required().messages({
    "string.empty": "Frequency is required",
    "any.required": "Frequency is required",
  }),
  duration: Joi.string().required().messages({
    "string.empty": "Duration is required",
    "any.required": "Duration is required",
  }),
  notes: Joi.string().allow("").max(500).messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
})

// Attachment validation schema
export const attachmentSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Attachment name is required",
    "any.required": "Attachment name is required",
  }),
  fileUrl: Joi.string().required().uri().messages({
    "string.empty": "File URL is required",
    "string.uri": "File URL must be a valid URL",
    "any.required": "File URL is required",
  }),
  fileType: Joi.string().required().messages({
    "string.empty": "File type is required",
    "any.required": "File type is required",
  }),
})

