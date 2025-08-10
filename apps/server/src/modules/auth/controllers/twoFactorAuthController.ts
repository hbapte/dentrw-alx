// server\src\modules\auth\controllers\twoFactorAuthController.ts
import type { Request, Response } from "express"
import httpStatus from "http-status"
import { generateTOTPSecret, verifyTOTPToken, disableTwoFactorAuth } from "../../../services/twoFactorAuthService"
import { logAction } from "../../../utils/auditLogUtil"
import { successResponse, badRequestResponse, internalErrorResponse } from "../../../utils/api-response"

// Generate 2FA setup
export const setupTwoFactorAuthController = async (req: Request, res: Response) => {
  const startTime = performance.now()

  try {
    const userId = req.user!.userId

    const result = await generateTOTPSecret(userId.toString())

    if (!result.success) {
      return badRequestResponse(res, result.error || "Failed to setup two-factor authentication", null, { startTime })
    }

    // Log the action
    await logAction(req, "setup_2fa", "user", userId.toString())

    return successResponse(
      res,
      {
        qrCode: result.qrCodeUrl,
        secret: result.secret, // This should be shown to the user only once
      },
      "Two-factor authentication setup initiated",
      {
        statusCode: httpStatus.OK,
        startTime,
        links: {
          verify: `/api/auth/2fa/verify`,
          cancel: `/api/auth/2fa/disable`,
        },
      },
    )
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Verify and enable 2FA
export const verifyTwoFactorAuthController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { token } = req.body

  if (!token) {
    return badRequestResponse(res, "Verification code is required", null, { startTime })
  }

  try {
    const userId = req.user!.userId

    const result = await verifyTOTPToken(userId.toString(), token)

    if (!result.success) {
      return badRequestResponse(res, result.error || "Invalid verification code", null, { startTime })
    }

    // Log the action
    await logAction(req, "enable_2fa", "user", userId.toString())

    return successResponse(res, { enabled: true }, "Two-factor authentication enabled successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        disable: `/api/auth/2fa/disable`,
        profile: `/api/users/me`,
      },
    })
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Disable 2FA
export const disableTwoFactorAuthController = async (req: Request, res: Response) => {
  const startTime = performance.now()

  try {
    const userId = req.user!.userId

    const result = await disableTwoFactorAuth(userId.toString())

    if (!result.success) {
      return badRequestResponse(res, result.error || "Failed to disable two-factor authentication", null, { startTime })
    }

    // Log the action
    await logAction(req, "disable_2fa", "user", userId.toString())

    return successResponse(res, { enabled: false }, "Two-factor authentication disabled successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        setup: `/api/auth/2fa/setup`,
        profile: `/api/users/me`,
      },
    })
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}

// Validate 2FA during login
export const validateTwoFactorAuthController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { userId, token } = req.body

  if (!userId || !token) {
    return badRequestResponse(res, "User ID and verification code are required", null, { startTime })
  }

  try {
    const result = await verifyTOTPToken(userId, token)

    if (!result.success) {
      return badRequestResponse(res, result.error || "Invalid verification code", null, { startTime })
    }

    // Log the action
    await logAction(req, "validate_2fa", "user", userId)

    return successResponse(res, { verified: true }, "Two-factor authentication verified successfully", {
      statusCode: httpStatus.OK,
      startTime,
      links: {
        login: `/api/auth/login`,
        completeLogin: `/api/auth/verify-2fa`,
      },
    })
  } catch (error) {
    console.error("Error validating 2FA:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}
