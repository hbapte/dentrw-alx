/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Response } from "express"
import httpStatus from "http-status"

/**
 * Standard API response format
 */
export interface ApiResponse {
  status: number
  message: string
  data: any
}

/**
 * Success response handler
 */
export const successResponse = (
  res: Response,
  data: any = null,
  message = "Success",
  statusCode: number = httpStatus.OK,
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
  })
}

/**
 * Error response handler
 */
export const errorResponse = (
  res: Response,
  message = "Error",
  statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
  data: any = null,
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
  })
}

/**
 * Not found response handler
 */
export const notFoundResponse = (
  res: Response,
  message = "Resource not found",
  data: any = null,
): Response<ApiResponse> => {
  return errorResponse(res, message, httpStatus.NOT_FOUND, data)
}

/**
 * Bad request response handler
 */
export const badRequestResponse = (res: Response, message = "Bad request", data: any = null): Response<ApiResponse> => {
  return errorResponse(res, message, httpStatus.BAD_REQUEST, data)
}

/**
 * Unauthorized response handler
 */
export const unauthorizedResponse = (
  res: Response,
  message = "Unauthorized",
  data: any = null,
): Response<ApiResponse> => {
  return errorResponse(res, message, httpStatus.UNAUTHORIZED, data)
}

/**
 * Forbidden response handler
 */
export const forbiddenResponse = (res: Response, message = "Forbidden", data: any = null): Response<ApiResponse> => {
  return errorResponse(res, message, httpStatus.FORBIDDEN, data)
}

/**
 * Conflict response handler
 */
export const conflictResponse = (res: Response, message = "Conflict", data: any = null): Response<ApiResponse> => {
  return errorResponse(res, message, httpStatus.CONFLICT, data)
}

