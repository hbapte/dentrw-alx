/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express"

// Extend the Request interface to include requestId and startTime
declare module "express" {
  export interface Request {
    requestId?: string;
    startTime?: number;
  }
}
import { internalErrorResponse } from "../utils/api-response"
import { logger } from "../utils/logger"

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  logger.error({
    message: `Unhandled error: ${err.message}`,
    requestId: req.requestId || "unknown",
    method: req.method,
    path: req.path,
    stack: err.stack,
    error: err,
  })

  // If headers have already been sent, let Express handle it
  if (res.headersSent) {
    return next(err)
  }

  // Send a standardized error response
  return internalErrorResponse(res, "An unexpected error occurred", {
    debug:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : undefined,
    startTime: req.startTime || performance.now(),
  })
}
