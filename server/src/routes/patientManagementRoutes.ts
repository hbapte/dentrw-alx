// server\src\routes\patientManagementRoutes.ts
import express from "express"
import {
  getAllPatients,
  getPatientById,
  updatePatient,
  getPatientStats,
  createPatient,
  deletePatient,
} from "../modules/user/controllers/patientManagementController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Routes that require admin role
router.get("/", authorizeRoles("admin", "doctor", "receptionist", "patient"), getAllPatients)
router.get("/stats", authorizeRoles("admin", "doctor", "receptionist"), getPatientStats)




// Routes that can be accessed by admin or doctor
router.get("/:id", authorizeRoles("admin", "doctor"), getPatientById)
router.put("/:id", authorizeRoles("admin"), updatePatient)
router.post("/", authorizeRoles("admin", "doctor"), createPatient)
router.delete("/:id", authorizeRoles("admin"), deletePatient)

export default router

