import express from "express"
import {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  addDoctorRating,
  getDoctorStats,
} from "../modules/user/controllers/doctorManagementController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Public routes (still require authentication)
router.get("/", getAllDoctors)
router.get("/:id", getDoctorById)

// Routes that require admin role
router.get("/stats", authorizeRoles("admin"), getDoctorStats)
router.put("/:id", authorizeRoles("admin"), updateDoctor)

// Routes for patients to add ratings
router.post("/:id/ratings", authorizeRoles("patient"), addDoctorRating)

export default router

