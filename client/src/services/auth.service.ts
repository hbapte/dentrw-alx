/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"

export interface LoginData {
  email?: string
  password?: string
  userId?: string
  token?: string
  twoFactorCode?: string
  tempToken?: string
  rememberMe?: boolean
}

export interface RegisterData {
  names: string
  email: string
  password: string
  confirmPassword?: string
  username?: string
  phoneNumber?: string
  preferredLanguage?: string
}

export interface AuthError {
  status?: number
  message: string
  details?: any
  data?: any
}

const authService = {
  login: async (data: LoginData) => {
    try {
      const response = await api.post("/auth/login", data)
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Login failed",
        details: error.response?.data?.error?.details,
        data: error.response?.data?.error?.data,
      }
      throw errorData
    }
  },

  verifyTwoFactor: async (data: { tempToken: string; code: string }) => {
    try {
      const response = await api.post("/auth/verify-2fa", data)
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Two-factor verification failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await api.post("/auth/register", data)
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Registration failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to fetch current user",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout")
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Logout failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh")
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Token refresh failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`)
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Email verification failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await api.post("/auth/resend-verification", { email })
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to resend verification",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email })
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Forgot password request failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password })
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Password reset failed",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },
}

export default authService
