import { authenticator } from "otplib"
import QRCode from "qrcode"
import User from "../database/models/user"
import redisClient from "../config/redis.config"

// Generate a new TOTP secret for a user
export const generateTOTPSecret = async (userId: string) => {
  try {
    const user = await User.findById(userId)

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Generate a new secret
    const secret = authenticator.generateSecret()

    // Store the secret temporarily in Redis (not in the user document yet)
    // It will be stored permanently only after verification
    if (redisClient) {
      await redisClient.set(
        `totp:${userId}`,
        secret,
        "EX",
        10 * 60, // Expire after 10 minutes
      )
    }

    // Generate QR code
    const otpauth = authenticator.keyuri(user.email, "DentRW", secret)
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    return {
      success: true,
      secret,
      qrCodeUrl,
    }
  } catch (error) {
    console.error("Error generating TOTP secret:", error)
    return {
      success: false,
      error: "Failed to generate 2FA secret",
    }
  }
}

// Verify a TOTP token
export const verifyTOTPToken = async (userId: string, token: string) => {
  try {
    // First check if the user is in setup mode (secret in Redis)
    let secret = null

    if (redisClient) {
      secret = await redisClient.get(`totp:${userId}`)
    }

    // If not in setup mode, get the secret from the user document
    if (!secret) {
      const user = await User.findById(userId)

      if (!user || !user.totpSecret) {
        return {
          success: false,
          error: "2FA not set up for this user",
        }
      }

      secret = user.totpSecret
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret,
    })

    if (!isValid) {
      return {
        success: false,
        error: "Invalid 2FA code",
      }
    }

    // If in setup mode, save the secret to the user document
    if (redisClient && (await redisClient.exists(`totp:${userId}`))) {
      const user = await User.findById(userId)

      if (user) {
        user.totpSecret = secret
        user.totpEnabled = true
        await user.save()

        // Delete the temporary secret
        await redisClient.del(`totp:${userId}`)
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error verifying TOTP token:", error)
    return {
      success: false,
      error: "Failed to verify 2FA code",
    }
  }
}

// Disable 2FA for a user
export const disableTwoFactorAuth = async (userId: string) => {
  try {
    const user = await User.findById(userId)

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    user.totpSecret = undefined
    user.totpEnabled = false
    await user.save()

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    return {
      success: false,
      error: "Failed to disable 2FA",
    }
  }
}

