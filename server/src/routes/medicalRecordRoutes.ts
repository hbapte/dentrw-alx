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
medicalRecordRouter.use(authorizeRoles("doctor", "admin"))

// Medical record routes
medicalRecordRouter.get("/", getAllMedicalRecords)
medicalRecordRouter.get("/stats", getMedicalRecordStats)
medicalRecordRouter.get("/follow-up", getFollowUpRecords)
medicalRecordRouter.get("/:id", getMedicalRecordById)
medicalRecordRouter.post("/", validate(createMedicalRecordSchema), createMedicalRecord)
medicalRecordRouter.put("/:id", validate(updateMedicalRecordSchema), updateMedicalRecord)
medicalRecordRouter.delete("/:id", authorizeRoles("admin"), deleteMedicalRecord)

// Prescription routes
medicalRecordRouter.post("/:id/prescriptions", validate(prescriptionSchema), addPrescription)
medicalRecordRouter.put("/:id/prescriptions/:prescriptionId", validate(prescriptionSchema), updatePrescription)
medicalRecordRouter.delete("/:id/prescriptions/:prescriptionId", removePrescription)

// Attachment routes
medicalRecordRouter.post("/:id/attachments", validate(attachmentSchema), addAttachment)
medicalRecordRouter.delete("/:id/attachments/:attachmentId", removeAttachment)

// Patient medical history route
medicalRecordRouter.get("/patient/:patientId/history", getPatientMedicalHistory)

export default medicalRecordRouter

