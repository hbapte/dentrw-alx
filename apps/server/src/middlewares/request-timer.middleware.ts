/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express"

export const requestTimer = (req: Request, res: Response, next: NextFunction) => {
  // Use a symbol to avoid property name conflicts
  const startTimeSymbol = Symbol("startTime")

  // Store the start time on the request object using a symbol
  ;(req as any)[startTimeSymbol] = performance.now()

  // Add a getter method to access the start time
  Object.defineProperty(req, "startTime", {
    get: function () {
      return (this as any)[startTimeSymbol]
    },
  })

  next()
}
