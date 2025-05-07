/* eslint-disable @typescript-eslint/no-explicit-any */
import { DoctorProfileData, PasswordData, PatientProfileData, ProfileError, SetPasswordData, UserProfileData } from "../types/profile.types"
import api from "./api"


const profileService = {
  getUserProfile: async () => {
    try {
      const response = await api.get("/profile")
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to fetch profile",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  updateUserProfile: async (data: UserProfileData) => {
    try {
      const response = await api.put("/profile", data)
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to update profile",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  updatePatientProfile: async (data: PatientProfileData) => {
    try {
      const response = await api.put("/profile/patient", data)
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to update patient profile",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  updateDoctorProfile: async (data: DoctorProfileData) => {
    try {
      const response = await api.put("/profile/doctor", data)
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to update doctor profile",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  changePassword: async (data: PasswordData) => {
    try {
      const response = await api.post("/profile/change-password", data)
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to change password",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  setPassword: async (data: SetPasswordData) => {
    try {
      const response = await api.post("/profile/set-password", data)
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to set password",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  uploadProfilePicture: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("profilePicture", file)

      const response = await api.post("/profile/upload-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      const errorData: ProfileError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to upload profile picture",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },
}

export default profileService
