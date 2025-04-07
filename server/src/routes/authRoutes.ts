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
} from "../modules/auth/controllers/authControllers"
import { googleLoginController } from "../modules/auth/controllers/googleAuthController"
import { authenticateToken } from "../middlewares/auth.middleware"
import {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
} from "../middlewares/rateLimiter.middleware"
import { validate} from "../middlewares/validation.middleware"

import { registerSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema} from "../validations/authValidation"

const authRouter = express.Router()

// Public routes with rate limiting and validation
authRouter.post("/register", registrationRateLimiter, validate(registerSchema), registerController)
authRouter.post("/login", loginRateLimiter, validate(loginSchema), loginController)
authRouter.post("/google-login", loginRateLimiter, googleLoginController)
authRouter.get("/verify-email/:token", verifyEmailController)
authRouter.post("/resend-verification", loginRateLimiter, resendVerificationController)
authRouter.post("/forgot-password", passwordResetRateLimiter, validate(forgotPasswordSchema), forgotPasswordController)
authRouter.post("/reset-password/:token", passwordResetRateLimiter, validate(resetPasswordSchema), resetPasswordController)
authRouter.post("/logout", logoutController)

// Protected routes
authRouter.get("/me", authenticateToken, getCurrentUserController)

export default authRouter

