// apps\server\src\routes\paymentRoutes.ts
import express from "express"
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  processRefund,
  getInvoice,
  getReceipt,
  getPaymentStats,
  getPatientPaymentHistory,
  getOutstandingPayments,
  getPaymentsByAppointment,
} from "../modules/payment/controllers/paymentController"
import { validateCreatePayment, validateUpdatePayment, validateRefund } from "../modules/payment/validations/paymentValidations"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"

const paymentRouter = express.Router()

// Apply authentication middleware to all payment routes
paymentRouter.use(authenticateToken)

// Get all payments (admin, doctor)
paymentRouter.get("/", authorizeRoles("admin", "doctor"), getAllPayments)

// Get payment statistics (admin, doctor)
paymentRouter.get("/stats", authorizeRoles("admin", "doctor"), getPaymentStats)

// Get outstanding payments (admin, doctor)
paymentRouter.get("/outstanding", authorizeRoles("admin", "doctor"), getOutstandingPayments)

// Get patient payment history (admin, doctor, patient)
paymentRouter.get("/patient/:patientId", authorizeRoles("admin", "doctor", "patient"), getPatientPaymentHistory)

// Get payments by appointment (admin, doctor, patient)
paymentRouter.get("/appointment/:appointmentId", authorizeRoles("admin", "doctor", "patient"), getPaymentsByAppointment)

// Get payment by ID (admin, doctor,  "doctor", "patient"]), getPaymentsByAppointment)

// Get payment by ID (admin, doctor, patient)
paymentRouter.get("/:id", authorizeRoles("admin", "doctor", "patient"), getPaymentById)

// Create a new payment (admin, doctor, patient)
paymentRouter.post("/", validateCreatePayment, authorizeRoles("admin", "doctor", "patient"), createPayment)

// Update payment status (admin, doctor)
paymentRouter.patch("/:id/status", validateUpdatePayment, authorizeRoles("admin", "doctor"), updatePaymentStatus)

// Process a refund (admin only)
paymentRouter.post("/:id/refund", validateRefund, authorizeRoles("admin"), processRefund)

// Generate invoice (admin, doctor, patient)
paymentRouter.get("/:id/invoice", authorizeRoles("admin", "doctor", "patient"), getInvoice)

// Generate receipt (admin, doctor, patient)
paymentRouter.get("/:id/receipt", authorizeRoles("admin", "doctor", "patient"), getReceipt)

export default paymentRouter
