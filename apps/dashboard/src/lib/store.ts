/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { toast } from "sonner"
import {
  doctorFormSchema,
  type DoctorFormData,
  personalInfoSchema,
  professionalInfoSchema,
  practiceDetailsSchema,
  doctorWorkingHoursSchema,
  doctorDaysOffSchema,
} from "@/lib/validations/doctor"
import DoctorService from "@/services/doctor.service"
import UploadService from "@/services/upload.service"
import type { ZodError } from "zod"

export interface DoctorFormErrors {
  [key: string]: string
}

interface DoctorFormStore {
  currentStep: number
  formData: DoctorFormData
  errors: DoctorFormErrors
  isSubmitting: boolean
  uploadProgress: number

  // Actions
  setCurrentStep: (step: number) => void
  updateFormData: (data: Partial<DoctorFormData>) => void
  validateStep: (step: number) => boolean
  isStepValid: (step: number) => boolean
  validateField: (field: string, value: any) => string | null
  clearFieldError: (field: string) => void
  submitForm: () => Promise<void>
  resetForm: () => void
  uploadPicture: (file: File) => Promise<void>
}

const initialFormData: DoctorFormData = {
  // Personal Information
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "male",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  profilePicture: "",

  // Professional Information
  specializations: [],
  qualifications: [],
  experience: 0,
  licenseNumber: "",
  licenseExpiryDate: "",

  // Practice Details
  bio: "",
  languages: [],
  consultationFee: 0,
  followUpFee: 0,
  emergencyFee: 0,
  certifications: [],

  // Working Hours & Availability
  workingHours: [
    { day: "monday", isWorking: false, shifts: [] },
    { day: "tuesday", isWorking: false, shifts: [] },
    { day: "wednesday", isWorking: false, shifts: [] },
    { day: "thursday", isWorking: false, shifts: [] },
    { day: "friday", isWorking: false, shifts: [] },
    { day: "saturday", isWorking: false, shifts: [] },
    { day: "sunday", isWorking: false, shifts: [] },
  ],
  daysOff: [],

  // Services
  services: [],

  // Status
  isActive: true,
}

export const useDoctorFormStore = create<DoctorFormStore>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  uploadProgress: 0,

  setCurrentStep: (step) => set({ currentStep: step }),

  updateFormData: (data) => {
    set((state) => {
      const newFormData = { ...state.formData, ...data }
      const newErrors = { ...state.errors }

      // Clear errors for updated fields using Zod validation
      Object.keys(data).forEach((field) => {
        try {
          // Validate individual field using the full schema
          doctorFormSchema.pick({ [field]: true } as any).parse({ [field]: data[field] })
          delete newErrors[field]
        } catch (error) {
          if (error instanceof Error && "issues" in error) {
            const zodError = error as ZodError
            const fieldError = zodError.issues.find((issue) => issue.path[0] === field)
            if (fieldError) {
              newErrors[field] = fieldError.message
            }
          }
        }
      })

      return {
        formData: newFormData,
        errors: newErrors,
      }
    })
  },

  isStepValid: (step) => {
    const { formData } = get()
    let schema

    // Select appropriate schema based on step
    switch (step) {
      case 1: // Personal Info
        schema = personalInfoSchema
        break
      case 2: // Professional Info
        schema = professionalInfoSchema
        break
      case 3: // Practice Details
        schema = practiceDetailsSchema
        break
      case 4: // Working Hours
        schema = doctorWorkingHoursSchema
        break
      case 5: // Days Off
        schema = doctorDaysOffSchema
        break
      case 6: // Review - validate entire form
        schema = doctorFormSchema
        break
      default:
        return true
    }

    try {
      schema.parse(formData)
      return true
    } catch (error) {
      return false
    }
  },

  validateField: (field, value) => {
    try {
      // Validate individual field using the full schema
      doctorFormSchema.pick({ [field]: true } as any).parse({ [field]: value })
      return null
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError
        const fieldError = zodError.issues.find((issue) => issue.path[0] === field)
        return fieldError?.message || "Invalid value"
      }
      return "Invalid value"
    }
  },

  clearFieldError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors }
      delete newErrors[field]
      return { errors: newErrors }
    })
  },

  validateStep: (step) => {
    const { formData } = get()
    let schema
    let isValid = true
    const newErrors: DoctorFormErrors = {}

    // Select appropriate schema based on step
    switch (step) {
      case 1: // Personal Info
        schema = personalInfoSchema
        break
      case 2: // Professional Info
        schema = professionalInfoSchema
        break
      case 3: // Practice Details
        schema = practiceDetailsSchema
        break
      case 4: // Working Hours
        schema = doctorWorkingHoursSchema
        break
      case 5: // Days Off
        schema = doctorDaysOffSchema
        break
      case 6: // Review - validate entire form
        schema = doctorFormSchema
        break
      default:
        return true
    }

    try {
      schema.parse(formData)
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError
        zodError.issues.forEach((issue) => {
          const fieldPath = issue.path.join(".")
          newErrors[fieldPath] = issue.message
        })
        isValid = false
      }
    }

    set({ errors: newErrors })
    return isValid
  },

  submitForm: async () => {
    set({ isSubmitting: true })
    try {
      // Final validation
      const { formData } = get()
      const validatedData = doctorFormSchema.parse(formData)

      // Submit to API
      const createdDoctor = await DoctorService.createDoctor(validatedData)

      toast.success("Doctor profile created successfully!")
      console.log("Doctor created:", createdDoctor)

      get().resetForm()
    } catch (error) {
      console.error("Failed to create doctor:", error)

      if (error instanceof Error && "issues" in error) {
        // Handle Zod validation errors
        const zodError = error as ZodError
        const newErrors: DoctorFormErrors = {}
        zodError.issues.forEach((issue) => {
          const fieldPath = issue.path.join(".")
          newErrors[fieldPath] = issue.message
        })
        set({ errors: newErrors })
        toast.error("Please fix the validation errors and try again.")
      } else {
        // Handle API errors
        const errorMessage = error instanceof Error ? error.message : "Failed to create doctor profile"
        toast.error(errorMessage)
      }
    } finally {
      set({ isSubmitting: false })
    }
  },

  uploadPicture: async (file) => {
    set({ uploadProgress: 0 })
    try {
      const imageUrl = await UploadService.uploadPicture(file, (progress) => {
        set({ uploadProgress: progress })
      })

      set((state) => ({
        formData: { ...state.formData, profilePicture: imageUrl },
        uploadProgress: 100,
      }))

      toast.success("Profile picture uploaded successfully!")

      // Reset progress after a delay
      setTimeout(() => set({ uploadProgress: 0 }), 1000)
    } catch (error) {
      console.error("Upload failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      toast.error(errorMessage)
      set({ uploadProgress: 0 })
    }
  },

  resetForm: () =>
    set({
      currentStep: 1,
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      uploadProgress: 0,
    }),
}))
