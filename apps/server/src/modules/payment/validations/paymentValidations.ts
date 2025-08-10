/* eslint-disable @typescript-eslint/no-explicit-any */
import Joi from "joi"

// Validate create payment request
export const validateCreatePayment = (data: any) => {
  const schema = Joi.object({
    appointmentId: Joi.string().required().messages({
      "string.empty": "Appointment ID is required",
      "any.required": "Appointment ID is required",
    }),
    patientId: Joi.string().required().messages({
      "string.empty": "Patient ID is required",
      "any.required": "Patient ID is required",
    }),
    serviceId: Joi.string().allow(null, "").messages({
      "string.empty": "Service ID must be a valid ID if provided",
    }),
    amount: Joi.number().min(0).required().messages({
      "number.base": "Amount must be a number",
      "number.min": "Amount must be positive",
      "any.required": "Amount is required",
    }),
    currency: Joi.string().length(3).default("RWF").messages({
      "string.length": "Currency must be a 3-letter code",
    }),
    paymentMethod: Joi.string().valid("stripe", "MoMo", "cash").required().messages({
      "any.only": "Payment method must be one of: stripe, MoMo, cash",
      "any.required": "Payment method is required",
    }),
    metadata: Joi.object().default({}),
  })

  return schema.validate(data, { abortEarly: false })
}

// Validate update payment request
export const validateUpdatePayment = (data: any) => {
  const schema = Joi.object({
    status: Joi.string().valid("pending", "completed", "failed", "refunded").required().messages({
      "any.only": "Status must be one of: pending, completed, failed, refunded",
      "any.required": "Status is required",
    }),
    transactionId: Joi.string().allow(null, ""),
    receiptUrl: Joi.string().uri().allow(null, "").messages({
      "string.uri": "Receipt URL must be a valid URL",
    }),
  })

  return schema.validate(data, { abortEarly: false })
}

// Validate refund request
export const validateRefund = (data: any) => {
  const schema = Joi.object({
    refundAmount: Joi.number().greater(0).required().messages({
      "number.base": "Refund amount must be a number",
      "number.greater": "Refund amount must be positive",
      "any.required": "Refund amount is required",
    }),
    refundReason: Joi.string().required().messages({
      "string.empty": "Refund reason is required",
      "any.required": "Refund reason is required",
    }),
  })

  return schema.validate(data, { abortEarly: false })
}

// Validate get payments query parameters
export const validateGetPaymentsQuery = (data: any) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
    sortBy: Joi.string().default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
      "any.only": "Sort order must be asc or desc",
    }),
    patientId: Joi.string().allow(null, ""),
    appointmentId: Joi.string().allow(null, ""),
    doctorId: Joi.string().allow(null, ""),
    status: Joi.string().valid("pending", "completed", "failed", "refunded").allow(null, "").messages({
      "any.only": "Status must be one of: pending, completed, failed, refunded",
    }),
    paymentMethod: Joi.string().valid("stripe", "MoMo", "cash").allow(null, "").messages({
      "any.only": "Payment method must be one of: stripe, MoMo, cash",
    }),
    startDate: Joi.date().iso().allow(null, "").messages({
      "date.base": "Start date must be a valid date",
      "date.format": "Start date must be in ISO format",
    }),
    endDate: Joi.date().iso().allow(null, "").messages({
      "date.base": "End date must be a valid date",
      "date.format": "End date must be in ISO format",
    }),
    minAmount: Joi.number().min(0).allow(null, "").messages({
      "number.base": "Minimum amount must be a number",
      "number.min": "Minimum amount must be non-negative",
    }),
    maxAmount: Joi.number().min(0).allow(null, "").messages({
      "number.base": "Maximum amount must be a number",
      "number.min": "Maximum amount must be non-negative",
    }),
  })

  return schema.validate(data, { abortEarly: false })
}

// Validate service price
export const validateServicePrice = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(100).messages({
      "string.empty": "Service name is required",
      "string.min": "Service name must be at least 3 characters long",
      "string.max": "Service name cannot exceed 100 characters",
      "any.required": "Service name is required",
    }),
    code: Joi.string().required().min(2).max(20).pattern(/^[A-Z0-9-_]+$/).messages({
      "string.empty": "Service code is required",
      "string.min": "Service code must be at least 2 characters long",
      "string.max": "Service code cannot exceed 20 characters",
      "string.pattern.base": "Service code must contain only uppercase letters, numbers, hyphens, and underscores",
      "any.required": "Service code is required",
    }),
    description: Joi.string().max(500).allow("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    price: Joi.number().required().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price must be non-negative",
      "any.required": "Price is required",
    }),
    category: Joi.string().required().messages({
      "string.empty": "Category is required",
      "any.required": "Category is required",
    }),
    duration: Joi.number().integer().min(5).default(30).messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.min": "Duration must be at least 5 minutes",
    }),
    active: Joi.boolean().default(true),
    taxable: Joi.boolean().default(true),
    taxRate: Joi.number().min(0).max(1).default(0.18).messages({
      "number.base": "Tax rate must be a number",
      "number.min": "Tax rate must be non-negative",
      "number.max": "Tax rate cannot exceed 1 (100%)",
    }),
  })

  return schema.validate(data, { abortEarly: false })
}

// Validate update service price
export const validateUpdateServicePrice = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).messages({
      "string.min": "Service name must be at least 3 characters long",
      "string.max": "Service name cannot exceed 100 characters",
    }),
    description: Joi.string().max(500).allow("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    price: Joi.number().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price must be non-negative",
    }),
    category: Joi.string(),
    duration: Joi.number().integer().min(5).messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.min": "Duration must be at least 5 minutes",
    }),
    active: Joi.boolean(),
    taxable: Joi.boolean(),
    taxRate: Joi.number().min(0).max(1).messages({
      "number.base": "Tax rate must be a number",
      "number.min": "Tax rate must be non-negative",
      "number.max": "Tax rate cannot exceed 1 (100%)",
    }),
  })
    .min(1) // At least one field must be present
    .messages({
      "object.min": "At least one field must be provided for update",
    })

  return schema.validate(data, { abortEarly: false })
}
