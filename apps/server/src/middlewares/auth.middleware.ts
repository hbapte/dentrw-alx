/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from "express"
import { verifyToken, isTokenBlacklisted } from "../utils/tokenUtil"
import httpStatus from "http-status"

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
        email?: string
      }
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization
    const tokenFromCookie = req.cookies?.jwt

    let token: string | undefined

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    } else if (tokenFromCookie) {
      token = tokenFromCookie
    }

    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Authentication required",
        data: null,
      })
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token)
    if (isBlacklisted) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Token has been revoked",
        data: null,
      })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Invalid or expired token",
        data: null,
      })
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    }

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: httpStatus.UNAUTHORIZED,
      message: "Authentication failed",
      data: null,
    })
  }
}

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Authentication required",
        data: null,
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(httpStatus.FORBIDDEN).json({
        status: httpStatus.FORBIDDEN,
        message: "You do not have permission to perform this action",
        data: null,
      })
    }

    next()
  }
}
