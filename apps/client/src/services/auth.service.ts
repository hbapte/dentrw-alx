// client\src\services\auth.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthError, LoginData, RegisterData } from "../types/auth"
import api from "./api"

const authService = {
  login: async (data: LoginData) => {
    try {
      const response = await api.post("/auth/login", data)
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Login failed",
        }
        throw errorData
      }
    }
  },

  verifyTwoFactor: async (data: { tempToken: string; code: string }) => {
    try {
      const response = await api.post("/auth/verify-2fa", data)
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Two-factor verification failed",
        }
        throw errorData
      }
    }
  },

  register: async (data: RegisterData) => {
    console.log("register data", data)
    try {
      const response = await api.post("/auth/register", data)
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Registration failed",
        }
        throw errorData
      }
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Failed to fetch current user",
        }
        throw errorData
      }
    }
  },

  logout: async () => {
    try {
      // Don't catch errors here, just let the request go through
      const response = await api.post("/auth/logout")
      return response.data
    } catch (error: any) {
      // Even if the server returns an error, we want to clear local auth state
      console.warn("Logout API error:", error)
      // Return a success response anyway since we're clearing local state
      return {
        success: true,
        message: "Logged out locally",
      }
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh")
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Token refresh failed",
        }
        throw errorData
      }
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`)
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Email verification failed",
        }
        throw errorData
      }
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await api.post("/auth/resend-verification", { email })
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Failed to resend verification",
        }
        throw errorData
      }
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email })
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Forgot password request failed",
        }
        throw errorData
      }
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password })
      return response.data
    } catch (error: any) {
      // Handle standardized API error response format
      if (error.response?.data) {
        // Return the entire response data for more flexible error handling
        throw error.response.data
      } else {
        // Fallback for non-standard errors
        const errorData: AuthError = {
          status: error.response?.status,
          message: error.message || "Password reset failed",
        }
        throw errorData
      }
    }
  },
}

export default authService
