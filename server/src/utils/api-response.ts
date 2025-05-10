
// server\src\utils\api-response.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import { logger } from "./logger"

// Define the custom request interface
interface RequestWithStartTime extends Request {
  startTime?: number
  requestId?: string
}

export type ApiResponseMetadata = {
  requestId: string
  serverTimestamp: number
  processingTime: number
  serverTimeZone: string
  apiVersion: string
  requestMethod: string
  requestPath: string
  userAgent: string
  clientIp?: string
  environment: string
  pagination?: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  // New fields
  serverName: string
  responseTime: string
  links?: {
    self?: string
    next?: string
    prev?: string
    first?: string
    last?: string
    documentation?: string
    profile?: string
    user?: string       
    doctors?: string
    doctor?: string
    ratings?: string
    appointment?: string
    patient?: string
    availability?: string
    updateProfile?: string
    updatePassword?: string
    updateEmail?: string
    login?: string
    completeLogin?: string
    register?: string
    logout?: string
    resetPassword?: string
    verifyTwoFactor?: string
    verifyEmail?: string
    verify?: string
    cancel?: string
    disable?: string
    setup?: string
    resendVerification?: string

    view?: string
    addAttachment?: string
    addPrescription?: string
    updateAttachment?: string
    updatePrescription?: string
    viewAttachment?: string
    removeAttachment?: string
    removePrescription?: string
    addMedicalRecord?: string
    addMedicalHistory?: string

    createRecord?: string
    listRecords?: string
    patientRecords?: string
    allRecords?: string
    followUps?: string
    stats?: string

    update?: string
    delete?: string
    create?: string

    refund?: string
    receipt?: string
    invoice?: string
    payment?: string
    payments?: string
    createPayment?: string
    allPayments?: string
    outstanding?: string
    download?: string

    createService?: string
    updateService?: string
    categories?: string
    allServices?: string

    checkUsername?: string
  }
}

export type ApiResponse<T = any> = {
  success: boolean
  data: T | null
  error: {
    code: string
    message: string
    details?: any
    help?: string
  } | null
  metadata: ApiResponseMetadata
  message?: string | undefined
  // New fields
  warnings?: string[]
  debug?: any // Only included in development environment
}

/**
 * Generates metadata for API responses
 */
function generateMetadata(request: RequestWithStartTime, startTime: number): ApiResponseMetadata {
  const now = performance.now()
  const processingTime = Math.round((now - startTime) * 100) / 100

  // Generate or use existing request ID
  const requestId = request.requestId || request.headers["x-request-id"]?.toString() || crypto.randomUUID()

  // Store requestId on request object for logging
  request.requestId = requestId

  // Get base URL for link generation
  const protocol = request.headers["x-forwarded-proto"] || request.protocol
  const host = request.headers["x-forwarded-host"] || request.headers.host
  const baseUrl = `${protocol}://${host}`

  // Format processing time for human readability
  let responseTimeFormatted: string
  if (processingTime < 1) {
    responseTimeFormatted = `${Math.round(processingTime * 1000)}μs`
  } else if (processingTime < 1000) {
    responseTimeFormatted = `${processingTime}ms`
  } else {
    responseTimeFormatted = `${(processingTime / 1000).toFixed(2)}s`
  }

  return {
    requestId,
    serverTimestamp: Date.now(),
    processingTime,
    serverTimeZone: process.env.TZ || "Africa/Kigali",
    apiVersion: process.env.API_VERSION || "v1",
    requestMethod: request.method,
    requestPath: request.path,
    userAgent: request.headers["user-agent"] || "Unknown",
    clientIp: request.headers["x-forwarded-for"]?.toString().split(",")[0] || request.ip,
    environment: process.env.NODE_ENV || "development",
    serverName: process.env.SERVER_NAME || "DentRW-API",
    responseTime: responseTimeFormatted,
    links: {
      self: `${baseUrl}${request.originalUrl}`,
      documentation: process.env.API_DOCS_URL ? `${process.env.API_DOCS_URL}${request.path}` : undefined,
    },
  }
}

/**
 * Creates a standardized successful API response
 */
export function successResponse<T>(
  res: Response,
  
  data: T,
  message?: string,
  options?: {
    statusCode?: number
    startTime?: number
    pagination?: ApiResponseMetadata["pagination"]
    warnings?: string[]
    debug?: any
    cacheControl?: string
    links?: Partial<ApiResponseMetadata["links"]>
  },
): Response {
  const startTime = options?.startTime || performance.now()
  const metadata = generateMetadata(res.req as RequestWithStartTime, startTime)

  // Add pagination metadata and links if provided
  if (options?.pagination) {
    metadata.pagination = options.pagination

    // Generate pagination links if we have pagination
    const url = new URL((res.req as Request).originalUrl, `http://${res.req.headers.host}`)

    if (options.pagination.hasNextPage) {
      url.searchParams.set("page", (options.pagination.page + 1).toString())
      metadata.links!.next = url.pathname + url.search
    }

    if (options.pagination.hasPreviousPage) {
      url.searchParams.set("page", (options.pagination.page - 1).toString())
      metadata.links!.prev = url.pathname + url.search
    }

    // First page
    url.searchParams.set("page", "1")
    metadata.links!.first = url.pathname + url.search

    // Last page
    url.searchParams.set("page", options.pagination.totalPages.toString())
    metadata.links!.last = url.pathname + url.search
  }

  // Add custom links if provided
  if (options?.links) {
    metadata.links = { ...metadata.links, ...options.links }
  }

  // Prepare response object
  const responseObject: ApiResponse<T> = {
    success: true,
    data,
    message,
    error: null,
    metadata,
  }

  // Add warnings if provided
  if (options?.warnings && options.warnings.length > 0) {
    responseObject.warnings = options.warnings
  }

  // Add debug information in development environment
  if (process.env.NODE_ENV === "development" && options?.debug) {
    responseObject.debug = options.debug
  }

  // Set response headers
  res.set("X-Request-ID", metadata.requestId)
  // res.set("X-Response-Time", metadata.responseTime)

  // Set cache control if provided
  if (options?.cacheControl) {
    res.set("Cache-Control", options.cacheControl)
  } else {
    // Default cache control
    res.set("Cache-Control", "private, max-age=0, no-cache, no-store, must-revalidate")
  }

  // Log the successful response
  logger.info({
    message: `API Response: ${res.req.method} ${res.req.path} ${options?.statusCode || 200}`,
    requestId: metadata.requestId,
    method: res.req.method,
    path: res.req.path,
    statusCode: options?.statusCode || 200,
    processingTime: metadata.processingTime,
    userMessage: message,
  })

  return res.status(options?.statusCode || 200).json(responseObject)
}

/**
 * Creates a standardized error API response
 */


// Modify the errorResponse function to safely set headers
export function errorResponse(
  res: Response,
  error: {
    code: string
    message: string
    details?: any
    help?: string
  },
  options?: {
    statusCode?: number
    startTime?: number
    debug?: any
  },
): Response {
  const startTime = options?.startTime || performance.now()
  const metadata = generateMetadata(res.req as RequestWithStartTime, startTime)

  // Prepare response object
  const responseObject: ApiResponse<null> = {
    success: false,
    data: null,
    error,
    metadata,
  }

  // Add debug information in development environment
  if (process.env.NODE_ENV === "development" && options?.debug) {
    responseObject.debug = options.debug
  }

  try {
    // Set response headers - safely
    res.set("X-Request-ID", metadata.requestId)
    // Use a safe numeric value for response time instead of formatted string
    // res.set("X-Response-Time", `${metadata.processingTime}`)
  } catch (err) {
    // If setting headers fails, log it but continue
    console.warn("Failed to set response headers:", err)
    
    // Add to debug info in development
    if (process.env.NODE_ENV === "development") {
      responseObject.debug = {
        ...responseObject.debug,
        headerError: err
      }
    }
  }

  // Log the error response
  logger.error({
    message: `API Error: ${res.req.method} ${res.req.path} ${options?.statusCode || 400} - ${error.code}: ${error.message}`,
    requestId: metadata.requestId,
    method: res.req.method,
    path: res.req.path,
    statusCode: options?.statusCode || 400,
    errorCode: error.code,
    errorMessage: error.message,
    errorDetails: error.details,
    processingTime: metadata.processingTime,
  })

  return res.status(options?.statusCode || 400).json(responseObject)
}

/**
 * Error codes for standardized API errors
 */
export const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  CONFLICT: "CONFLICT",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
  DATABASE_ERROR: "DATABASE_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  RESOURCE_EXISTS: "RESOURCE_EXISTS",
  RESOURCE_GONE: "RESOURCE_GONE",
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Common error response helpers
 */
export function badRequestResponse(
  res: Response,
  message: string,
  details?: any,
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.BAD_REQUEST,
      message,
      details,
      help: options?.help,
    },
    {
      statusCode: 400,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function unauthorizedResponse(
  res: Response,
  message = "Unauthorized",
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.UNAUTHORIZED,
      message,
      help: options?.help || "Please provide valid authentication credentials.",
    },
    {
      statusCode: 401,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function forbiddenResponse(
  res: Response,
  message = "Forbidden",
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.FORBIDDEN,
      message,
      help: options?.help || "You don't have permission to access this resource.",
    },
    {
      statusCode: 403,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function notFoundResponse(
  res: Response,
  message = "Resource not found",
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.NOT_FOUND,
      message,
      help: options?.help || "The requested resource could not be found.",
    },
    {
      statusCode: 404,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function conflictResponse(
  res: Response,
  message: string,
  details?: any,
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.CONFLICT,
      message,
      details,
      help: options?.help || "The request conflicts with the current state of the resource.",
    },
    {
      statusCode: 409,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function validationErrorResponse(
  res: Response,
  message: string,
  details?: any,
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.VALIDATION_ERROR,
      message,
      details,
      help: options?.help || "Please check your input and try again.",
    },
    {
      statusCode: 422,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function rateLimitedResponse(
  res: Response,
  message = "Too many requests",
  options?: {
    help?: string
    retryAfter?: number
    startTime?: number
    debug?: any
  },
): Response {
  // Set retry-after header if provided
  if (options?.retryAfter) {
    res.set("Retry-After", options.retryAfter.toString())
  }

  return errorResponse(
    res,
    {
      code: ErrorCodes.TOO_MANY_REQUESTS,
      message,
      details: {
        retryAfter: options?.retryAfter,
      },
      help:
        options?.help ||
        `Please try again later. ${options?.retryAfter ? `You can retry after ${options.retryAfter} seconds.` : ""}`,
    },
    {
      statusCode: 429,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function internalErrorResponse(
  res: Response,
  message = "Internal server error",
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.INTERNAL_ERROR,
      message,
      help: options?.help || "An unexpected error occurred. Our team has been notified.",
    },
    {
      statusCode: 500,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function serviceUnavailableResponse(
  res: Response,
  message = "Service unavailable",
  options?: {
    help?: string
    retryAfter?: number
    startTime?: number
    debug?: any
  },
): Response {
  // Set retry-after header if provided
  if (options?.retryAfter) {
    res.set("Retry-After", options.retryAfter.toString())
  }

  return errorResponse(
    res,
    {
      code: ErrorCodes.SERVICE_UNAVAILABLE,
      message,
      help: options?.help || "The service is temporarily unavailable. Please try again later.",
    },
    {
      statusCode: 503,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function databaseErrorResponse(
  res: Response,
  message = "Database operation failed",
  details?: any,
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.DATABASE_ERROR,
      message,
      details: process.env.NODE_ENV === "production" ? undefined : details,
      help: options?.help || "There was an issue with the database operation.",
    },
    {
      statusCode: 500,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}

export function businessLogicErrorResponse(
  res: Response,
  message: string,
  details?: any,
  options?: {
    help?: string
    startTime?: number
    debug?: any
  },
): Response {
  return errorResponse(
    res,
    {
      code: ErrorCodes.BUSINESS_LOGIC_ERROR,
      message,
      details,
      help: options?.help,
    },
    {
      statusCode: 422,
      startTime: options?.startTime,
      debug: options?.debug,
    },
  )
}
