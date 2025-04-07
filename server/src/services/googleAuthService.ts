import { OAuth2Client } from "google-auth-library"
import User from "../database/models/user"
import Patient from "..//database/models/patient"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.config"

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

export const handleGoogleLogin = async (googleUserInfo: GoogleUserInfo) => {
  try {
    // Check if user exists
    let user = await User.findOne({ email: googleUserInfo.email })

    if (user) {
      // Update user information if needed
      if (user.googleId !== googleUserInfo.sub || user.picture !== googleUserInfo.picture) {
        user.googleId = googleUserInfo.sub
        user.picture = googleUserInfo.picture
        await user.save()
      }
    } else {
      // Create new user
      user = new User({
        names: googleUserInfo.name,
        email: googleUserInfo.email,
        googleId: googleUserInfo.sub,
        picture: googleUserInfo.picture,
        emailVerified: true, // Google already verified the email
        role: "patient",
        emailVerificationToken: uuidv4(), // Just for initialization
        emailVerificationTokenCreated: new Date(),
      })

      await user.save()

      // Create patient profile
      const newPatient = new Patient({
        user: user._id,
      })

      await newPatient.save()
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

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
      token,
    }
  } catch (error) {
    console.error("Error handling Google login:", error)
    return {
      success: false,
      error: "Failed to process Google login",
    }
  }
}

