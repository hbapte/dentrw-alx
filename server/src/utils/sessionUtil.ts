import type { Request, Response } from "express"
import redisClient from "../config/redis.config"
import { generateToken, blacklistToken } from "./tokenUtil"
import { JWT_EXPIRES_IN } from "../config/auth.config"

// Create a new session
export const createSession = async (
  req: Request,
  res: Response,
  userId: string,
  role: string,
  rememberMe = false,
): Promise<string> => {
  // Generate a session ID
  const sessionId = `${userId}_${Date.now()}`

  // Set expiration time
  const expiresIn = rememberMe
    ? 30 * 24 * 60 * 60 // 30 days in seconds
    : Number.parseInt(JWT_EXPIRES_IN.replace("d", "")) * 24 * 60 * 60 // Convert days to seconds

  // Store session data in Redis if available
  if (redisClient) {
    const sessionData = {
      userId,
      role,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
      createdAt: new Date().toISOString(),
    }

    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), "EX", expiresIn)
  }

  // Generate JWT token
  const token = generateToken({
    userId,
    role,
    sessionId,
  })

  // Set cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: expiresIn * 1000, // Convert to milliseconds
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  return token
}

// End a session
export const endSession = async (req: Request, res: Response, token: string): Promise<boolean> => {
  try {
    // Clear cookie
    res.clearCookie("jwt")

    // Get token payload
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
    const sessionId = payload.sessionId
    const expiresIn = Math.floor(payload.exp - Math.floor(Date.now() / 1000))

    // Remove session from Redis if available
    if (redisClient && sessionId) {
      await redisClient.del(`session:${sessionId}`)
    }

    // Add token to blacklist
    await blacklistToken(token, expiresIn > 0 ? expiresIn : 3600)

    return true
  } catch (error) {
    console.error("Error ending session:", error)
    return false
  }
}

// Get active sessions for a user
export const getActiveSessions = async (userId: string): Promise<any[]> => {
  if (!redisClient) {
    return []
  }

  try {
    // Get all keys matching the pattern
    const keys = await redisClient.keys(`session:${userId}_*`)

    if (!keys.length) {
      return []
    }

    // Get all session data
    const sessions = []

    for (const key of keys) {
      const data = await redisClient.get(key)

      if (data) {
        sessions.push({
          id: key.replace("session:", ""),
          ...JSON.parse(data),
        })
      }
    }

    return sessions
  } catch (error) {
    console.error("Error getting active sessions:", error)
    return []
  }
}

// End all sessions for a user except the current one
export const endAllOtherSessions = async (userId: string, currentSessionId: string): Promise<boolean> => {
  if (!redisClient) {
    return false
  }

  try {
    // Get all keys matching the pattern
    const keys = await redisClient.keys(`session:${userId}_*`)

    for (const key of keys) {
      const sessionId = key.replace("session:", "")

      if (sessionId !== currentSessionId) {
        await redisClient.del(key)
      }
    }

    return true
  } catch (error) {
    console.error("Error ending other sessions:", error)
    return false
  }
}

