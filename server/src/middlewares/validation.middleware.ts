import type { Request, Response, NextFunction } from "express"
import Joi from "joi"

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")

      return res.status(400).json({
        error: "Validation error",
        details: errorMessage,
      })
    }

    next()
  }
}

// Registration validation schema
export const registerSchema = Joi.object({
  names: Joi.string().required().min(3).max(100).messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  username: Joi.string().min(3).max(30).alphanum().messages({
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
    "string.alphanum": "Username must only contain alphanumeric characters",
  }),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).messages({ "any.only": "Passwords do not match" }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .messages({ "string.pattern.base": "Please provide a valid phone number" }),
  preferredLanguage: Joi.string().valid("en", "fr", "rw").default("en"),
})

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).messages({ "string.empty": "Password is required", "string.min": "Invalid password" , "string.pattern.base": "Invalid password" }),
})

// Password reset request validation schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
})

// Password reset validation schema
export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).messages({ "any.only": "Passwords do not match" }),
})

// Update profile validation schema
export const updateProfileSchema = Joi.object({
  names: Joi.string().min(3).max(100).messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),
  username: Joi.string().min(3).max(30).alphanum().messages({
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
    "string.alphanum": "Username must only contain alphanumeric characters",
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .messages({ "string.pattern.base": "Please provide a valid phone number" }),
  preferredLanguage: Joi.string().valid("en", "fr", "rw"),
})

