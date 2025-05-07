/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import profileService from "../services/profile.service"
import { DoctorProfileData, PasswordData, PatientProfileData, SetPasswordData, UserProfileData } from "../types/profile.types"

interface ProfileState {
  user: any | null
  profile: any | null
  loading: boolean
  error: any | null
  success: string | null

  // Actions
  getUserProfile: () => Promise<void>
  updateUserProfile: (data: UserProfileData) => Promise<void>
  updatePatientProfile: (data: PatientProfileData) => Promise<void>
  updateDoctorProfile: (data: DoctorProfileData) => Promise<void>
  changePassword: (data: PasswordData) => Promise<void>
  setPassword: (data: SetPasswordData) => Promise<void>
  uploadProfilePicture: (file: File) => Promise<void>
  clearError: () => void
  clearSuccess: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  success: null,

  getUserProfile: async () => {
    try {
      set({ loading: true, error: null })
      const response = await profileService.getUserProfile()
      
      if (response.success) {
        set({
          user: response.data.user,
          profile: response.data.profile,
          loading: false,
        })
      } else {
        throw new Error(response.error?.message || "Failed to fetch profile")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to fetch profile",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  updateUserProfile: async (data: UserProfileData) => {
    try {
      set({ loading: true, error: null, success: null })
      const response = await profileService.updateUserProfile(data)
      
      if (response.success) {
        set({
          user: response.data.user,
          loading: false,
          success: "Profile updated successfully",
        })
      } else {
        throw new Error(response.error?.message || "Failed to update profile")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to update profile",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  updatePatientProfile: async (data: PatientProfileData) => {
    try {
      set({ loading: true, error: null, success: null })
      const response = await profileService.updatePatientProfile(data)
      
      if (response.success) {
        set({
          profile: response.data.profile,
          loading: false,
          success: "Patient profile updated successfully",
        })
      } else {
        throw new Error(response.error?.message || "Failed to update patient profile")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to update patient profile",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  updateDoctorProfile: async (data: DoctorProfileData) => {
    try {
      set({ loading: true, error: null, success: null })
      const response = await profileService.updateDoctorProfile(data)
      
      if (response.success) {
        set({
          profile: response.data.profile,
          loading: false,
          success: "Doctor profile updated successfully",
        })
      } else {
        throw new Error(response.error?.message || "Failed to update doctor profile")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to update doctor profile",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  changePassword: async (data: PasswordData) => {
    try {
      set({ loading: true, error: null, success: null })
      const response = await profileService.changePassword(data)
      
      if (response.success) {
        set({
          loading: false,
          success: "Password changed successfully",
        })
      } else {
        throw new Error(response.error?.message || "Failed to change password")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to change password",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  setPassword: async (data: SetPasswordData) => {
    try {
      set({ loading: true, error: null, success: null })
      const response = await profileService.setPassword(data)
      
      if (response.success) {
        set({
          loading: false,
          success: "Password set successfully",
        })
      } else {
        throw new Error(response.error?.message || "Failed to set password")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to set password",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  uploadProfilePicture: async (file: File) => {
    try {
      set({ loading: true, error: null, success: null })
      const response = await profileService.uploadProfilePicture(file)
      
      if (response.success) {
        set({
          user: {
            ...response.data.user,
          },
          loading: false,
          success: "Profile picture uploaded successfully",
        })
      } else {
        throw new Error(response.error?.message || "Failed to upload profile picture")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to upload profile picture",
          details: error.details,
        },
        loading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),
}))
