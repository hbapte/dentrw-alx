import type { Request, Response } from "express"
import httpStatus from "http-status"
import { generateTOTPSecret, verifyTOTPToken, disableTwoFactorAuth } from "../../../services/twoFactorAuthService"
import { logAction } from "../../../utils/auditLogUtil"

// Generate 2FA setup
export const setupTwoFactorAuthController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id

    const result = await generateTOTPSecret(userId.toString())

    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: result.error || "Failed to setup two-factor authentication",
        data: null,
      })
    }

    // Log the action
    await logAction(req, "setup_2fa", "user", userId.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Two-factor authentication setup initiated",
      data: {
        qrCode: result.qrCodeUrl,
        secret: result.secret, // This should be shown to the user only once
      },
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Verify and enable 2FA
export const verifyTwoFactorAuthController = async (req: Request, res: Response) => {
  const { token } = req.body

  if (!token) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: "Verification code is required",
      data: null,
    })
  }

  try {
    const userId = req.user!._id

    const result = await verifyTOTPToken(userId.toString(), token)

    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: result.error || "Invalid verification code",
        data: null,
      })
    }

    // Log the action
    await logAction(req, "enable_2fa", "user", userId.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Two-factor authentication enabled successfully",
      data: {
        enabled: true,
      },
    })
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Disable 2FA
export const disableTwoFactorAuthController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id

    const result = await disableTwoFactorAuth(userId.toString())

    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: result.error || "Failed to disable two-factor authentication",
        data: null,
      })
    }

    // Log the action
    await logAction(req, "disable_2fa", "user", userId.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Two-factor authentication disabled successfully",
      data: {
        enabled: false,
      },
    })
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Validate 2FA during login
export const validateTwoFactorAuthController = async (req: Request, res: Response) => {
  const { userId, token } = req.body

  if (!userId || !token) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: "User ID and verification code are required",
      data: null,
    })
  }

  try {
    const result = await verifyTOTPToken(userId, token)

    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: result.error || "Invalid verification code",
        data: null,
      })
    }

    // Log the action
    await logAction(req, "validate_2fa", "user", userId)

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Two-factor authentication verified successfully",
      data: {
        verified: true,
      },
    })
  } catch (error) {
    console.error("Error validating 2FA:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

