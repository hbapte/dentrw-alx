import express from "express"
import {
  getAllPatients,
  getPatientById,
  updatePatient,
  getPatientStats,
} from "../modules/user/controllers/patientManagementController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Routes that require admin role
router.get("/", authorizeRoles("admin"), getAllPatients)
router.get("/stats", authorizeRoles("admin"), getPatientStats)

// Routes that can be accessed by admin or doctor
router.get("/:id", authorizeRoles("admin", "doctor"), getPatientById)
router.put("/:id", authorizeRoles("admin"), updatePatient)

export default router

