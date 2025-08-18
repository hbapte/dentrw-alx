// client\src\store\profile-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import profileService from "../services/profile.service"
import type {
  DoctorProfileData,
  PasswordData,
  PatientProfileData,
  SetPasswordData,
  UserProfileData,
  AdminProfileData,
  ReceptionistProfileData,
  // ProfileUpdateRequest,
} from "../types/profile.types"
import { toast } from "sonner"

interface ProfileState {
  user: any | null
  profile: any | null
  loading: boolean
  uploadProgress: number
  error: any | null
  success: string | null
  patientProfile: PatientProfileData | null
  doctorProfile: DoctorProfileData | null
  adminProfile: AdminProfileData | null
  receptionistProfile: ReceptionistProfileData | null
  // Actions
  getUserProfile: () => Promise<void>
  updateUserProfile: (data: UserProfileData) => Promise<void>
  updatePatientProfile: (data: PatientProfileData) => Promise<void>
  updateDoctorProfile: (data: DoctorProfileData) => Promise<void>
  updateAdminProfile: (data: AdminProfileData) => Promise<void>
  updateReceptionistProfile: (data: ReceptionistProfileData) => Promise<void>
  changePassword: (data: PasswordData) => Promise<void>
  setPassword: (data: SetPasswordData) => Promise<void>
  uploadProfilePicture: (file: File) => Promise<void>
  deleteProfilePicture: () => Promise<void>
  clearError: () => void
  clearSuccess: () => void
  setUploadProgress: (progress: number) => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  uploadProgress: 0,
  error: null,
  success: null,
  patientProfile: null,
  doctorProfile: null,
  adminProfile: null,
  receptionistProfile: null,
  

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
      toast.error(error.message || "Failed to fetch profile")
    }
  },

  
      fetchProfile: async () => {
        set({ loading: true, error: null })
        try {
          const response = await profileService.getUserProfile()
          set({
            user: response.user,
            patientProfile: response.patientProfile || null,
            doctorProfile: response.doctorProfile || null,
            adminProfile: response.adminProfile || null,
            receptionistProfile: response.receptionistProfile || null,
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch profile",
            loading: false,
          })
        }
      },

  updateUserProfile: async (data: UserProfileData) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Updating profile...")
      
      const response = await profileService.updateUserProfile(data)

      if (response.success) {
        set({
          user: response.data.user,
          loading: false,
          success: "Profile updated successfully",
        })
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast)
        toast.success("Profile updated successfully")
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
      
      // Dismiss loading toast and show error
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to update profile")
    }
  },

  updatePatientProfile: async (data: PatientProfileData) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Updating patient profile...")
      
      const response = await profileService.updatePatientProfile(data)

      if (response.success) {
        set({
          profile: response.data.profile,
          loading: false,
          success: "Patient profile updated successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Patient profile updated successfully")
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
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to update patient profile")
    }
  },

  updateDoctorProfile: async (data: DoctorProfileData) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Updating doctor profile...")
      
      const response = await profileService.updateDoctorProfile(data)

      if (response.success) {
        set({
          profile: response.data.profile,
          loading: false,
          success: "Doctor profile updated successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Doctor profile updated successfully")
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
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to update doctor profile")
    }
  },

  updateAdminProfile: async (data: AdminProfileData) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Updating admin profile...")
      
      const response = await profileService.updateAdminProfile(data)

      if (response.success) {
        set({
          profile: response.data.profile,
          loading: false,
          success: "Admin profile updated successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Admin profile updated successfully")
      } else {
        throw new Error(response.error?.message || "Failed to update admin profile")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to update admin profile",
          details: error.details,
        },
        loading: false,
      })
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to update admin profile")
    }
  },

  updateReceptionistProfile: async (data: ReceptionistProfileData) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Updating receptionist profile...")
      
      const response = await profileService.updateReceptionistProfile(data)

      if (response.success) {
        set({
          profile: response.data.profile,
          loading: false,
          success: "Receptionist profile updated successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Receptionist profile updated successfully")
      } else {
        throw new Error(response.error?.message || "Failed to update receptionist profile")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to update receptionist profile",
          details: error.details,
        },
        loading: false,
      })
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to update receptionist profile")
    }
  },
  

  changePassword: async (data: PasswordData) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Changing password...")
      
      const response = await profileService.changePassword(data)

      if (response.success) {
        set({
          loading: false,
          success: "Password changed successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Password changed successfully")
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
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to change password")
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
        toast.success("Password set successfully")
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
      toast.error(error.message || "Failed to set password")
    }
  },

  uploadProfilePicture: async (file: File) => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null, uploadProgress: 0 })
      loadingToast = toast.loading("Uploading profile picture...")
      
      const response = await profileService.uploadProfilePicture(file, (progress) => {
        set({ uploadProgress: progress })
      })

      if (response.success) {
        // Update user with new picture URL
        const currentUser = get().user
        set({
          user: {
            ...currentUser,
            picture: response.data.pictureUrl,
            picturePublicId: response.data.publicId,
          },
          loading: false,
          uploadProgress: 100,
          success: "Profile picture uploaded successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Profile picture uploaded successfully")

        // Reset progress after a short delay
        setTimeout(() => {
          set({ uploadProgress: 0 })
        }, 1000)
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
        uploadProgress: 0,
      })
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to upload profile picture")
    }
  },

  deleteProfilePicture: async () => {
    let loadingToast: string | undefined
    
    try {
      set({ loading: true, error: null, success: null })
      loadingToast = toast.loading("Deleting profile picture...")

      const response = await profileService.deleteProfilePicture()

      if (response.success) {
        // Update user to remove picture
        const currentUser = get().user
        set({
          user: {
            ...currentUser,
            picture: null,
            picturePublicId: null,
          },
          loading: false,
          success: "Profile picture deleted successfully",
        })
        
        toast.dismiss(loadingToast)
        toast.success("Profile picture deleted successfully")
      } else {
        throw new Error(response.error?.message || "Failed to delete profile picture")
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || "Failed to delete profile picture",
          details: error.details,
        },
        loading: false,
      })
      
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to delete profile picture")
    }
  },

  setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
  clearError: () => set({ error: null }),

  clearSuccess: () => set({ success: null }),
}))