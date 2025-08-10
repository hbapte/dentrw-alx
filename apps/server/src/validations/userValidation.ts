
import Joi from "joi"

// Create user validation schema
export const createUserSchema = Joi.object({
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
    role: Joi.string().valid("patient", "doctor", "admin").required().messages({
      "string.empty": "Role is required",
      "any.only": "Role must be one of: patient, doctor, admin",
    }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .messages({ "string.pattern.base": "Please provide a valid phone number" }),
    preferredLanguage: Joi.string().valid("en", "fr", "rw").default("en"),
  })
  
  // Update user validation schema
  export const updateUserSchema = Joi.object({
    names: Joi.string().min(3).max(100).messages({
      "string.min": "Name must be at least 3 characters long",
      "string.max": "Name cannot exceed 100 characters",
    }),
    email: Joi.string().email().messages({
      "string.email": "Please provide a valid email address",
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
    active: Joi.boolean(),
  })
  
  