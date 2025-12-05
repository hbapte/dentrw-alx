// apps\server\src\routes\authRoutes.ts
import express from "express"
import {
  registerController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
  getCurrentUserController,
  refreshTokenController,
  verifyTwoFactorController,
  checkUsernameController,
} from "../modules/auth/controllers/authControllers"
import { googleLoginController } from "../modules/auth/controllers/googleAuthController"
import { authenticateToken } from "../middlewares/auth.middleware"
import {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
} from "../middlewares/rateLimiter.middleware"
import { validate } from "../middlewares/validation.middleware"

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorSchema,
  // checkUsernameSchema,
} from "../validations/authValidation"

const authRouter = express.Router()

// Public routes with rate limiting and validation
authRouter.post("/register", registrationRateLimiter, validate(registerSchema), registerController)
authRouter.get('/checkUsername/:username',checkUsernameController)
// authRouter.post("/checkUsername", validate(checkUsernameSchema), checkUsernameController)  

authRouter.post("/login", loginRateLimiter, validate(loginSchema), loginController)
authRouter.post("/google-login", loginRateLimiter, googleLoginController)
authRouter.post("/verify-2fa", loginRateLimiter, validate(twoFactorSchema), verifyTwoFactorController)
authRouter.get("/verify-email/:token", verifyEmailController)
authRouter.post("/resend-verification", loginRateLimiter, resendVerificationController)
authRouter.post("/forgot-password", passwordResetRateLimiter, validate(forgotPasswordSchema), forgotPasswordController)
authRouter.post(
  "/reset-password/:token",
  passwordResetRateLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
)
authRouter.post("/logout", logoutController)

// New refresh token endpoint
authRouter.post("/refresh", refreshTokenController)

// Protected routes
authRouter.get("/me", authenticateToken, getCurrentUserController)


export default authRouter
