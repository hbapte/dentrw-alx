// server\src\routes\profileRoutes.ts
import express from "express"
import {
  getUserProfileController,
  updateUserProfileController,
  updatePatientProfileController,
  updateDoctorProfileController,
  changePasswordController,
  setPasswordController,
  uploadProfilePictureController,
  deleteProfilePictureController,
  updateReceptionistProfileController,
  updateAdminProfileController,
} from "../modules/profile/profileController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"
import { validate} from "../middlewares/validation.middleware"
import { updateProfileSchema } from "../validations/profileValidation"
import { handleProfilePictureUpload, 
  // validateUploadedFiles
 } from "../middlewares/upload.middleware"

const profileRouter = express.Router()

// Protected routes
profileRouter.get("/", authenticateToken, getUserProfileController)
profileRouter.put("/", authenticateToken, validate(updateProfileSchema), updateUserProfileController)
profileRouter.put("/patient", authenticateToken, authorizeRoles("patient"), updatePatientProfileController)
profileRouter.put("/doctor", authenticateToken, authorizeRoles("doctor"), updateDoctorProfileController)
profileRouter.put("/receptionist", authenticateToken, authorizeRoles("receptionist"), updateReceptionistProfileController)
profileRouter.put("/admin", authenticateToken, authorizeRoles("admin"), updateAdminProfileController)



profileRouter.post("/change-password", authenticateToken, changePasswordController)
profileRouter.post("/set-password", authenticateToken, setPasswordController)
// profileRouter.post("/upload-picture", authenticateToken, uploadProfilePictureController)
// File upload routes
profileRouter.post(
  "/upload-picture",
  authenticateToken,
  handleProfilePictureUpload,
  // validateUploadedFiles,
  uploadProfilePictureController,
)
profileRouter.delete("/delete-picture", authenticateToken, deleteProfilePictureController)

export default profileRouter

