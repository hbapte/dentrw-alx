/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"

export interface RegisterData {
  names: string
  email: string
  username?: string
  password: string
  confirmPassword: string
  phoneNumber?: string
  preferredLanguage?: string
}

export interface LoginData {
  email: string
  password: string
}


export interface AuthError {
  status?: number
  message: string
  details?: string
  data?: {
    retryAfter?: number
    requiresTwoFactor?: boolean
    tempToken?: string
  }
}

const AuthService = {
  register: async (data: RegisterData) => {
    try {
      const response = await api.post("/auth/register", data)
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Registration failed",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  login: async (data: LoginData) => {
    try {
      const response = await api.post("/auth/login", data)

      // Check if 2FA is required
      if (response.data.data?.requiresTwoFactor) {
        return {
          data: {
            requiresTwoFactor: true,
            tempToken: response.data.data.tempToken,
            userId: response.data.data.userId,
          },
        }
      }

      // Return the response - no need to manually store token in localStorage
      // as the backend will set HTTP-only cookies
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Login failed",
        details: error.response?.data?.details,
        data: error.response?.data?.data,
      }
      throw errorData
    }
  },

  verifyTwoFactor: async (tempToken: string, code: string) => {
    try {
      const response = await api.post("/auth/verify-2fa", { tempToken, code })
      // No need to manually store token in localStorage
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "2FA verification failed",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  googleLogin: async (token: string) => {
    try {
      const response = await api.post("/auth/google-login", { token })
      // No need to manually store token in localStorage
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Google login failed",
        details: error.response?.data?.details,
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
        message: error.response?.data?.message || "Token refresh failed",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout")
      // No need to remove from localStorage
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Logout failed",
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
        message: error.response?.data?.message || "Failed to get user data",
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
        message: error.response?.data?.message || "Email verification failed",
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
        message: error.response?.data?.message || "Failed to resend verification",
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
        message: error.response?.data?.message || "Failed to send password reset email",
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
        message: error.response?.data?.message || "Password reset failed",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  // 2FA Management
  setupTwoFactor: async () => {
    try {
      const response = await api.post("/auth/2fa/setup")
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Failed to setup 2FA",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  verifyAndEnableTwoFactor: async (code: string) => {
    try {
      const response = await api.post("/auth/2fa/verify", { token: code })
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Failed to verify 2FA code",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  disableTwoFactor: async (password: string, code: string) => {
    try {
      const response = await api.post("/auth/2fa/disable", { password, token: code })
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Failed to disable 2FA",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  // Session Management
  getSessions: async () => {
    try {
      const response = await api.get("/auth/sessions")
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Failed to get sessions",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  revokeSession: async (sessionId: string) => {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`)
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Failed to revoke session",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },

  revokeAllSessions: async () => {
    try {
      const response = await api.delete("/auth/sessions")
      return response.data
    } catch (error: any) {
      const errorData: AuthError = {
        status: error.response?.status,
        message: error.response?.data?.message || "Failed to revoke all sessions",
        details: error.response?.data?.details,
      }
      throw errorData
    }
  },
}

export default AuthService
