import type { Request, Response } from "express"
import httpStatus from "http-status"
import User from "../../../database/models/user"
import Patient from "../../../database/models/patient"
import Doctor from "../../../database/models/doctor"
import { logAction } from "../../../utils/auditLogUtil"

// Get user profile
export const getUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id

    // Get user data
    const user = await User.findById(userId).select(
      "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires -totpSecret",
    )

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      })
    }

    // Get profile data based on role
    let profileData = null

    if (user.role === "patient") {
      profileData = await Patient.findOne({ user: userId })
    } else if (user.role === "doctor") {
      profileData = await Doctor.findOne({ user: userId })
    }

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: {
        user,
        profile: profileData,
      },
    })
  } catch (error) {
    console.error("Error getting user profile:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Update user profile
export const updateUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id
    const { names, username, phoneNumber, preferredLanguage } = req.body

    // Update user data
    const user = await User.findById(userId)

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      })
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })

      if (existingUser) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: httpStatus.BAD_REQUEST,
          message: "Username is already taken",
          data: null,
        })
      }

      user.username = username
    }

    if (names) user.names = names
    if (phoneNumber) user.phoneNumber = phoneNumber
    if (preferredLanguage) user.preferredLanguage = preferredLanguage

    await user.save()

    // Log the action
    await logAction(req, "update", "user", userId.toString(), {
      updatedFields: { names, username, phoneNumber, preferredLanguage },
    })

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Profile updated successfully",
      data: {
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
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Update patient profile
export const updatePatientProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id

    // Check if user is a patient
    const user = await User.findById(userId)

    if (!user || user.role !== "patient") {
      return res.status(httpStatus.FORBIDDEN).json({
        status: httpStatus.FORBIDDEN,
        message: "Access denied. User is not a patient.",
        data: null,
      })
    }

    // Get patient profile
    let patient = await Patient.findOne({ user: userId })

    if (!patient) {
      // Create patient profile if it doesn't exist
      patient = new Patient({ user: userId })
    }

    // Update patient data
    const { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo } = req.body

    if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth)
    if (gender) patient.gender = gender

    if (address) {
      patient.address = {
        ...patient.address,
        ...address,
      }
    }

    if (emergencyContact) {
      patient.emergencyContact = {
        ...patient.emergencyContact,
        ...emergencyContact,
      }
    }

    if (medicalHistory) {
      patient.medicalHistory = {
        ...patient.medicalHistory,
        ...medicalHistory,
      }
    }

    if (insuranceInfo) {
      patient.insuranceInfo = {
        ...patient.insuranceInfo,
        ...insuranceInfo,
      }
    }

    await patient.save()

    // Log the action
    await logAction(req, "update", "patient", patient._id.toString(), {
      updatedFields: { dateOfBirth, gender, address, emergencyContact, medicalHistory, insuranceInfo },
    })

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Patient profile updated successfully",
      data: {
        profile: patient,
      },
    })
  } catch (error) {
    console.error("Error updating patient profile:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Update doctor profile
export const updateDoctorProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id

    // Check if user is a doctor
    const user = await User.findById(userId)

    if (!user || user.role !== "doctor") {
      return res.status(httpStatus.FORBIDDEN).json({
        status: httpStatus.FORBIDDEN,
        message: "Access denied. User is not a doctor.",
        data: null,
      })
    }

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: userId })

    if (!doctor) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "Doctor profile not found",
        data: null,
      })
    }

    // Update doctor data
    const { specialization, qualifications, experience, bio, languages, consultationFee, availability } = req.body

    if (specialization) doctor.specialization = specialization
    if (qualifications) doctor.qualifications = qualifications
    if (experience) doctor.experience = experience
    if (bio) doctor.bio = bio
    if (languages) doctor.languages = languages
    if (consultationFee) doctor.consultationFee = consultationFee
    if (availability) doctor.availability = availability

    await doctor.save()

    // Log the action
    await logAction(req, "update", "doctor", doctor._id.toString(), {
      updatedFields: { specialization, qualifications, experience, bio, languages, consultationFee, availability },
    })

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Doctor profile updated successfully",
      data: {
        profile: doctor,
      },
    })
  } catch (error) {
    console.error("Error updating doctor profile:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

// Change password
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id
    const { currentPassword, newPassword } = req.body

    // Get user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      })
    }

    // Check if user has a password (might be using OAuth)
    if (!user.password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: 'You do not have a password set. Please use the "Set Password" feature instead.',
        data: null,
      })
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)

    if (!isPasswordValid) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: "Current password is incorrect",
        data: null,
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    // Log the action
    await logAction(req, "change_password", "user", userId.toString())

    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Password changed successfully",
      data: null,
    })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: null,
    })
  }
}

