import type { Request, Response, NextFunction } from "express"

/**
 * Async handler to wrap async route handlers
 * This eliminates the need for try/catch blocks in route handlers
 */
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler

