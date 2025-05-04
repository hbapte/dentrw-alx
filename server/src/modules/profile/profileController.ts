/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import User from "../../database/models/user"
import Patient from "../../database/models/patient"
import Doctor from "../../database/models/doctor"
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  unauthorizedResponse,
  databaseErrorResponse,
  validationErrorResponse,
} from "../../utils/api-response"
import asyncHandler from "../../utils/asyncHandler"
import { logAction } from "../../utils/auditLogUtil"

/**
 * Get user profile
 */
export const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to access your profile.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId

    // Get user data
    const user = await User.findById(userId).select(
      "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires -totpSecret",
    )

    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    // Get profile data based on role
    let profileData = null

    if (user.role === "patient") {
      profileData = await Patient.findOne({ user: userId })
    } else if (user.role === "doctor") {
      profileData = await Doctor.findOne({ user: userId })
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=60" // Cache for 1 minute

    return successResponse(
      res,
      {
        user,
        profile: profileData,
      },
      "User profile retrieved successfully",
      {
        startTime: req.startTime,
        cacheControl,
        links: {
          self: "/api/profile",
          updateProfile: "/api/profile",
          updatePassword: "/api/profile/password",
          documentation: `/docs/api/profile/${user.role}`,
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to retrieve user profile", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Update user profile
 */
export const updateUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your profile.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const { names, username, phoneNumber, preferredLanguage } = req.body

    // Validate input
    const validationErrors: Record<string, string> = {}

    if (names && (typeof names !== "string" || names.length < 2)) {
      validationErrors.names = "Names must be at least 2 characters long"
    }

    if (username && (typeof username !== "string" || username.length < 3)) {
      validationErrors.username = "Username must be at least 3 characters long"
    }

    if (phoneNumber && !/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
      validationErrors.phoneNumber = "Invalid phone number format"
    }

    if (preferredLanguage && !["en", "fr", "rw"].includes(preferredLanguage)) {
      validationErrors.preferredLanguage = "Preferred language must be one of: en, fr, rw"
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(res, "Invalid input data", validationErrors, {
        help: "Please provide valid values for all fields.",
        startTime: req.startTime,
      })
    }

    // Update user data
    const user = await User.findById(userId)

    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })

      if (existingUser) {
        return badRequestResponse(
          res,
          "Username is already taken",
          { username },
          {
            help: "Please choose a different username.",
            startTime: req.startTime,
          },
        )
      }

      user.username = username
    }

    // Update fields if provided
    let updated = false
    if (names) {
      user.names = names
      updated = true
    }
    if (phoneNumber) {
      user.phoneNumber = phoneNumber
      updated = true
    }
    if (preferredLanguage) {
      user.preferredLanguage = preferredLanguage
      updated = true
    }

    // If no fields were updated
    if (!updated && !username) {
      return successResponse(
        res,
        {
          user: {
            id: user._id,
            names: user.names,
            email: user.email,
            username: user.username,
            role: user.role,
            picture: user.picture,
            preferredLanguage: user.preferredLanguage,
            phoneNumber: user.phoneNumber,
          },
        },
        "No changes made to profile",
        {
          startTime: req.startTime,
          warnings: ["No fields were updated. Request body contained no valid update fields."],
        },
      )
    }

    await user.save()

    // Log the action
    await logAction(req, "update", "user", userId.toString(), {
      updatedFields: { names, username, phoneNumber, preferredLanguage },
    })

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          names: user.names,
          email: user.email,
          username: user.username,
          role: user.role,
          picture: user.picture,
          preferredLanguage: user.preferredLanguage,
          phoneNumber: user.phoneNumber,
        },
      },
      "Profile updated successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/profile",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update user profile", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Update patient profile
 */
export const updatePatientProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your patient profile.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId

    // Check if user is a patient
    const user = await User.findById(userId)

    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    if (user.role !== "patient") {
      return forbiddenResponse(res, "Access denied. User is not a patient.", {
        help: "Only patients can update patient profiles.",
        startTime: req.startTime,
      })
    }

    // Validate input data
    const { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo } = req.body

    const validationErrors: Record<string, string> = {}

    if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
      validationErrors.dateOfBirth = "Invalid date format"
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      validationErrors.gender = "Gender must be one of: male, female, other"
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(res, "Invalid input data", validationErrors, {
        help: "Please provide valid values for all fields.",
        startTime: req.startTime,
      })
    }

    // Get patient profile
    let patient = await Patient.findOne({ user: userId })

    if (!patient) {
      // Create patient profile if it doesn't exist
      patient = new Patient({ user: userId })
    }

    // Update patient data
    let updated = false

    if (dateOfBirth) {
      patient.dateOfBirth = new Date(dateOfBirth)
      updated = true
    }
    if (gender) {
      patient.gender = gender
      updated = true
    }

    if (address) {
      patient.address = {
        ...patient.address,
        ...address,
      }
      updated = true
    }

    if (emergencyContact) {
      patient.emergencyContact = {
        ...patient.emergencyContact,
        ...emergencyContact,
      }
      updated = true
    }

    if (medicalHistory) {
      patient.medicalHistory = {
        ...patient.medicalHistory,
        ...medicalHistory,
      }
      updated = true
    }

    if (insuranceInfo) {
      patient.insuranceInfo = {
        ...patient.insuranceInfo,
        ...insuranceInfo,
      }
      updated = true
    }

    // If no fields were updated
    if (!updated) {
      return successResponse(
        res,
        {
          profile: patient,
        },
        "No changes made to patient profile",
        {
          startTime: req.startTime,
          warnings: ["No fields were updated. Request body contained no valid update fields."],
        },
      )
    }

    await patient.save()

    // Log the action
    await logAction(req, "update", "patient", patient._id.toString(), {
      updatedFields: { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo },
    })

    return successResponse(
      res,
      {
        profile: patient,
      },
      "Patient profile updated successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/profile/patient",
          user: "/api/profile",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update patient profile", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Update doctor profile
 */
export const updateDoctorProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your doctor profile.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId

    // Check if user is a doctor
    const user = await User.findById(userId)

    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    if (user.role !== "doctor") {
      return forbiddenResponse(res, "Access denied. User is not a doctor.", {
        help: "Only doctors can update doctor profiles.",
        startTime: req.startTime,
      })
    }

    // Validate input data
    const { specialization, qualifications, experience, bio, languages, consultationFee, availability } = req.body

    const validationErrors: Record<string, string> = {}

    if (experience !== undefined && (isNaN(experience) || experience < 0)) {
      validationErrors.experience = "Experience must be a non-negative number"
    }

    if (consultationFee !== undefined && (isNaN(consultationFee) || consultationFee < 0)) {
      validationErrors.consultationFee = "Consultation fee must be a non-negative number"
    }

    if (languages && !Array.isArray(languages)) {
      validationErrors.languages = "Languages must be an array"
    }

    if (qualifications && !Array.isArray(qualifications)) {
      validationErrors.qualifications = "Qualifications must be an array"
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrorResponse(res, "Invalid input data", validationErrors, {
        help: "Please provide valid values for all fields.",
        startTime: req.startTime,
      })
    }

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: userId })

    if (!doctor) {
      return notFoundResponse(res, "Doctor profile not found", {
        help: "The doctor profile may have been deleted. Please contact an administrator.",
        startTime: req.startTime,
      })
    }

    // Update doctor data
    let updated = false

    if (specialization) {
      doctor.specialization = specialization
      updated = true
    }
    if (qualifications) {
      doctor.qualifications = qualifications
      updated = true
    }
    if (experience !== undefined) {
      doctor.experience = experience
      updated = true
    }
    if (bio) {
      doctor.bio = bio
      updated = true
    }
    if (languages) {
      doctor.languages = languages
      updated = true
    }
    if (consultationFee !== undefined) {
      doctor.consultationFee = consultationFee
      updated = true
    }
    if (availability) {
      doctor.availability = availability
      updated = true
    }

    // If no fields were updated
    if (!updated) {
      return successResponse(
        res,
        {
          profile: doctor,
        },
        "No changes made to doctor profile",
        {
          startTime: req.startTime,
          warnings: ["No fields were updated. Request body contained no valid update fields."],
        },
      )
    }

    await doctor.save()

    // Log the action
    await logAction(req, "update", "doctor", doctor._id.toString(), {
      updatedFields: { specialization, qualifications, experience, bio, languages, consultationFee, availability },
    })

    return successResponse(
      res,
      {
        profile: doctor,
      },
      "Doctor profile updated successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/profile/doctor",
          user: "/api/profile",
          availability: "/api/profile/doctor/availability",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update doctor profile", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/**
 * Change password
 */
export const changePasswordController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to change your password.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return validationErrorResponse(
        res,
        "Missing required fields",
        {
          required: ["currentPassword", "newPassword"],
          provided: Object.keys(req.body),
        },
        {
          help: "Please provide both current password and new password.",
          startTime: req.startTime,
        },
      )
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return validationErrorResponse(
        res,
        "Invalid password",
        { newPassword: "Password must be at least 8 characters long" },
        {
          help: "Please provide a stronger password with at least 8 characters.",
          startTime: req.startTime,
        },
      )
    }

    // Get user
    const user = await User.findById(userId)

    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if user has a password (might be using OAuth)
    if (!user.password) {
      return badRequestResponse(
        res,
        'You do not have a password set. Please use the "Set Password" feature instead.',
        null,
        {
          help: "Users who signed up with social providers need to set a password first.",
          startTime: req.startTime,
        },
      )
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)

    if (!isPasswordValid) {
      return unauthorizedResponse(res, "Current password is incorrect", {
        help: "Please enter your current password correctly.",
        startTime: req.startTime,
      })
    }

    // Check if new password is the same as current
    if (currentPassword === newPassword) {
      return badRequestResponse(res, "New password must be different from current password", null, {
        help: "Please choose a different password than your current one.",
        startTime: req.startTime,
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    // Log the action
    await logAction(req, "change_password", "user", userId.toString())

    return successResponse(res, null, "Password changed successfully", {
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to change password", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})
