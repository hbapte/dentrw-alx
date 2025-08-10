/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { type Secret, type SignOptions } from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN } from "../config/auth.config"
import redisClient from "../config/redis.config"

interface TokenPayload {
  userId: string
  role: string
  [key: string]: any
}

interface RefreshTokenPayload extends TokenPayload {
  tokenVersion: number
}

// Generate JWT access token
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn: JWT_EXPIRES_IN } as SignOptions)
}

// Generate refresh token
export const generateRefreshToken = (payload: TokenPayload, tokenVersion: number): string => {
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenVersion,
  }
  return jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET || (JWT_SECRET as Secret), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN || "7d",
  } as SignOptions)
}

// Generate both access and refresh tokens
export const generateTokenPair = (
  userId: string,
  role: string,
  tokenVersion: number,
): { accessToken: string; refreshToken: string } => {
  const payload = { userId, role }
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload, tokenVersion),
  }
}

// Verify JWT token
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET || JWT_SECRET) as RefreshTokenPayload
  } catch (error) {
    console.error("Error verifying refresh token:", error)
    return null
  }
}

// Generate a verification token
export const generateVerificationToken = (): string => {
  return uuidv4()
}

// Generate a secure action token (for email verification, password reset)
export const generateActionToken = (userId: string, action: string, expiresIn = "24h"): string => {
  return jwt.sign({ userId, action, createdAt: Date.now() }, JWT_SECRET as Secret, { expiresIn } as SignOptions)
}

// Verify an action token
export const verifyActionToken = (token: string, expectedAction: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.action !== expectedAction) {
      return null
    }
    return { userId: decoded.userId }
  } catch (error) {
    console.error("Error verifying action token:", error)
    return null
  }
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

// Parse JWT token expiration time
export const getTokenExpiryTime = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as any
    if (decoded && decoded.exp) {
      return decoded.exp - Math.floor(Date.now() / 1000)
    }
    return 0
  } catch (error) {
    console.error("Error parsing token expiry:", error)
    return 0
  }
}
