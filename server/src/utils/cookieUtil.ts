// server\src\utils\cookieUtil.ts
import type { Response } from "express"
import { COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE } from "../config/auth.config"

// Helper function to set cookies
export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  // Access token cookie
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
  })

  // Refresh token cookie (only sent to refresh endpoint)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh", // Only sent to refresh endpoint
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })
}

// Helper function to clear cookies
export const clearTokenCookies = (res: Response) => {
  res.clearCookie("jwt")
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" })
}
