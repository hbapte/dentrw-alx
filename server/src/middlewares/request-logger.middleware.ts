/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"
import crypto from "node:crypto"

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique request ID
  const requestId = crypto.randomUUID()

  // Add request ID to the request object
  req.requestId = requestId

  // Add start time to the request object
  req.startTime = performance.now()

  // Log the incoming request
  logger.info({
    message: `Incoming request: ${req.method} ${req.path}`,
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  })

  // Log the response when it's sent
  const originalEnd = res.end

  res.end = function (chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void) {
    const responseTime = performance.now() - (req.startTime || 0);

    logger.info({
      message: `Outgoing response: ${req.method} ${req.path} ${res.statusCode}`,
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
    });

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next()
}
