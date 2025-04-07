import express from "express"
import authRouter from "./authRoutes"
import profileRouter from "./profileRoutes"
import MFArouter from "./twoFactorAuthRoutes"
import userRouter from "./userManagementRoutes"
import patientManagementRouter from "./patientManagementRoutes"
import doctorManagementRouter from "./doctorManagementRoutes"
import appointmentRouter from "./appointmentRoutes"
import medicalRecordRouter from "./medicalRecordRoutes"

const router = express.Router()

router.use("/auth", authRouter)
router.use("/profile", profileRouter)
router.use("/2fa", MFArouter)
router.use("/users", userRouter)
router.use("/patients", patientManagementRouter)
router.use("/doctors", doctorManagementRouter)
router.use("/appointments", appointmentRouter)
router.use("/medical-records", medicalRecordRouter)

export default router

