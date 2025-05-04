
import express from "express"
import {
  getUserProfileController,
  updateUserProfileController,
  updatePatientProfileController,
  updateDoctorProfileController,
  changePasswordController,
  // setPasswordController,
  // uploadProfilePictureController,
} from "../modules/profile/profileController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"
import { validate} from "../middlewares/validation.middleware"
import { updateProfileSchema } from "../validations/profileValidation"

const profileRouter = express.Router()

// Protected routes
profileRouter.get("/", authenticateToken, getUserProfileController)
profileRouter.put("/", authenticateToken, validate(updateProfileSchema), updateUserProfileController)
profileRouter.put("/patient", authenticateToken, authorizeRoles("patient"), updatePatientProfileController)
profileRouter.put("/doctor", authenticateToken, authorizeRoles("doctor"), updateDoctorProfileController)
profileRouter.post("/change-password", authenticateToken, changePasswordController)
// profileRouter.post("/set-password", authenticateToken, setPasswordController)
// profileRouter.post("/upload-picture", authenticateToken, uploadProfilePictureController)

export default profileRouter

