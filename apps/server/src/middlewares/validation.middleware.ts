import type { Request, Response, NextFunction } from "express"
import Joi from "joi"
import { validationErrorResponse } from "../utils/api-response"

/**
 * Enhanced validation middleware that integrates with our API response format
 * @param schema - Joi validation schema
 * @param source - Source of data to validate (body, query, params)
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = req.startTime || performance.now()
    
    // Get data to validate based on source
    const data = req[source]
    
    // Validate data against schema
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      // Format validation errors for better readability
      const details: Record<string, string> = {}
      
      error.details.forEach((detail) => {
        const key = detail.path.join('.')
        details[key] = detail.message
      })

      return validationErrorResponse(res, "Validation failed", details, {
        startTime,
        help: "Please check the request data and try again with valid values."
      })
    }

    // Replace request data with validated data
    req[source] = value
    
    next()
  }
}

/**
 * Middleware to validate request body
 */
export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body')

/**
 * Middleware to validate query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query')

/**
 * Middleware to validate URL parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params')
