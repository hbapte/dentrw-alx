// server\src\services\googleAuthService.ts
import { OAuth2Client } from "google-auth-library"
import User from "../database/models/user"
import Patient from "../database/models/patient"
import RefreshToken from "../database/models/refreshToken"
import { addDays } from "date-fns"
import type { Request } from "express"
import { generateTokenPair } from "../utils/tokenUtil"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  sub: string // Google's user ID
}

export const verifyGoogleToken = async (token: string): Promise<GoogleUserInfo | null> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      return null
    }

    return {
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || "",
      sub: payload.sub,
    }
  } catch (error) {
    console.error("Error verifying Google token:", error)
    return null
  }
}

export const handleGoogleLogin = async (googleUserInfo: GoogleUserInfo, req: Request) => {
  try {
    // Check if user exists
    let user = await User.findOne({ email: googleUserInfo.email })
    let isNewUser = false

    if (user) {
      // Update user information if needed
      if (user.googleId !== googleUserInfo.sub || user.picture !== googleUserInfo.picture) {
        user.googleId = googleUserInfo.sub
        user.picture = googleUserInfo.picture
        await user.save()
      }

      // Check if user is active
      if (!user.active) {
        return {
          success: false,
          error: "Your account has been deactivated. Please contact support.",
        }
      }
    } else {
      // Create new user
      isNewUser = true
      user = new User({
        names: googleUserInfo.name,
        email: googleUserInfo.email,
        googleId: googleUserInfo.sub,
        picture: googleUserInfo.picture,
        emailVerified: true, // Google already verified the email
        role: "patient",
        preferredLanguage: "en",
        active: true,
        tokenVersion: 0,
      })

      await user.save()

      // Create patient profile
      const newPatient = new Patient({
        user: user._id,
      })

      await newPatient.save()
    }

    // Generate tokens using the same method as regular login
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString(), user.role, user.tokenVersion)

    // Store refresh token
    const expiresAt = addDays(new Date(), 7) // 7 days
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      tokenVersion: user.tokenVersion,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt,
    })

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Return user data (excluding sensitive information)
    const userData = {
      id: user._id,
      names: user.names,
      email: user.email,
      role: user.role,
      picture: user.picture,
      preferredLanguage: user.preferredLanguage,
    }

    return {
      success: true,
      user: userData,
      accessToken,
      refreshToken,
      isNewUser,
    }
  } catch (error) {
    console.error("Error handling Google login:", error)
    return {
      success: false,
      error: "Failed to process Google login",
      debug: error,
    }
  }
}
