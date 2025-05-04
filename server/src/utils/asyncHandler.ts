/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type { Request, Response, NextFunction } from "express"
import { internalErrorResponse } from "./api-response"
import { logger } from "./logger"

// Define a custom interface that extends Request
interface RequestWithStartTime extends Request {
  startTime?: number
  requestId?: string
}

/**
 * Wraps an async controller function to handle errors
 */
const asyncHandler = (fn: Function) => (req: RequestWithStartTime, res: Response, next: NextFunction) => {
  // If startTime is not set by middleware, set it here
  if (!req.startTime) {
    req.startTime = performance.now()
  }

  // If requestId is not set by middleware, set it here
  if (!req.requestId) {
    req.requestId = crypto.randomUUID()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Promise.resolve(fn(req, res, next)).catch((error: any) => {
    logger.error({
      message: `Error in async handler: ${error.message}`,
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      error: error,
      stack: error.stack,
    })

    return internalErrorResponse(res, error.message || "An unexpected error occurred", {
      startTime: req.startTime,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    })
  })
}

export default asyncHandler
