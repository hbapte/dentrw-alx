import dotenv from "dotenv"
dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET || "020d54824d694ac07ffe7779a843bbe3eb73a1a3bbf5d8f867b1ed3136b06396"
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"
export const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000 // 1 day in milliseconds

// For password reset
export const RESET_PASSWORD_EXPIRES = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

// For email verification
export const EMAIL_VERIFICATION_EXPIRES = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

