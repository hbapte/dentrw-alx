import type { Request, Response, NextFunction } from "express"
import helmet from "helmet"
import cors from "cors"
import { expressCspHeader, INLINE, NONE, SELF } from "express-csp-header"

// Configure security headers using helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // We'll configure CSP separately
  crossOriginEmbedderPolicy: false, // Allow embedding of resources
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
})

// Configure Content Security Policy
export const contentSecurityPolicy = expressCspHeader({
  directives: {
    "default-src": [SELF],
    "script-src": [SELF, INLINE],
    "style-src": [SELF, INLINE],
    "img-src": [SELF, "data:", "https:"],
    "font-src": [SELF, "https://fonts.gstatic.com"],
    "connect-src": [SELF],
    "frame-src": [NONE],
    "object-src": [NONE],
    "base-uri": [SELF],
  },
})

// Configure CORS
export const corsOptions = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      // Add other allowed origins here
    ]

    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
})

// Prevent clickjacking
export const preventClickjacking = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Frame-Options", "DENY")
  next()
}

// Add security headers to all responses
export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add cache control headers
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
  res.setHeader("Surrogate-Control", "no-store")

  next()
}

