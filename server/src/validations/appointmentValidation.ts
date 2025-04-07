import Joi from "joi"

// Create appointment validation schema
export const createAppointmentSchema = Joi.object({
  patientId: Joi.string().required().messages({
    "string.empty": "Patient ID is required",
    "any.required": "Patient ID is required",
  }),
  doctorId: Joi.string().required().messages({
    "string.empty": "Doctor ID is required",
    "any.required": "Doctor ID is required",
  }),
  date: Joi.date().required().min("now").messages({
    "date.base": "Date must be a valid date",
    "date.min": "Date cannot be in the past",
    "any.required": "Date is required",
  }),
  startTime: Joi.string()
    .required()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "Start time must be in HH:MM format",
      "any.required": "Start time is required",
    }),
  endTime: Joi.string()
    .required()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "End time must be in HH:MM format",
      "any.required": "End time is required",
    }),
  type: Joi.string().required().valid("consultation", "checkup", "treatment", "follow-up").messages({
    "any.only": "Type must be one of: consultation, checkup, treatment, follow-up",
    "any.required": "Type is required",
  }),
  reason: Joi.string().required().min(3).max(500).messages({
    "string.min": "Reason must be at least 3 characters long",
    "string.max": "Reason cannot exceed 500 characters",
    "any.required": "Reason is required",
  }),
  notes: Joi.string().max(1000).allow("").messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
})

// Update appointment validation schema
export const updateAppointmentSchema = Joi.object({
  date: Joi.date().min("now").messages({
    "date.base": "Date must be a valid date",
    "date.min": "Date cannot be in the past",
  }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "Start time must be in HH:MM format",
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "End time must be in HH:MM format",
    }),
  type: Joi.string().valid("consultation", "checkup", "treatment", "follow-up").messages({
    "any.only": "Type must be one of: consultation, checkup, treatment, follow-up",
  }),
  reason: Joi.string().min(3).max(500).messages({
    "string.min": "Reason must be at least 3 characters long",
    "string.max": "Reason cannot exceed 500 characters",
  }),
  notes: Joi.string().max(1000).allow("").messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
})

// Cancel appointment validation schema
export const cancelAppointmentSchema = Joi.object({
  cancellationReason: Joi.string().min(3).max(500).messages({
    "string.min": "Cancellation reason must be at least 3 characters long",
    "string.max": "Cancellation reason cannot exceed 500 characters",
  }),
})

// Change appointment status validation schema
export const changeAppointmentStatusSchema = Joi.object({
  status: Joi.string().required().valid("scheduled", "confirmed", "completed", "cancelled", "no-show").messages({
    "any.only": "Status must be one of: scheduled, confirmed, completed, cancelled, no-show",
    "any.required": "Status is required",
  }),
})

// Check availability validation schema
export const checkAvailabilitySchema = Joi.object({
  doctorId: Joi.string().required().messages({
    "string.empty": "Doctor ID is required",
    "any.required": "Doctor ID is required",
  }),
  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),
  startTime: Joi.string()
    .required()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "Start time must be in HH:MM format",
      "any.required": "Start time is required",
    }),
  endTime: Joi.string()
    .required()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "End time must be in HH:MM format",
      "any.required": "End time is required",
    }),
  appointmentId: Joi.string().allow(null, ""),
})

