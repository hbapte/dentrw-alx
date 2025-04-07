import type { Request, Response } from "express"
import httpStatus from "http-status"
import userRepository from "../repositories/userRepository"
import patientRepository from "../repositories/patientRepository"
import doctorRepository from "../repositories/doctorRepository"
import { successResponse, notFoundResponse, badRequestResponse, conflictResponse } from "../../../utils/responseHandler"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", search = "", role, active } = req.query

  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    search: search as string,
    role: role as "patient" | "doctor" | "admin" | undefined,
    active: active === "true" ? true : active === "false" ? false : undefined,
  }

  const result = await userRepository.findUsers(options)

  return successResponse(res, result, "Users retrieved successfully")
})

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await userRepository.findById(id)

  if (!user) {
    return notFoundResponse(res, "User not found")
  }

  // Get additional profile data based on role
  let profileData = null
  if (user.role === "patient") {
    profileData = await patientRepository.findByUserId(user._id)
  } else if (user.role === "doctor") {
    profileData = await doctorRepository.findByUserId(user._id)
  }

  return successResponse(res, { user, profile: profileData }, "User retrieved successfully")
})

/**
 * Create a new user
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, names, role, password, phoneNumber, preferredLanguage } = req.body

  // Check if email already exists
  const existingEmail = await userRepository.findByEmail(email)
  if (existingEmail) {
    return conflictResponse(res, "Email already exists")
  }

  // Check if username already exists (if provided)
  if (username) {
    const existingUsername = await userRepository.findByUsername(username)
    if (existingUsername) {
      return conflictResponse(res, "Username already exists")
    }
  }

  // Create user
  const userData = {
    email,
    username,
    names,
    role: role || "patient",
    password,
    phoneNumber,
    preferredLanguage: preferredLanguage || "en",
    emailVerified: true, // Admin-created users are verified by default
    emailVerificationToken: "",
    active: true,
  }

  const newUser = await userRepository.createUser(userData)

  // Create profile based on role
  if (newUser.role === "patient") {
    await patientRepository.createPatient({ user: newUser._id })
  } else if (newUser.role === "doctor") {
    await doctorRepository.createDoctor({
      user: newUser._id,
      specialization: "General Dentistry", // Default value
      qualifications: [],
      experience: 0,
      licenseNumber: "TBD", // To be updated later
      bio: "",
      languages: ["English"],
      consultationFee: 0,
      availability: [],
    })
  }

  // Log the action
  await logAction(req, "create_user", "user", newUser._id.toString(), { role: newUser.role })

  return successResponse(res, { user: newUser }, "User created successfully", httpStatus.CREATED)
})

/**
 * Update a user
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { names, username, email, phoneNumber, preferredLanguage, active } = req.body

  // Check if user exists
  const user = await userRepository.findById(id)
  if (!user) {
    return notFoundResponse(res, "User not found")
  }

  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const existingEmail = await userRepository.findByEmail(email)
    if (existingEmail) {
      return conflictResponse(res, "Email already exists")
    }
  }

  // Check if username is being changed and already exists
  if (username && username !== user.username) {
    const existingUsername = await userRepository.findByUsername(username)
    if (existingUsername) {
      return conflictResponse(res, "Username already exists")
    }
  }

  // Update user
  const updateData: any = {}
  if (names) updateData.names = names
  if (username) updateData.username = username
  if (email) updateData.email = email
  if (phoneNumber) updateData.phoneNumber = phoneNumber
  if (preferredLanguage) updateData.preferredLanguage = preferredLanguage
  if (active !== undefined) updateData.active = active

  const updatedUser = await userRepository.updateUser(id, updateData)

  // Log the action
  await logAction(req, "update_user", "user", id, { updatedFields: updateData })

  return successResponse(res, { user: updatedUser }, "User updated successfully")
})

/**
 * Delete a user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  // Check if user exists
  const user = await userRepository.findById(id)
  if (!user) {
    return notFoundResponse(res, "User not found")
  }

  // Delete user
  await userRepository.deleteUser(id)

  // Delete associated profile
  if (user.role === "patient") {
    const patient = await patientRepository.findByUserId(id)
    if (patient) {
      await patientRepository.deletePatient(patient._id)
    }
  } else if (user.role === "doctor") {
    const doctor = await doctorRepository.findByUserId(id)
    if (doctor) {
      await doctorRepository.deleteDoctor(doctor._id)
    }
  }

  // Log the action
  await logAction(req, "delete_user", "user", id)

  return successResponse(res, null, "User deleted successfully")
})

/**
 * Change user status (active/inactive)
 */
export const changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { active } = req.body

  if (active === undefined) {
    return badRequestResponse(res, "Active status is required")
  }

  // Check if user exists
  const user = await userRepository.findById(id)
  if (!user) {
    return notFoundResponse(res, "User not found")
  }

  // Update user status
  const updatedUser = await userRepository.changeUserStatus(id, active)

  // Log the action
  await logAction(req, "change_user_status", "user", id, { active })

  return successResponse(res, { user: updatedUser }, `User ${active ? "activated" : "deactivated"} successfully`)
})

/**
 * Change user role
 */
export const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { role } = req.body

  if (!role || !["patient", "doctor", "admin"].includes(role)) {
    return badRequestResponse(res, "Valid role is required (patient, doctor, or admin)")
  }

  // Check if user exists
  const user = await userRepository.findById(id)
  if (!user) {
    return notFoundResponse(res, "User not found")
  }

  // If role is not changing, return early
  if (user.role === role) {
    return successResponse(res, { user }, "User role unchanged")
  }

  // Handle profile creation/deletion based on role change
  const oldRole = user.role

  // Update user role
  const updatedUser = await userRepository.changeUserRole(id, role as "patient" | "doctor" | "admin")

  // Create new profile based on new role
  if (role === "patient" && oldRole !== "patient") {
    // Check if patient profile already exists
    const existingPatient = await patientRepository.findByUserId(id)
    if (!existingPatient) {
      await patientRepository.createPatient({ user: id })
    }
  } else if (role === "doctor" && oldRole !== "doctor") {
    // Check if doctor profile already exists
    const existingDoctor = await doctorRepository.findByUserId(id)
    if (!existingDoctor) {
      await doctorRepository.createDoctor({
        user: id,
        specialization: "General Dentistry", // Default value
        qualifications: [],
        experience: 0,
        licenseNumber: "TBD", // To be updated later
        bio: "",
        languages: ["English"],
        consultationFee: 0,
        availability: [],
      })
    }
  }

  // Log the action
  await logAction(req, "change_user_role", "user", id, { oldRole, newRole: role })

  return successResponse(res, { user: updatedUser }, "User role changed successfully")
})

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  // Get user counts by role
  const roleCounts = await userRepository.countByRole()

  // Get gender distribution for patients
  const genderDistribution = await patientRepository.countByGender()

  // Get specialization distribution for doctors
  const specializationDistribution = await doctorRepository.countBySpecialization()

  // Get recent users
  const recentUsers = await userRepository.getRecentUsers(5)

  // Get top rated doctors
  const topDoctors = await doctorRepository.getTopRatedDoctors(5)

  return successResponse(
    res,
    {
      userCounts: roleCounts,
      genderDistribution,
      specializationDistribution,
      recentUsers,
      topDoctors,
    },
    "User statistics retrieved successfully",
  )
})

