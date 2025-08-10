/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"
import { errorResponse } from "../utils/responseHandler"

// Custom error class
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

// Not found error handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, httpStatus.NOT_FOUND)
  next(error)
}

// Global error handler
export const errorHandler = (err: any, req: Request, res: Response) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR
  const message = err.message || "Internal Server Error"

  // Log error
  console.error(`[ERROR] ${statusCode} - ${message}`)
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack)
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    const message = `Duplicate value: ${field} with value '${value}' already exists`
    return errorResponse(res, message, httpStatus.CONFLICT)
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val: any) => val.message)
    const message = `Validation Error: ${errors.join(", ")}`
    return errorResponse(res, message, httpStatus.BAD_REQUEST)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid token", httpStatus.UNAUTHORIZED)
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Token expired", httpStatus.UNAUTHORIZED)
  }

  // Return error response
  return errorResponse(res, message, statusCode, process.env.NODE_ENV === "development" ? { stack: err.stack } : null)
}

