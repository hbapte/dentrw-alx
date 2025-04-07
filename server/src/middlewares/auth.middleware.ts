/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/auth.config"
import User from "../database/models/user"

interface JwtPayload {
  userId: string
}

// Extend Express Request type to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1] || req.cookies.jwt

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(401).json({ error: "Invalid token." })
  }
}

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. You do not have permission to access this resource." })
    }

    next()
  }
}

