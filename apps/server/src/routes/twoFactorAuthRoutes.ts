import express from "express"
import {
  setupTwoFactorAuthController,
  verifyTwoFactorAuthController,
  disableTwoFactorAuthController,
  validateTwoFactorAuthController,
} from "../modules/auth/controllers/twoFactorAuthController"
import { authenticateToken } from "..//middlewares/auth.middleware"

const MFArouter = express.Router()

// Protected routes
MFArouter.post("/setup", authenticateToken, setupTwoFactorAuthController)
MFArouter.post("/verify", authenticateToken, verifyTwoFactorAuthController)
MFArouter.post("/disable", authenticateToken, disableTwoFactorAuthController)

// Public route (used during login)
MFArouter.post("/validate", validateTwoFactorAuthController)

export default MFArouter

