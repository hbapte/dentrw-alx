import dotenv from "dotenv"
dotenv.config()


// Auth configuration
export const JWT_SECRET = process.env.JWT_SECRET || "020d54824d694ac07ffe7779a843bbe3eb73a1a3bbf5d8f867b1ed3136b06396"
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"


// For email verification
export const EMAIL_VERIFICATION_EXPIRES = process.env.EMAIL_VERIFICATION_EXPIRES || 24 * 60 * 60 * 1000 // 24 hours in milliseconds


// Refresh token configuration
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" // 7 days

// Cookie configuration
export const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE || "900000", 10) // 15 minutes in milliseconds
export const REFRESH_COOKIE_MAX_AGE = parseInt(process.env.REFRESH_COOKIE_MAX_AGE || "604800000", 10) // 7 days in milliseconds


// Password reset configuration
export const RESET_PASSWORD_EXPIRES = parseInt(process.env.RESET_PASSWORD_EXPIRES || "3600000", 10) // 1 hour in milliseconds

// 2FA configuration
export const TOTP_WINDOW = parseInt(process.env.TOTP_WINDOW || "1", 10) // Time window for TOTP verification
