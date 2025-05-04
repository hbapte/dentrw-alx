/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import AuthService from "../services/auth.service"

interface User {
  id: string
  names: string
  email: string
  username?: string
  role: string
  picture?: string
  preferredLanguage: string
  phoneNumber?: string
  phoneVerified?: boolean
  emailVerified: boolean
  totpEnabled?: boolean
  lastLogin?: Date
}

interface AuthError {
  status?: number
  message: string
  details?: string
  data?: {
    retryAfter?: number
    requiresTwoFactor?: boolean
    tempToken?: string
  }
}

interface AuthState {
  user: User | null
  loading: boolean
  error: AuthError | null
  isAuthenticated: boolean
  twoFactorRequired: boolean
  tempToken: string | null

  // Auth actions
  login: (email: string, password: string) => Promise<void>
  verifyTwoFactor: (tempToken: string, code: string) => Promise<void>
  googleLogin: (token: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>

  // Email verification
  verifyEmail: (token: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>

  // Password reset
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string,) => Promise<void>

  // 2FA management
  setupTwoFactor: () => Promise<{ secret: string; qrCodeUrl: string }>
  verifyAndEnableTwoFactor: (code: string) => Promise<void>
  disableTwoFactor: (password: string, code: string) => Promise<void>

  // Session management
  fetchSessions: () => Promise<any[]>
  revokeSession: (sessionId: string) => Promise<void>
  revokeAllSessions: () => Promise<void>

  // Utility functions
  clearError: () => void
  setUser: (user: User) => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      twoFactorRequired: false,
      tempToken: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      checkAuth: async () => {
        try {
          // If we already have a user, we're authenticated
          if (get().user) {
            return true
          }

          // Try to get the current user from the server
          const response = await AuthService.getCurrentUser()
          if (response.data?.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
            })
            return true
          }
          return false
        } catch (error) {
          console.error("Authentication check failed:", error)
          // If we get an error, we're not authenticated
          set({
            user: null,
            isAuthenticated: false,
          })
          return false
        }
      },

      refreshToken: async () => {
        try {
          set({ loading: true })
          const response = await AuthService.refreshToken()

          if (response.data?.user) {
            set({
              user: response.data.user,
              loading: false,
              isAuthenticated: true,
            })
          } else {
            set({ loading: false })
          }

          return true
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
          const response = await AuthService.verifyTwoFactor(tempToken, code)

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
            message: err.message || "2FA verification failed",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      googleLogin: async (token) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.googleLogin(token)

          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Google login failed",
            details: err.details,
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
          await AuthService.register(data)
          set({ loading: false, error: null })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Registration failed",
            details: err.details,
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
        } catch (err: any) {
          console.error("Logout error:", err)

          // Still clear auth state even if logout API fails
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            twoFactorRequired: false,
            tempToken: null,
          })
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ loading: true, error: null })
          await AuthService.forgotPassword(email)
          set({ loading: false, error: null })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to send password reset email",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      resetPassword: async (token, password: string) => {
        try {
          set({ loading: true, error: null })
          await AuthService.resetPassword(token, password )
          set({ loading: false, error: null })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Password reset failed",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      setupTwoFactor: async () => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.setupTwoFactor()
          set({ loading: false, error: null })
          return response.data
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to setup 2FA",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      verifyAndEnableTwoFactor: async (code) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.verifyAndEnableTwoFactor(code)

          // Update user with 2FA enabled
          const user = get().user
          if (user) {
            set({
              user: { ...user, totpEnabled: true },
              loading: false,
              error: null,
            })
          } else {
            set({ loading: false, error: null })
          }

          return response.data
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to verify 2FA code",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      disableTwoFactor: async (password, code) => {
        try {
          set({ loading: true, error: null })
          await AuthService.disableTwoFactor(password, code)

          // Update user with 2FA disabled
          const user = get().user
          if (user) {
            set({
              user: { ...user, totpEnabled: false },
              loading: false,
              error: null,
            })
          } else {
            set({ loading: false, error: null })
          }
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to disable 2FA",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      fetchSessions: async () => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.getSessions()
          set({ loading: false, error: null })
          return response.data.sessions
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to fetch sessions",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      revokeSession: async (sessionId) => {
        try {
          set({ loading: true, error: null })
          await AuthService.revokeSession(sessionId)
          set({ loading: false, error: null })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to revoke session",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      revokeAllSessions: async () => {
        try {
          set({ loading: true, error: null })
          await AuthService.revokeAllSessions()
          set({ loading: false, error: null })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Failed to revoke all sessions",
            details: err.details,
          }

          set({
            error: errorData,
            loading: false,
          })
          throw errorData
        }
      },

      verifyEmail: async (token: string) => {
        try {
          set({ loading: true, error: null })
          await AuthService.verifyEmail(token)
          set({ loading: false })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Email verification failed",
            details: err.details
          }

          set({
            error: errorData,
            loading: false
          })
          throw errorData
        }
      },

      resendVerification: async (email: string) => {
        try {
          set({ loading: true, error: null })
          await AuthService.resendVerification(email)
          set({ loading: false })
        } catch (err: any) {
          const errorData: AuthError = {
            status: err.status,
            message: err.message || "Resending verification email failed",
            details: err.details
          }

          set({
            error: errorData,
            loading: false
          })
          throw errorData
        }
      },

      clearError: () => set({ error: null }),
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
