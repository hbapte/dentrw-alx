import type { Request, Response, NextFunction } from "express"
import { RateLimiterRedis, RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible"
import redisClient from "../config/redis.config"
import { rateLimitedResponse } from "../utils/api-response"

// Create a Redis rate limiter if Redis is available, otherwise use memory
const getRateLimiter = (options: {
  keyPrefix: string
  points: number
  duration: number
}) => {
  const { keyPrefix, points, duration } = options

  if (redisClient && redisClient.status === "ready") {
    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix,
      points, // Number of points
      duration, // Per seconds
      blockDuration: duration, // Block for the same duration
    })
  } else {
    console.warn(`Redis not available for rate limiting (${keyPrefix}), using memory instead`)
    return new RateLimiterMemory({
      keyPrefix,
      points,
      duration,
    })
  }
}

// Generic rate limiter middleware
export const createRateLimiter = (options: {
  keyPrefix: string
  points: number
  duration: number
  message?: string
  helpText?: string
}) => {
  const { keyPrefix, points, duration, message = "Too many requests, please try again later.", helpText } = options

  const limiter = getRateLimiter({ keyPrefix, points, duration })

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a unique key based on IP
      const key = req.ip || "" // Fallback to an empty string if req.ip is undefined

      // Check rate limit
      await limiter.consume(key)
      next()
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        // Rate limit exceeded
        const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1

        // Format help text with retry time
        const formattedHelpText = helpText || `Please try again later. You can retry after ${retryAfter} seconds.`

        try {
          // Use the standardized API response format
          return rateLimitedResponse(res, message, {
            retryAfter,
            help: formattedHelpText,
            debug: {
              rateLimitKey: keyPrefix,
              maxAttempts: points,
              timeWindow: `${duration} seconds`,
            },
          })
        } catch (responseError) {
          // If the standardized response fails, fall back to a simpler response
          console.error("Error sending rate limit response:", responseError)

          // Simple fallback response
          res.status(429).json({
            success: false,
            error: {
              code: "TOO_MANY_REQUESTS",
              message: message,
              details: { retryAfter },
            },
          })
        }
      }

      // If there's an error with rate limiting, allow the request to proceed
      console.error("Rate limiter error:", error)
      next()
    }
  }
}

// Rate limiter for login attempts
export const loginRateLimiter = createRateLimiter({
  keyPrefix: "rl:login",
  points: 10, // 10 login attempts
  duration: 5 * 60, // per 5 minutes
  message: "Too many login attempts, please try again later.",
  helpText:
    "For security reasons, you have exceeded the maximum number of login attempts. Please wait before trying again.",
})

// Rate limiter for registration
export const registrationRateLimiter = createRateLimiter({
  keyPrefix: "rl:register",
  points: 10, // 15 registration attempts
  duration: 30 * 60, // per hour
  message: "Too many registration attempts, please try again later.",
  helpText: "You have exceeded the maximum number of registration attempts. Please wait before trying again.",
})

// Rate limiter for password change
export const passwordChangeRateLimiter = createRateLimiter({
  keyPrefix: "rl:pwchange",
  points: 5, // 5 password change attempts
  duration: 30 * 60, // per hour
  message: "Too many password change attempts, please try again later.",
  helpText: "You have exceeded the maximum number of password change attempts. Please wait before trying again.",
})

// Rate limiter for forgot password
export const forgotPasswordRateLimiter = createRateLimiter({
  keyPrefix: "rl:forgotpw",
  points: 5, // 5 forgot password attempts
  duration: 60 * 60, // per hour
  message: "Too many forgot password attempts, please try again later.",
  helpText: "You have exceeded the maximum number of password reset requests. Please wait before trying again.",
})

// Rate limiter for password reset
export const passwordResetRateLimiter = createRateLimiter({
  keyPrefix: "rl:pwreset",
  points: 6, // 6 password reset attempts
  duration: 60 * 60, // per hour
  message: "Too many password reset attempts, please try again later.",
  helpText: "You have exceeded the maximum number of password reset attempts. Please wait before trying again.",
})

// General API rate limiter
export const apiRateLimiter = createRateLimiter({
  keyPrefix: "rl:api",
  points: 60, // 60 requests
  duration: 60, // per minute
  message: "Too many requests, please try again later.",
  helpText: "You have exceeded the rate limit for API requests. Please reduce your request frequency.",
})
