// server\src\modules\auth\controllers\googleAuthController.ts
import type { Request, Response } from "express"
import { verifyGoogleToken, handleGoogleLogin } from "../../../services/googleAuthService"
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from "../../../utils/api-response"
import { logAction } from "../../../utils/auditLogUtil"
import { setTokenCookies } from "../../../utils/cookieUtil"

export const googleLoginController = async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { token } = req.body

  if (!token) {
    return badRequestResponse(res, "Google token is required", null, { startTime })
  }

  try {
    // Verify Google token
    const googleUserInfo = await verifyGoogleToken(token)

    if (!googleUserInfo) {
      return unauthorizedResponse(res, "Invalid Google token", { startTime })
    }

    // Handle Google login
    const result = await handleGoogleLogin(googleUserInfo, req)

    if (!result.success) {
      return internalErrorResponse(res, result.error || "Failed to process Google login", {
        startTime,
        debug: process.env.NODE_ENV === "development" ? result.debug : undefined,
      })
    }

    // Set cookies
    if (result.accessToken && result.refreshToken) {
      setTokenCookies(res, result.accessToken, result.refreshToken)
    }

    // Log the action
    await logAction(req, "google-login", "user", result.user.id.toString())

    return successResponse(
      res,
      {
        user: result.user,
        token: result.accessToken, // For clients that don't use cookies
      },
      "Google login successful",
      {
        statusCode: 200,
        startTime,
        links: {
          profile: `/api/users/me`,
          logout: `/api/auth/logout`,
        },
      },
    )
  } catch (error) {
    console.error("Error in Google login:", error)
    return internalErrorResponse(res, "Internal server error", {
      startTime,
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    })
  }
}
