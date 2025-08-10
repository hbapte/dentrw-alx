/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import userRepository from "../repositories/userRepository"
import patientRepository from "../repositories/patientRepository"
import doctorRepository from "../repositories/doctorRepository"
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  conflictResponse,
  validationErrorResponse,
  databaseErrorResponse,
} from "../../../utils/api-response"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", search = "", role, active } = req.query

  try {
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

    // Create pagination metadata
    const pagination = {
      page: result.page,
      pageSize: result.limit,
      totalItems: result.total,
      totalPages: result.pages,
      hasNextPage: result.page < result.pages,
      hasPreviousPage: result.page > 1,
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=60" // Cache for 1 minute

    return successResponse(res, result.users, "Users retrieved successfully", {
      startTime: req.startTime,
      pagination,
      cacheControl,
      // Add warnings if applicable
      warnings: result.users.length === 0 ? ["No users match your search criteria."] : undefined,
      // Add links for API navigation
      links: {
        documentation: "/docs/api/users",
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve users", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!id) {
      return badRequestResponse(res, "User ID is required", null, {
        help: "Please provide a valid user ID in the URL path.",
        startTime: req.startTime,
      })
    }

    const user = await userRepository.findById(id)

    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "Check if the user ID is correct or the user might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Get additional profile data based on role
    let profileData = null
    if (user.role === "patient") {
      profileData = await patientRepository.findByUserId(user._id)
    } else if (user.role === "doctor") {
      profileData = await doctorRepository.findByUserId(user._id)
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=300" // Cache for 5 minutes

    return successResponse(res, { user, profile: profileData }, "User retrieved successfully", {
      startTime: req.startTime,
      cacheControl,
      links: {
        documentation: `/docs/api/users/${user.role}`,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve user", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Create a new user
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, names, role, password, phoneNumber, preferredLanguage } = req.body

  try {
    // Validate required fields
    if (!email || !names || !password) {
      return validationErrorResponse(
        res,
        "Missing required fields",
        {
          required: ["email", "names", "password"],
          provided: Object.keys(req.body),
        },
        {
          help: "Please provide all required fields: email, names, and password.",
          startTime: req.startTime,
        },
      )
    }

    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(email)
    if (existingEmail) {
      return conflictResponse(
        res,
        "Email already exists",
        { email },
        {
          help: "Please use a different email address or recover your existing account.",
          startTime: req.startTime,
        },
      )
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await userRepository.findByUsername(username)
      if (existingUsername) {
        return conflictResponse(
          res,
          "Username already exists",
          { username },
          {
            help: "Please choose a different username.",
            startTime: req.startTime,
          },
        )
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

    return successResponse(res, { user: newUser }, "User created successfully", {
      statusCode: 201, // Created
      startTime: req.startTime,
      links: {
        self: `/api/users/${newUser._id}`,
        documentation: `/docs/api/users/${newUser.role}`,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to create user", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Update a user
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { names, username, email, phoneNumber, preferredLanguage, active } = req.body

  try {
    // Check if user exists
    const user = await userRepository.findById(id)
    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "Check if the user ID is correct or the user might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingEmail = await userRepository.findByEmail(email)
      if (existingEmail) {
        return conflictResponse(
          res,
          "Email already exists",
          { email },
          {
            help: "Please use a different email address.",
            startTime: req.startTime,
          },
        )
      }
    }

    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUsername = await userRepository.findByUsername(username)
      if (existingUsername) {
        return conflictResponse(
          res,
          "Username already exists",
          { username },
          {
            help: "Please choose a different username.",
            startTime: req.startTime,
          },
        )
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

    // Check if any fields were actually updated
    if (Object.keys(updateData).length === 0) {
      return successResponse(res, { user }, "No changes made to user", {
        startTime: req.startTime,
        warnings: ["No fields were updated. Request body contained no valid update fields."],
      })
    }

    const updatedUser = await userRepository.updateUser(id, updateData)

    // Log the action
    await logAction(req, "update_user", "user", id, { updatedFields: Object.keys(updateData) })

    return successResponse(res, { user: updatedUser }, "User updated successfully", {
      startTime: req.startTime,
      links: {
        self: `/api/users/${id}`,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update user", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Delete a user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Check if user exists
    const user = await userRepository.findById(id)
    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "Check if the user ID is correct or the user might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if user is the current user
    if (req.user && req.user.userId === id) {
      return badRequestResponse(res, "Cannot delete your own account", null, {
        help: "You cannot delete your own account while logged in with it.",
        startTime: req.startTime,
      })
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

    return successResponse(res, null, "User deleted successfully", {
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to delete user", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Change user status (active/inactive)
 */
export const changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { active } = req.body

  try {
    if (active === undefined) {
      return badRequestResponse(res, "Active status is required", null, {
        help: "Please provide the 'active' field with a boolean value.",
        startTime: req.startTime,
      })
    }

    // Check if user exists
    const user = await userRepository.findById(id)
    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "Check if the user ID is correct or the user might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if user is the current user
    if (req.user && req.user.userId === id && active === false) {
      return badRequestResponse(res, "Cannot deactivate your own account", null, {
        help: "You cannot deactivate your own account while logged in with it.",
        startTime: req.startTime,
      })
    }

    // If status is not changing, return early
    if (user.active === active) {
      return successResponse(res, { user }, "User status unchanged", {
        startTime: req.startTime,
        warnings: [`User is already ${active ? "active" : "inactive"}.`],
      })
    }

    // Update user status
    const updatedUser = await userRepository.changeUserStatus(id, active)

    // Log the action
    await logAction(req, "change_user_status", "user", id, { active })

    return successResponse(res, { user: updatedUser }, `User ${active ? "activated" : "deactivated"} successfully`, {
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to change user status", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Change user role
 */
export const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { role } = req.body

  try {
    if (!role || !["patient", "doctor", "admin"].includes(role)) {
      return badRequestResponse(
        res,
        "Valid role is required",
        { role },
        {
          help: "Please provide a valid role: 'patient', 'doctor', or 'admin'.",
          startTime: req.startTime,
        },
      )
    }

    // Check if user exists
    const user = await userRepository.findById(id)
    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "Check if the user ID is correct or the user might have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if user is the current user
    if (req.user && req.user.userId === id && role !== "admin") {
      return badRequestResponse(res, "Cannot change your own role from admin", null, {
        help: "You cannot change your own admin role while logged in.",
        startTime: req.startTime,
      })
    }

    // If role is not changing, return early
    if (user.role === role) {
      return successResponse(res, { user }, "User role unchanged", {
        startTime: req.startTime,
        warnings: [`User already has the role '${role}'.`],
      })
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

    return successResponse(res, { user: updatedUser }, "User role changed successfully", {
      startTime: req.startTime,
      links: {
        self: `/api/users/${id}`,
        profile: role !== "admin" ? `/api/${role}s/${id}` : undefined,
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to change user role", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  try {
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

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=300" // Cache for 5 minutes

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
      {
        startTime: req.startTime,
        cacheControl,
        links: {
          documentation: "/docs/api/users/statistics",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve user statistics", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})
