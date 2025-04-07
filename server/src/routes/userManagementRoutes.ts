import express from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  changeUserRole,
  getUserStats,
} from "../modules/user/controllers/userManagementController"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validation.middleware"
import { createUserSchema, updateUserSchema } from "../validations/userValidation"

const userRouter = express.Router()

// All routes require authentication and admin role
userRouter.use(authenticateToken, authorizeRoles("admin"))

// Get user statistics
userRouter.get("/stats", getUserStats)

// Get all users with pagination and filtering
userRouter.get("/", getAllUsers)

// Get user by ID
userRouter.get("/:id", getUserById)

// Create a new user
userRouter.post("/", validate(createUserSchema), createUser)

// Update a user
userRouter.put("/:id", validate(updateUserSchema), updateUser)

// Delete a user
userRouter.delete("/:id", deleteUser)

// Change user status (active/inactive)
userRouter.patch("/:id/status", changeUserStatus)

// Change user role
userRouter.patch("/:id/role", changeUserRole)

export default userRouter

