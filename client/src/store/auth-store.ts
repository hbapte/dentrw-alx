/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import AuthService from "../services/auth.service"
import { persist } from "zustand/middleware"

interface User {
  id: string
  names: string
  email: string
  username?: string
  role: string
  picture?: string
  preferredLanguage?: string
  phoneNumber?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  totpEnabled?: boolean
  lastLogin?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: AuthError | null
  twoFactorRequired: boolean
  tempToken: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  verifyTwoFactor: (tempToken: string, code: string) => Promise<any>
  register: (data: any) => Promise<any>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  refreshToken: () => Promise<boolean>
  setUser: (user: User) => void
  clearError: () => void
  clearAuth: () => void
}

interface AuthError {
  status: number | undefined
  message: string
  details?: any
  data?: any
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      twoFactorRequired: false,
      tempToken: null,

      login: async (email, password) => {
        try {
          set({ loading: true, error: null, twoFactorRequired: false, tempToken: null })
          const response = await AuthService.login({ email, password })

          // Check if 2FA is required
          if (response.data?.requiresTwoFactor) {
            set({
              loading: false,
              twoFactorRequired: true,
              tempToken: response.data.tempToken,
              error: null,
            })
            return
          }

          // Normal login success
          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
            twoFactorRequired: false,
            tempToken: null,
            error: null,
          })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Login failed",
            details: err.details,
            data: err.data,
          }

          set({
            error: errorData,
            loading: false,
            twoFactorRequired: false,
            tempToken: null,
          })
          throw errorData
        }
      },

      verifyTwoFactor: async (tempToken, code) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.verifyTwoFactor({ tempToken, code })

          if (response.success && response.data?.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              loading: false,
              twoFactorRequired: false,
              tempToken: null,
              error: null,
            })
            return response
          } else {
            throw new Error("Verification failed")
          }
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Two-factor verification failed",
            details: err.details,
            data: err.data,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      register: async (data) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.register(data)
          set({ loading: false })
          return response
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Registration failed",
            details: err.details,
            data: err.data,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      logout: async () => {
        try {
          set({ loading: true })
          await AuthService.logout()
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            twoFactorRequired: false,
            tempToken: null,
            error: null,
          })
        } catch (error) {
          console.error("Logout error:", error)
          // Still clear auth state even if the API call fails
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            twoFactorRequired: false,
            tempToken: null,
          })
        }
      },

      checkAuth: async () => {
        try {
          // If we already have a user, we're authenticated
          if (get().user && get().isAuthenticated) {
            return true
          }

          set({ loading: true })
          // Try to get the current user from the server
          const response = await AuthService.getCurrentUser()

          if (response.success && response.data?.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              loading: false,
            })
            return true
          }

          set({ loading: false })
          return false
        } catch (error) {
          console.error("Authentication check failed:", error)
          // If we get an error, we're not authenticated
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          })
          return false
        }
      },

      refreshToken: async () => {
        try {
          set({ loading: true })
          const response = await AuthService.refreshToken()

          if (response.success && response.data?.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              loading: false,
            })
            return true
          }

          set({ loading: false })
          return false
        } catch (error) {
          console.error("Token refresh failed:", error)
          // Clear auth state on refresh failure
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          })
          return false
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true })
      },

      clearError: () => {
        set({ error: null })
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          twoFactorRequired: false,
          tempToken: null,
          error: null,
        })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
