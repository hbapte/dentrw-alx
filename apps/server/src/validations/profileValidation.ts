
import Joi from "joi"
  
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
  