// client/src/store/register-form-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { z } from "zod/v3"
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core"
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en"
import { debounce } from "../lib/utils" // Assuming this is available
import api from "../services/api" // Assuming your API service is here

// Zod Schemas
const personalInfoSchema = z.object({
  names: z
    .string()
    .trim()
    .min(3, "Name is required and must be at least 3 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username must only contain alphanumeric characters")
    .optional() // Make optional if it's truly optional in the form
    .or(z.literal("")), // Allow empty string if optional
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Please provide a valid phone number"),
})

const securitySchema = z
  .object({
    password: z
      .string()
      .min(8, "Password is required and must be at least 8 characters")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const preferencesSchema = z.object({
  preferredLanguage: z.enum(["en", "fr", "rw"], {
    errorMap: () => ({ message: "Please select a preferred language" }),
  }),
})

// Combined schema for full form validation
const fullRegisterSchema = personalInfoSchema.and(securitySchema).and(preferencesSchema)

export type RegisterFormData = z.infer<typeof fullRegisterSchema>

interface UsernameAvailabilityState {
  isChecking: boolean
  isAvailable: boolean | null
  message: string
}

interface RegisterFormStore {
  formData: RegisterFormData
  currentStep: number
  formErrors: Record<string, string>
  usernameAvailability: UsernameAvailabilityState
  passwordStrength: number
  passwordFeedback: string

  updateFormData: (data: Partial<RegisterFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void

  // Validation actions
  validateStep: (step: number) => Record<string, string> // Returns errors, doesn't set state
  validateForm: () => Record<string, string> // Returns all errors, doesn't set state
  setFormErrors: (errors: Record<string, string>) => void // Explicitly sets form errors

  // Username check
  checkUsernameAvailability: (username: string) => Promise<void>

  // Password strength
  setPasswordStrengthAndFeedback: (password: string) => void

  // Derived state for step validity
  isStepValid: (step: number) => boolean
  getStepErrors: (step: number) => string[]
}

const initialFormData: RegisterFormData = {
  names: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  preferredLanguage: "en",
  phoneNumber: "",
}

// Initialize zxcvbn password strength estimator
const zxcvbnOptionsConfig = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
}
zxcvbnOptions.setOptions(zxcvbnOptionsConfig)

export const useRegisterFormStore = create<RegisterFormStore>()(
  devtools(
    persist(
      (set, get) => ({
        formData: initialFormData,
        currentStep: 1,
        formErrors: {},
        usernameAvailability: {
          isChecking: false,
          isAvailable: null,
          message: "",
        },
        passwordStrength: 0,
        passwordFeedback: "",

        updateFormData: (data) => {
          set((state) => ({
            formData: { ...state.formData, ...data },
          }))
        },
        setCurrentStep: (step) => set({ currentStep: step }),
        resetForm: () =>
          set({
            formData: initialFormData,
            currentStep: 1,
            formErrors: {},
            usernameAvailability: { isChecking: false, isAvailable: null, message: "" },
            passwordStrength: 0,
            passwordFeedback: "",
          }),
        setFormErrors: (errors) => set({ formErrors: errors }),

        validateStep: (step) => {
          const { formData } = get()
          let schema: z.ZodSchema<any>
          let dataToValidate: Partial<RegisterFormData>

          switch (step) {
            case 1:
              schema = personalInfoSchema
              dataToValidate = {
                names: formData.names,
                email: formData.email,
                username: formData.username,
                phoneNumber: formData.phoneNumber,
              }
              break
            case 2:
              schema = securitySchema
              dataToValidate = {
                password: formData.password,
                confirmPassword: formData.confirmPassword,
              }
              break
            case 3:
              schema = preferencesSchema
              dataToValidate = {
                preferredLanguage: formData.preferredLanguage,
              }
              break
            default:
              return {}
          }

          const result = schema.safeParse(dataToValidate)
          if (result.success) {
            return {}
          } else {
            const errors: Record<string, string> = {}
            result.error.errors.forEach((err) => {
              if (err.path.length > 0) {
                errors[err.path[0]] = err.message
              }
            })
            return errors
          }
        },

        validateForm: () => {
          const { formData } = get()
          const result = fullRegisterSchema.safeParse(formData)
          if (result.success) {
            return {}
          } else {
            const errors: Record<string, string> = {}
            result.error.errors.forEach((err) => {
              if (err.path.length > 0) {
                errors[err.path[0]] = err.message
              }
            })
            return errors
          }
        },

        checkUsernameAvailability: debounce(
          async (username: string): Promise<void> => {
            if (!username || username.length < 3) {
              set({
                usernameAvailability: {
                  isChecking: false,
                  isAvailable: null,
                  message: "",
                },
              })
              return
            }

            set((state) => ({
              usernameAvailability: {
                ...state.usernameAvailability,
                isChecking: true,
              },
            }))

            try {
              const response = await api.get(`/auth/checkUsername/${username}`)
              const data = response.data

              if (data.success) {
                set((state) => ({
                  usernameAvailability: {
                    isChecking: false,
                    isAvailable: true,
                    message: "Username is available",
                  },
                  formErrors: { ...state.formErrors, username: "" }, // Clear username error
                }))
              } else {
                set((state) => ({
                  usernameAvailability: {
                    isChecking: false,
                    isAvailable: false,
                    message: data.error?.message || "Username is not available",
                  },
                  formErrors: { ...state.formErrors, username: data.error?.message || "Username is not available" },
                }))
              }
            } catch (error: any) {
              console.error("Error checking username:", error)
              set((state) => ({
                usernameAvailability: {
                  isChecking: false,
                  isAvailable: null,
                  message: "Error checking username",
                },
                formErrors: {
                  ...state.formErrors,
                  username: error.response?.data?.error?.message || "Error checking username",
                },
              }))
            }
          },
          500
        ),

        setPasswordStrengthAndFeedback: (password: string) => {
          const result = zxcvbn(password)
          set({
            passwordStrength: result.score,
            passwordFeedback: result.feedback.warning || result.feedback.suggestions[0] || "",
          })
        },

        // Derived state for step validity
        isStepValid: (step) => {
          const errors = get().validateStep(step)
          return Object.keys(errors).length === 0
        },

        getStepErrors: (step) => {
          const errors = get().validateStep(step)
          return Object.values(errors)
        },
      }),
      {
        name: "register-form-storage",
        partialize: (state) => ({
          formData: state.formData,
          currentStep: state.currentStep,
        }),
      },
    ),
    { name: "register-form-store" },
  ),
)
