// server\src\modules\auth\controllers\authControllers.ts
import type { Request, Response } from "express"
import httpStatus from "http-status"
import User from "../../../database/models/user"
import Patient from "../../../database/models/patient"
import Admin from "../../../database/models/admin"
import Doctor from "../../../database/models/doctor"
import Receptionist from "../../../database/models/receptionist"
import RefreshToken from "../../../database/models/refreshToken"
import { addDays } from "date-fns"

import { COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE, RESET_PASSWORD_EXPIRES } from "../../../config/auth.config"
import { sendPasswordResetEmail, sendVerificationEmail } from "../../../services/emailService"
import { logAction } from "../../../utils/auditLogUtil"
import {
  generateTokenPair,
  verifyRefreshToken,
  generateVerificationToken,
  blacklistToken,
  getTokenExpiryTime,
  generateActionToken,
  verifyActionToken,
} from "../../../utils/tokenUtil"
import { authenticateTOTP } from "../../../services/totpService"
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
  conflictResponse,
} from "../../../utils/api-response"


// Helper function to set cookies
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
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
const clearTokenCookies = (res: Response) => {
  res.clearCookie("jwt")
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" })
}




// Login user
export const loginController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { email, password , } = req.body

  // Adjust token expiration based on "rememberMe"



  try {
    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return unauthorizedResponse(res, "Invalid email or password", { startTime })
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return unauthorizedResponse(res, "Please verify your email before logging in", {
        startTime,
        debug: { needsVerification: true, userId: user._id },
      })
    }

    // Check if user is active
    if (!user.active) {
      return unauthorizedResponse(res, "Your account has been deactivated. Please contact support.", { startTime })
    }

    // Check if user has Google auth only
    if (user.googleId && !user.password) {
      return badRequestResponse(res, "Please use Google Sign-In to log in.", { useGoogle: true }, { startTime })
    }

    // Verify password
    if (!user.password) {
      return unauthorizedResponse(res, "Invalid email or password", { startTime })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return unauthorizedResponse(res, "Invalid email or password", { startTime })
    }

    // Check if 2FA is enabled
    if (user.totpEnabled) {
      // Generate a temporary token for 2FA verification
      const tempToken = generateActionToken(user._id.toString(), "2fa-pending", "5m")

      return successResponse(
        res,
        {
          requiresTwoFactor: true,
          tempToken,
          userId: user._id,
        },
        "2FA verification required",
        {
          statusCode: httpStatus.OK,
          startTime,
          links: {
            verifyTwoFactor: `/api/auth/verify-2fa`,
          },
        },
      )
    }

    // Generate tokens
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

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Log the action
    await logAction(req, "login", "user", user._id.toString())

    // Return user data (excluding sensitive information)
    const userData: {
      id: typeof user._id,
      names: typeof user.names,
      email: typeof user.email,
      username: typeof user.username,
      role: typeof user.role,
      picture: typeof user.picture,
      preferredLanguage: typeof user.preferredLanguage,
      phoneNumber: typeof user.phoneNumber,
      patientId?: string,
      doctorId?: string,
      adminId?: string,
      receptionistId?: string,
    } = {
      id: user._id,
      names: user.names,
      email: user.email,
      username: user.username,
      role: user.role,
      picture: user.picture,
      preferredLanguage: user.preferredLanguage,
      phoneNumber: user.phoneNumber,
    }

    // return patient ID/ doctorID / admin ID / receptionist ID based on role
    if (user.role === "patient") {
      const patient = await Patient.findOne({ user: user._id }).select("_id")
      if (!patient) {
        return unauthorizedResponse(res, "Patient profile not found", { startTime })
      }
      userData.patientId = patient._id.toString()
    }
    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id }).select("_id")
      if (!doctor) {
        return unauthorizedResponse(res, "Doctor profile not found", { startTime })
      }
      userData.doctorId = doctor._id.toString()
    }

    if (user.role === "admin") {
      const admin = await Admin.findOne({ user: user._id }).select("_id")
      if (!admin) {
        return unauthorizedResponse(res, "Admin profile not found", { startTime })
      }
      userData.adminId = admin._id.toString()
    }

    if (user.role === "receptionist") {
      const receptionist = await Receptionist.findOne({ user: user._id }).select("_id")
      if (!receptionist) {
        return unauthorizedResponse(res, "Receptionist profile not found", { startTime })
      }
      userData.receptionistId = receptionist._id.toString()
    }

    return successResponse(
      res,
      {
        user: userData,
        token: accessToken, // For clients that don't use cookies
      },
      "Login successful",
      {
        statusCode: httpStatus.OK,
        startTime,
        links: {
          profile: `/api/users/me`,
          logout: `/api/auth/logout`,
        },
      },
    )
  } catch (error) {
    console.error("Error logging in user:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}



// Register a new user
export const registerController = async (req: Request, res: Response) => {

  const startTime = performance.now()
  const { names, email, username, password, phoneNumber, preferredLanguage } = req.body
  console.log("Register body", req.body)

  //hash password

  try {
    // Check if user email exists
    const existingUser = await User.findOne({ email, emailVerified: false })
    if (existingUser) {
      return conflictResponse(res, "Email already exists but not verified", null, { startTime })
    }


    // check if existing user has verified email
    const existingVerifiedUser = await User.findOne({
      email,
      emailVerified: true,
    })
    if (existingVerifiedUser) {
      return conflictResponse(res, "Email already exists and verified ", null, { startTime })
    }

    // check if username is already taken
    const existingUsername = await User.findOne({
      username,
    })
    if (existingUsername) {
      return conflictResponse(res, "Username already exists", null, { startTime })
    }


    // Create verification token
    const emailVerificationToken = generateVerificationToken()

    // Create new user
    const newUser = new User({
      names,
      email,
      username,
      password,
      emailVerificationToken,
      emailVerificationTokenCreated: new Date(),
      phoneNumber,
      preferredLanguage: preferredLanguage || "en",
      role: "patient",
      tokenVersion: 0,
    })

    await newUser.save()

    // Create patient profile
    const newPatient = new Patient({
      user: newUser._id,
    })

    await newPatient.save()

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken, names)

    // Log the action
    await logAction(req, "register", "user", newUser._id.toString())

    return successResponse(
      res,
      { userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
        names: newUser.names,
      },
      "User registered successfully. Please check your email for verification.",
      {
        statusCode: httpStatus.CREATED,
        startTime,
        links: {
          verifyEmail: `/api/auth/verify-email/${emailVerificationToken}`,
          resendVerification: `/api/auth/resend-verification`,
        },
      },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Username availability check
export const checkUsernameController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { username } = req.params

  try {
    // Check if username exists
    const existingUser = await User.findOne({ username })

    if (existingUser) {
      return conflictResponse(res, "Username already exists", null, { startTime })
    }

    return successResponse(
      res,
      {
      username,
      message: "Username is available",
      },
      "Username is available for registration.",
      {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        register: `/api/auth/register`,
        checkUsername: `/api/auth/check-username/${username}`,
      },
      },
    )
  } catch (error) {
    console.error("Error checking username:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}


// Verify 2FA code
export const verifyTwoFactorController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { tempToken, code } = req.body

  try {
    // Verify the temporary token
    const decoded = verifyActionToken(tempToken, "2fa-pending")
    if (!decoded) {
      return unauthorizedResponse(res, "Invalid or expired token", { startTime })
    }

    // Find the user
    const user = await User.findById(decoded.userId)
    if (!user || !user.active || !user.totpEnabled || !user.totpSecret) {
      return unauthorizedResponse(res, "Invalid user or 2FA not enabled", { startTime })
    }

    // Verify the TOTP code
    const isValidCode = authenticateTOTP(user.totpSecret, code)
    if (!isValidCode) {
      return unauthorizedResponse(res, "Invalid verification code", { startTime })
    }

    // Generate tokens
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

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Log the action
    await logAction(req, "2fa-login", "user", user._id.toString())

    // Return user data
    const userData = {
      id: user._id,
      names: user.names,
      email: user.email,
      username: user.username,
      role: user.role,
      picture: user.picture,
      preferredLanguage: user.preferredLanguage,
      phoneNumber: user.phoneNumber,
    }

    return successResponse(
      res,
      {
        user: userData,
        token: accessToken,
      },
      "2FA verification successful",
      {
        statusCode: httpStatus.OK,
        startTime,
        links: {
          profile: `/api/users/me`,
          logout: `/api/auth/logout`,
        },
      },
    )
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Refresh token

export const refreshTokenController = async (req: Request, res: Response) => {
  const startTime = performance.now()

  try {
    // Get refresh token from cookie
    const refreshTokenFromCookie = req.cookies.refreshToken

    if (!refreshTokenFromCookie) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Refresh token not found",
        data: null,
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshTokenFromCookie)
    if (!decoded) {
      clearTokenCookies(res)
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Invalid refresh token",
        data: null,
      })
    }

    // Find user
    const user = await User.findById(decoded.userId)
    if (!user || !user.active) {
      clearTokenCookies(res)
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "User not found or inactive",
        data: null,
      })
    }

    // Check token version
    if (user.tokenVersion !== decoded.tokenVersion) {
      clearTokenCookies(res)
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Token has been revoked",
        data: null,
      })
    }

    // Find token in database
    const tokenDoc = await RefreshToken.findOne({
      userId: user._id,
      token: refreshTokenFromCookie,
      isRevoked: false,
    })

    if (!tokenDoc) {
      clearTokenCookies(res)
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Token not found or revoked",
        data: null,
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString(), user.role, user.tokenVersion)

    // Revoke old token
    tokenDoc.isRevoked = true
    await tokenDoc.save()

    // Store new refresh token
    const expiresAt = addDays(new Date(), 7) // 7 days
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      tokenVersion: user.tokenVersion,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt,
    })

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken)

    // Log the action
    await logAction(req, "token-refresh", "user", user._id.toString())

    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Token refreshed successfully",
      data: { token: accessToken },
      links: {
        profile: `/api/auth/me`,
        logout: `/api/auth/logout`,
      },
      startTime,
      success: true,
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    clearTokenCookies(res)
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: httpStatus.UNAUTHORIZED,
      message: "Error refreshing token",
      data: null,
      success: false,
    })
  }
}


// Logout user
export const logoutController = async (req: Request, res: Response) => {
  try {
    // Get tokens
    const accessToken = req.cookies.jwt
    const refreshToken = req.cookies.refreshToken

    // Clear cookies regardless of whether tokens exist
    clearTokenCookies(res)

    // If we have a refresh token, revoke it
    if (refreshToken) {
      // Find and revoke the token in the database
      await RefreshToken.updateOne({ token: refreshToken }, { isRevoked: true })

      // Get user ID from token
      const decoded = verifyRefreshToken(refreshToken)
      if (decoded) {
        // Log the action
        await logAction(req, "logout", "user", decoded.userId)
      }
    }

    // If we have an access token, blacklist it
    if (accessToken) {
      const expiryTime = getTokenExpiryTime(accessToken)
      if (expiryTime > 0) {
        await blacklistToken(accessToken, expiryTime)
      }
    }

    // Return success even if no tokens were present
    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Logged out successfully",
      data: null,
      success: true,
      links: {
        login: `/api/auth/login`,
      },
    })
  } catch (error) {
    console.error("Error logging out:", error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Error logging out",
      data: null,
      success: false,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Verify email
export const verifyEmailController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { token } = req.params

  try {
    // Find user with this verification token
    const user = await User.findOne({ emailVerificationToken: token })

    if (!user) {
      return badRequestResponse(res, "Invalid verification token", null, { startTime })
    }

    // Check if token is expired (24 hours)
    const tokenCreated = new Date(user.emailVerificationTokenCreated)
    const now = new Date()
    const tokenAge = now.getTime() - tokenCreated.getTime()
    const tokenMaxAge = 1 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (tokenAge > tokenMaxAge) {
      return badRequestResponse(
        res,
        "Verification token has expired",
        { expired: true, userId: user._id , email: user.email },
        { startTime },
      )
    }

    // Update user
    user.emailVerified = true
    user.emailVerificationToken = ""
    await user.save()

    // Log the action
    await logAction(req, "verify-email", "user", user._id.toString())

    return successResponse(res, null, "Email verified successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        login: `/api/auth/login`,
      },
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Resend verification email
export const resendVerificationController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { email } = req.body

  try {
    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return notFoundResponse(res, "User not found", { startTime })
    }

    if (user.emailVerified) {
      return badRequestResponse(res, "Email already verified", null, { startTime })
    }

    // Generate new verification token
    const emailVerificationToken = generateVerificationToken()
    user.emailVerificationToken = emailVerificationToken
    user.emailVerificationTokenCreated = new Date()
    await user.save()

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken, user.names)

    // Log the action
    await logAction(req, "resend-verification", "user", user._id.toString())

    return successResponse(res, null, "Verification email sent successfully", {
      statusCode: httpStatus.OK,
      startTime,
    })
  } catch (error) {
    console.error("Error resending verification:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Forgot password
export const forgotPasswordController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { email } = req.body

  try {
    // Find user by email
    const user = await User.findOne({ email })

    // For security reasons, always return success even if user not found
    if (!user) {
      return successResponse(res, null, "If your email is registered, you will receive a password reset link", {
        statusCode: httpStatus.OK,
        startTime,
      })
    }

    // Generate reset token
    const resetToken = generateVerificationToken()
    const resetExpires = new Date(Date.now() + RESET_PASSWORD_EXPIRES)

    // Update user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetExpires
    await user.save()

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken, user.names)

    // Log the action
    await logAction(req, "forgot-password", "user", user._id.toString())

    return successResponse(res, null, "If your email is registered, you will receive a password reset link", {
      statusCode: httpStatus.OK,
      startTime,
    })
  } catch (error) {
    console.error("Error processing forgot password:", error)
    // Still return success for security reasons
    return successResponse(res, null, "If your email is registered, you will receive a password reset link", {
      statusCode: httpStatus.OK,
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Reset password
export const resetPasswordController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { token } = req.params
  const { password } = req.body

  try {
    // Find user with this reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return badRequestResponse(res, "Invalid or expired reset token", null, { startTime })
    }

    // Update password and invalidate all tokens
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    // Increment token version to invalidate all existing refresh tokens
    await user.incrementTokenVersion()
    await user.save()

    // Revoke all refresh tokens for this user
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true })

    // Log the action
    await logAction(req, "reset-password", "user", user._id.toString())

    return successResponse(res, null, "Password reset successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        login: `/api/auth/login`,
      },
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Get current user
export const getCurrentUserController = async (req: Request, res: Response) => {
  const startTime = performance.now()

  try {
    // User is attached to request by authenticateToken middleware
    const userId = req.user?.userId

    if (!userId) {
      return unauthorizedResponse(res, "Not authenticated", { startTime })
    }

    // Find user by ID
    const user = await User.findById(userId).select(
      "-password -tokenVersion -resetPasswordToken -resetPasswordExpires -emailVerificationToken",
    )

    if (!user) {
      return notFoundResponse(res, "User not found", { startTime })
    }

    // Return user data
    return successResponse(
      res,
      {
        user: {
          id: user._id,
          names: user.names,
          email: user.email,
          username: user.username,
          role: user.role,
          picture: user.picture,
          preferredLanguage: user.preferredLanguage,
          phoneNumber: user.phoneNumber,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          totpEnabled: user.totpEnabled,
          lastLogin: user.lastLogin,
        },
      },
      "User retrieved successfully",
      {
        statusCode: httpStatus.OK,
        startTime,
        links: {
          updateProfile: `/api/users/me`,
          updatePassword: `/api/users/me/password`,
          updateEmail: `/api/users/me/email`,
        },
      },
    )
  } catch (error) {
    console.error("Error getting current user:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}
