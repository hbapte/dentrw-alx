import express from "express"
import {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  addPrescription,
  updatePrescription,
  removePrescription,
  addAttachment,
  removeAttachment,
  getPatientMedicalHistory,
  getFollowUpRecords,
  getMedicalRecordStats,
} from "../modules/medicalRecord/controllers/medicalRecordController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validation.middleware"
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
  prescriptionSchema,
  attachmentSchema,
} from "../validations/medicalRecordValidation"

const medicalRecordRouter = express.Router()

// All routes require authentication
medicalRecordRouter.use(authenticateToken)

// Routes that require doctor or admin role
// medicalRecordRouter.use(authorizeRoles("doctor", "admin"))

// Medical record routes
medicalRecordRouter.get("/", authorizeRoles("doctor", "admin"), getAllMedicalRecords)
medicalRecordRouter.get("/stats", authorizeRoles("doctor", "admin"), getMedicalRecordStats)
medicalRecordRouter.get("/follow-up", authorizeRoles("doctor", "admin"), getFollowUpRecords)
medicalRecordRouter.get("/:id", authorizeRoles("doctor", "admin"), getMedicalRecordById)
medicalRecordRouter.post("/", authorizeRoles("doctor", "admin"), validate(createMedicalRecordSchema), createMedicalRecord)
medicalRecordRouter.put("/:id", authorizeRoles("doctor", "admin"), validate(updateMedicalRecordSchema), updateMedicalRecord)
medicalRecordRouter.delete("/:id", authorizeRoles("admin"), deleteMedicalRecord)

// Prescription routes
medicalRecordRouter.post("/:id/prescriptions", authorizeRoles("doctor", "admin"), validate(prescriptionSchema), addPrescription)
medicalRecordRouter.put("/:id/prescriptions/:prescriptionId", authorizeRoles("doctor", "admin"), validate(prescriptionSchema), updatePrescription)
medicalRecordRouter.delete("/:id/prescriptions/:prescriptionId", authorizeRoles("doctor", "admin"), removePrescription)

// Attachment routes
medicalRecordRouter.post("/:id/attachments", authorizeRoles("doctor", "admin"), validate(attachmentSchema), addAttachment)
medicalRecordRouter.delete("/:id/attachments/:attachmentId", authorizeRoles("doctor", "admin"), removeAttachment)

// Patient medical history route
medicalRecordRouter.get("/patient/:patientId/history", authorizeRoles("doctor", "admin"), getPatientMedicalHistory)

export default medicalRecordRouter

