import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.config"
import redisClient from "../config/redis.config"

interface TokenPayload {
  userId: string
  role: string
  [key: string]: any
}

// Generate JWT token
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

// Generate a verification token
export const generateVerificationToken = (): string => {
  return uuidv4()
}

// Add token to blacklist (for logout)
export const blacklistToken = async (token: string, expiresIn: number): Promise<boolean> => {
  if (!redisClient) {
    console.warn("Redis not available for token blacklisting")
    return false
  }

  try {
    // Store the token in Redis blacklist
    await redisClient.set(`bl:${token}`, "1", "EX", expiresIn)
    return true
  } catch (error) {
    console.error("Error blacklisting token:", error)
    return false
  }
}

// Check if token is blacklisted
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  if (!redisClient) {
    console.warn("Redis not available for token blacklist check")
    return false
  }

  try {
    const result = await redisClient.get(`bl:${token}`)
    return !!result
  } catch (error) {
    console.error("Error checking token blacklist:", error)
    return false
  }
}

