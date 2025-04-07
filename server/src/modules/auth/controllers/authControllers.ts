import type { Request, Response } from "express"
import httpStatus from "http-status"
import User from "../../../database/models/user"
import Patient from "../../../database/models/patient"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_MAX_AGE, RESET_PASSWORD_EXPIRES } from "../../../config/auth.config"
import { sendPasswordResetEmail, sendVerificationEmail } from "../../../services/emailService"
import { logAction } from "../../../utils/auditLogUtil"

// Register a new user
export const registerController = async (req: Request, res: Response) => {
  const { names, email, username, password, phoneNumber, preferredLanguage } = req.body

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, ...(username ? [{ username }] : [])],
    })

    if (existingUser) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: username ? "Username or email already exists" : "Email already exists",
        data: null,
      })
    }

    // Create verification token
    const emailVerificationToken = uuidv4()

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

    res.status(httpStatus.CREATED).json({
      status: httpStatus.CREATED,
      message: "User registered successfully. Please check your email for verification.",
      data: {
        userId: newUser._id,
      },
    })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Login user
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Invalid email or password",
        data: null,
      })
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Please verify your email before logging in",
        data: {
          needsVerification: true,
          userId: user._id,
        },
      })
    }

    // Check if user is active
    if (!user.active) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Your account has been deactivated. Please contact support.",
        data: null,
      })
    }

    // Check if user has Google auth only
    if (user.googleId && !user.password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Please use Google Sign-In to log in.",
        data: {
          useGoogle: true,
        },
      })
    }

    // Verify password
    if (!user.password) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Invalid email or password",
        data: null,
      })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Invalid email or password",
        data: null,
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Log the action
    await logAction(req, "login", "user", user._id.toString())

    // Return user data (excluding sensitive information)
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

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Login successful",
      data: {
        user: userData,
        token,
      },
    })
  } catch (error) {
    console.error("Error logging in user:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Verify email
export const verifyEmailController = async (req: Request, res: Response) => {
  const { token } = req.params

  try {
    const user = await User.findOne({ emailVerificationToken: token })

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Invalid verification token",
        data: null,
      })
    }

    // Check if token is expired (24 hours)
    const tokenCreatedAt = new Date(user.emailVerificationTokenCreated).getTime()
    const now = new Date().getTime()
    const tokenAge = now - tokenCreatedAt

    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Verification token has expired",
        data: {
          expired: true,
          userId: user._id,
        },
      })
    }

    // Update user
    user.emailVerified = true
    user.emailVerificationToken = ""
    await user.save()

    // Log the action
    await logAction(req, "verify_email", "user", user._id.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Email verified successfully",
      data: null,
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Resend verification email
export const resendVerificationController = async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      })
    }

    if (user.emailVerified) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Email already verified",
        data: null,
      })
    }

    // Generate new token
    const emailVerificationToken = uuidv4()

    // Update user
    user.emailVerificationToken = emailVerificationToken
    user.emailVerificationTokenCreated = new Date()
    await user.save()

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken, user.names)

    // Log the action
    await logAction(req, "resend_verification", "user", user._id.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Verification email sent successfully",
      data: null,
    })
  } catch (error) {
    console.error("Error resending verification email:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Forgot password
export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      })
    }

    // Generate reset token
    const resetToken = uuidv4()

    // Update user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + RESET_PASSWORD_EXPIRES)
    await user.save()

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.names)

    // Log the action
    await logAction(req, "forgot_password", "user", user._id.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Password reset email sent successfully",
      data: null,
    })
  } catch (error) {
    console.error("Error sending password reset email:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Reset password
export const resetPasswordController = async (req: Request, res: Response) => {
  const { token } = req.params
  const { password } = req.body

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Invalid or expired reset token",
        data: null,
      })
    }

    // Update user password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    // Log the action
    await logAction(req, "reset_password", "user", user._id.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Password reset successfully",
      data: null,
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Logout
export const logoutController = (req: Request, res: Response) => {
  try {
    // Clear cookie
    res.clearCookie("jwt")

    // Log the action if user is authenticated
    if (req.user) {
      logAction(req, "logout", "user", req.user._id.toString())
    }

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Logged out successfully",
      data: null,
    })
  } catch (error) {
    console.error("Error logging out:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Get current user
export const getCurrentUserController = async (req: Request, res: Response) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Not authenticated",
        data: null,
      })
    }

    // Get additional profile data based on role
    let profileData = null

    if (user.role === "patient") {
      profileData = await Patient.findOne({ user: user._id })
    } else if (user.role === "doctor") {
      profileData = await Patient.findOne({ user: user._id })
    }

    // Return user data (excluding sensitive information)
    const userData = {
      id: user._id,
      names: user.names,
      email: user.email,
      username: user.username,
      role: user.role,
      picture: user.picture,
      preferredLanguage: user.preferredLanguage,
      phoneNumber: user.phoneNumber,
      profile: profileData,
    }

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "User data retrieved successfully",
      data: {
        user: userData,
      },
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

