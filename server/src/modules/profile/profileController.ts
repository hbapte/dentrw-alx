/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import User from "../../database/models/user"
import Patient from "../../database/models/patient"
import Doctor from "../../database/models/doctor"
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  databaseErrorResponse,
  validationErrorResponse,
  forbiddenResponse,
} from "../../utils/api-response"
import asyncHandler from "../../utils/asyncHandler"
import { logAction } from "../../utils/auditLogUtil"
import { deleteImageFromCloudinary, getOptimizedImageUrl } from "../../utils/uploadUtils"
import Admin from "../../database/models/admin"
import Receptionist from "../../database/models/receptionist"

/** * Get user profile */
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
    switch (user.role) {
      case "patient":
        profileData = await Patient.findOne({ user: userId })
        break
      case "doctor":
        profileData = await Doctor.findOne({ user: userId })
        break
      case "receptionist":
        profileData = await Receptionist.findOne({ user: userId })
          .populate("clinicAssignments.clinicId", "name address")
          .populate("performanceReviews.reviewer", "names email")
        break
      case "admin":
        profileData = await Admin.findOne({ user: userId })
          .populate("managedClinics.clinicId", "name address")
          .populate("managedUsers.userId", "names email role")
          .populate("reportingTo", "names email")
        break
      default:
        break
    }

    // Optimize profile picture URL if exists
    let optimizedPictureUrl = user.picture
    if (user.picture && user.picturePublicId) {
      optimizedPictureUrl = getOptimizedImageUrl(user.picturePublicId, {
        width: 400,
        height: 400,
        crop: "fill",
        quality: "auto",
      })
    }

    // Generate cache control based on data freshness
    const cacheControl = "private, max-age=60" // Cache for 1 minute

    return successResponse(
      res,
      {
        user: {
          ...user.toObject(),
          picture: optimizedPictureUrl,
        },
        profile: profileData,
      },
      "User profile retrieved successfully",
      {
        startTime: req.startTime,
        cacheControl,
        links: {
          self: "/api/profile",
          updateProfile: "/api/profile",
          updatePatientProfile: "/api/profile/patient",
          updateDoctorProfile: "/api/profile/doctor",
          updateReceptionistProfile: "/api/profile/receptionist",
          updateAdminProfile: "/api/profile/admin",
          updatePassword: "/api/profile/change-password",
          setPassword: "/api/profile/set-password",
          uploadPicture: "/api/profile/upload-picture",
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

/** * Update user profile */
export const updateUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your profile.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const {
      names,
      username,
      phoneNumber,
      preferredLanguage,
      nationalId,
      dateOfBirth,
      gender,
      maritalStatus,
      occupation,
    } = req.body

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
    if (nationalId && !/^[0-9]{16}$/.test(nationalId)) {
      validationErrors.nationalId = "National ID must be 16 digits"
    }
    if (gender && !["male", "female", "other"].includes(gender)) {
      validationErrors.gender = "Gender must be one of: male, female, other"
    }
    if (maritalStatus && !["single", "married", "divorced", "widowed"].includes(maritalStatus)) {
      validationErrors.maritalStatus = "Marital status must be one of: single, married, divorced, widowed"
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

    // Check if national ID is already taken
    if (nationalId && nationalId !== user.nationalId) {
      const existingUser = await User.findOne({ nationalId })
      if (existingUser) {
        return badRequestResponse(
          res,
          "National ID is already registered",
          { nationalId },
          {
            help: "This National ID is already associated with another account.",
            startTime: req.startTime,
          },
        )
      }
      user.nationalId = nationalId
    }

    // Update fields if provided
    let updated = false
    const updatedFields: any = {}

    if (names && names !== user.names) {
      user.names = names
      updatedFields.names = names
      updated = true
    }
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      user.phoneNumber = phoneNumber
      updatedFields.phoneNumber = phoneNumber
      updated = true
    }
    if (preferredLanguage && preferredLanguage !== user.preferredLanguage) {
      user.preferredLanguage = preferredLanguage
      updatedFields.preferredLanguage = preferredLanguage
      updated = true
    }
    if (dateOfBirth && dateOfBirth !== user.dateOfBirth?.toISOString()) {
      user.dateOfBirth = new Date(dateOfBirth)
      updatedFields.dateOfBirth = dateOfBirth
      updated = true
    }
    if (gender && gender !== user.gender) {
      user.gender = gender
      updatedFields.gender = gender
      updated = true
    }
    if (maritalStatus && maritalStatus !== user.maritalStatus) {
      user.maritalStatus = maritalStatus
      updatedFields.maritalStatus = maritalStatus
      updated = true
    }
    if (occupation && occupation !== user.occupation) {
      user.occupation = occupation
      updatedFields.occupation = occupation
      updated = true
    }

    // If no fields were updated
    if (!updated && !username && !nationalId) {
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
            nationalId: user.nationalId,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            maritalStatus: user.maritalStatus,
            occupation: user.occupation,
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
      updatedFields,
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
          nationalId: user.nationalId,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          maritalStatus: user.maritalStatus,
          occupation: user.occupation,
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

/** * Update patient profile */
export const updatePatientProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your patient profile.",
        startTime: req.startTime,
      })
    }

    if (req.user.role !== "patient") {
      return forbiddenResponse(res, "Access denied", {
        help: "Only patients can update patient profiles.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const profileData = req.body

    // Find or create patient profile
    let patient = await Patient.findOne({ user: userId })
    if (!patient) {
      patient = new Patient({ user: userId })
    }

    // Update patient fields
    if (profileData.dateOfBirth) {
      patient.dateOfBirth = new Date(profileData.dateOfBirth)
    }
    if (profileData.gender) {
      patient.gender = profileData.gender
    }
    if (profileData.nationalId) {
      patient.nationalId = profileData.nationalId
    }
    if (profileData.maritalStatus) {
      patient.maritalStatus = profileData.maritalStatus
    }
    if (profileData.occupation) {
      patient.occupation = profileData.occupation
    }

    // Update address
    if (profileData.address) {
      patient.address = {
        ...patient.address,
        ...profileData.address,
      }
    }

    // Update emergency contact
    if (profileData.emergencyContact) {
      patient.emergencyContact = {
        ...patient.emergencyContact,
        ...profileData.emergencyContact,
      }
    }

    // Update dental history
    if (profileData.dentalHistory) {
      patient.dentalHistory = {
        ...patient.dentalHistory,
        ...profileData.dentalHistory,
        lastDentalVisit: profileData.dentalHistory.lastDentalVisit
          ? new Date(profileData.dentalHistory.lastDentalVisit)
          : patient.dentalHistory?.lastDentalVisit,
      }
    }

    // Update medical history
    if (profileData.medicalHistory) {
      patient.medicalHistory = {
        ...patient.medicalHistory,
        ...profileData.medicalHistory,
      }
    }

    // Update insurance info
    if (profileData.insuranceInfo) {
      patient.insuranceInfo = {
        ...patient.insuranceInfo,
        ...profileData.insuranceInfo,
        expiryDate: profileData.insuranceInfo.expiryDate
          ? new Date(profileData.insuranceInfo.expiryDate)
          : patient.insuranceInfo?.expiryDate,
      }
    }

    // Update preferences
    if (profileData.preferences) {
      patient.preferences = {
        ...patient.preferences,
        ...profileData.preferences,
      }
    }

    await patient.save()

    // Log the action
    await logAction(req, "update", "patient_profile", userId.toString(), {
      updatedFields: Object.keys(profileData),
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
          profile: "/api/profile",
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

/** * Update doctor profile */
export const updateDoctorProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your doctor profile.",
        startTime: req.startTime,
      })
    }

    if (req.user.role !== "doctor") {
      return forbiddenResponse(res, "Access denied", {
        help: "Only doctors can update doctor profiles.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const profileData = req.body

    // Find or create doctor profile
    let doctor = await Doctor.findOne({ user: userId })
    if (!doctor) {
      doctor = new Doctor({ user: userId })
    }

    // Update doctor fields
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        ;(doctor as any)[key] = profileData[key]
      }
    })

    // Handle date fields
    if (profileData.licenseExpiryDate) {
      doctor.licenseExpiryDate = new Date(profileData.licenseExpiryDate)
    }

    await doctor.save()

    // Log the action
    await logAction(req, "update", "doctor_profile", userId.toString(), {
      updatedFields: Object.keys(profileData),
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
          profile: "/api/profile",
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

/** * Update receptionist profile */
export const updateReceptionistProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your receptionist profile.",
        startTime: req.startTime,
      })
    }

    if (req.user.role !== "receptionist") {
      return forbiddenResponse(res, "Access denied", {
        help: "Only receptionists can update receptionist profiles.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const profileData = req.body

    // Find or create receptionist profile
    let receptionist = await Receptionist.findOne({ user: userId })
    if (!receptionist) {
      receptionist = new Receptionist({ user: userId })
    }

    // Update receptionist fields
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        ;(receptionist as any)[key] = profileData[key]
      }
    })

    // Handle date fields
    if (profileData.hireDate) {
      receptionist.hireDate = new Date(profileData.hireDate)
    }

    await receptionist.save()

    // Log the action
    await logAction(req, "update", "receptionist_profile", userId.toString(), {
      updatedFields: Object.keys(profileData),
    })

    return successResponse(
      res,
      {
        profile: receptionist,
      },
      "Receptionist profile updated successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/profile/receptionist",
          profile: "/api/profile",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update receptionist profile", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/** * Update admin profile */
export const updateAdminProfileController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to update your admin profile.",
        startTime: req.startTime,
      })
    }

    if (req.user.role !== "admin") {
      return forbiddenResponse(res, "Access denied", {
        help: "Only admins can update admin profiles.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const profileData = req.body

    // Find or create admin profile
    let admin = await Admin.findOne({ user: userId })
    if (!admin) {
      admin = new Admin({ user: userId })
    }

    // Update admin fields
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        ;(admin as any)[key] = profileData[key]
      }
    })

    // Handle date fields
    if (profileData.hireDate) {
      admin.hireDate = new Date(profileData.hireDate)
    }

    await admin.save()

    // Log the action
    await logAction(req, "update", "admin_profile", userId.toString(), {
      updatedFields: Object.keys(profileData),
    })

    return successResponse(
      res,
      {
        profile: admin,
      },
      "Admin profile updated successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/profile/admin",
          profile: "/api/profile",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to update admin profile", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})


/** * Upload user profile picture */
export const uploadProfilePictureController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to upload your profile picture.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    // Check if file is provided (handled by middleware)
    if (!req.file) {
      return validationErrorResponse(
        res,
        "No file uploaded",
        { file: "Profile picture is required" },
        {
          help: "Please upload a valid image file.",
          startTime: req.startTime,
        },
      )
    }

    // Delete old profile picture if exists
    if (user.picturePublicId) {
      await deleteImageFromCloudinary(user.picturePublicId)
    }

    // Save the new picture URL and public ID
    user.picture = req.file.path // Cloudinary URL
    user.picturePublicId = (req.file as any).filename // Cloudinary public ID

    await user.save()

    // Log the action
    await logAction(req, "upload_picture", "user", userId.toString(), {
      pictureUrl: user.picture,
      publicId: user.picturePublicId,
    })

    // Get optimized picture URL
    const optimizedPictureUrl = getOptimizedImageUrl(user.picturePublicId, {
      width: 400,
      height: 400,
      crop: "fill",
      quality: "auto",
    })

    return successResponse(
      res,
      {
        pictureUrl: optimizedPictureUrl,
        originalUrl: user.picture,
        publicId: user.picturePublicId,
        metadata: {
          size: req.file.size,
          mimetype: req.file.mimetype,
          originalName: req.file.originalname,
        },
      },
      "Profile picture uploaded successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/profile",
          picture: optimizedPictureUrl,
          profile: "/api/profile",
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to upload profile picture", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})

/** * Delete user profile picture */
export const deleteProfilePictureController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to delete your profile picture.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return notFoundResponse(res, "User not found", {
        help: "The user account may have been deleted.",
        startTime: req.startTime,
      })
    }

    if (!user.picturePublicId) {
      return badRequestResponse(
        res,
        "No profile picture to delete",
        {},
        {
          help: "User doesn't have a profile picture.",
          startTime: req.startTime,
        },
      )
    }

    // Delete from Cloudinary
    const deleted = await deleteImageFromCloudinary(user.picturePublicId)

    if (!deleted) {
      return databaseErrorResponse(res, "Failed to delete profile picture from storage", null, {
        startTime: req.startTime,
      })
    }

    // Remove from user record
    user.picture = undefined
    user.picturePublicId = undefined
    await user.save()

    // Log the action
    await logAction(req, "delete_picture", "user", userId.toString(), {})

    return successResponse(res, null, "Profile picture deleted successfully", {
      startTime: req.startTime,
      links: {
        self: "/api/profile",
        uploadPicture: "/api/profile/upload-picture",
      },
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to delete profile picture", error, {
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


/**
 * Set password for users who signed up with social providers
 */

export const setPasswordController = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to set your password.",
        startTime: req.startTime,
      })
    }

    const userId = req.user.userId
    const { newPassword } = req.body

    // Validate input
    if (!newPassword) {
      return validationErrorResponse(
        res,
        "Missing required fields",
        {
          required: ["newPassword"],
          provided: Object.keys(req.body),
        },
        {
          help: "Please provide a new password.",
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

    // Check if user already has a password
    if (user.password) {
      return badRequestResponse(res, "You already have a password set", null, {
        help: "You cannot set a password again. Please use the 'Change Password' feature instead.",
        startTime: req.startTime,
      })
    }

    // Set new password
    user.password = newPassword
    await user.save()

    // Log the action
    await logAction(req, "set_password", "user", userId.toString())

    return successResponse(res, null, "Password set successfully", {
      startTime: req.startTime,
    })
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to set password", error, {
      startTime: req.startTime,
      debug: error,
    })
  }
})  

