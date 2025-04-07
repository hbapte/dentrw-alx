import express from "express"
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  changeAppointmentStatus,
  getAppointmentStats,
  getAppointmentsByDate,
  getUpcomingAppointments,
  addAppointmentReminder,
  checkDoctorAvailability,
  getAppointmentsNeedingReminders,
} from "../modules/appointments/controllers/appointmentController"

import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validation.middleware"
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  changeAppointmentStatusSchema,
  checkAvailabilitySchema,
} from "../validations/appointmentValidation"

const appointmentRouter = express.Router()

// All routes require authentication
appointmentRouter.use(authenticateToken)

// Public routes (still require authentication)
appointmentRouter.get("/", getAllAppointments)
appointmentRouter.get("/stats", authorizeRoles("admin", "doctor"), getAppointmentStats)
appointmentRouter.get("/by-date", getAppointmentsByDate)
appointmentRouter.get("/upcoming", getUpcomingAppointments)
appointmentRouter.get("/:id", getAppointmentById)
appointmentRouter.post("/check-availability", validate(checkAvailabilitySchema), checkDoctorAvailability)

// Routes for creating and managing appointments
appointmentRouter.post("/", validate(createAppointmentSchema), createAppointment)
appointmentRouter.put("/:id", validate(updateAppointmentSchema), updateAppointment)
appointmentRouter.patch("/:id/cancel", validate(cancelAppointmentSchema), cancelAppointment)
appointmentRouter.patch("/:id/status", validate(changeAppointmentStatusSchema), changeAppointmentStatus)
appointmentRouter.post("/:id/reminders", addAppointmentReminder)

// Admin and doctor only routes
appointmentRouter.get("/needing-reminders", authorizeRoles("admin", "doctor"), getAppointmentsNeedingReminders)

export default appointmentRouter

