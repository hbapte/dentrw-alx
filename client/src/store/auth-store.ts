// client\src\store\auth-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import AuthService from "../services/auth.service"
import { AuthError, User } from "../types/auth"


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
  verifyEmail: (token: string) => Promise<any>
  resendVerification: (email: string) => Promise<any>
  forgotPassword: (email: string) => Promise<any>
  resetPassword: (token: string, newPassword: string) => Promise<any>
  setUser: (user: User) => void
  clearError: () => void
  clearAuth: () => void
}

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
          // Store the complete error object for better handling in UI
          set({
            error: err,
            loading: false,
            twoFactorRequired: false,
            tempToken: null,
          })
          throw err
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
          set({
            error: err,
            loading: false,
          })
          throw err
        }
      },

      
      verifyEmail: async (token: string) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.verifyEmail(token)
          set({ loading: false })
          return response
        } catch (err: any) {
          set({
            error: err,
            loading: false,
          })
          throw err
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.forgotPassword(email)
          set({ loading: false })
          return response
        } catch (err: any) {
          set({
            error: err,
            loading: false,
          })
          throw err
        }
      },  

      resetPassword: async (token: string, newPassword: string) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.resetPassword(token, newPassword)
          set({ loading: false })
          return response
        }
        catch (err: any) {
          set({
            error: err,
            loading: false,
          })
          throw err
        }
      },


       resendVerification: async (email: string) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.resendVerification(email)
          set({ loading: false })
          return response
        } catch (err: any) {
          set({
            error: err,
            loading: false,
          })
          throw err
        }
      },


      register: async (data) => {
        try {
          set({ loading: true, error: null })
          const response = await AuthService.register(data)
          set({ loading: false })
          return response
        } catch (err: any) {
          set({
            error: err,
            loading: false,
          })
          throw err
        }
      },

      logout: async () => {
        try {
          set({ loading: true })

          // Try to call the logout API, but don't worry if it fails
          try {
            await AuthService.logout()
          } catch (error) {
            console.warn("Logout API error:", error)
            // Continue with local logout even if API call fails
          }

          // Always clear local state
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
          // Still clear auth state even if there's an error
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
          // Don't attempt to refresh if we're not authenticated
          if (!get().isAuthenticated && !get().user) {
            console.log("Not attempting token refresh - no active session")
            return false
          }

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
