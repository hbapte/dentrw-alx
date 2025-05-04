/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AuthService from "../services/auth.service"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isEmailVerified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  googleLogin: (token: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const userData = await AuthService.getCurrentUser()
          setUser(userData)
        }
      } catch (err) {
        console.error("Authentication check failed:", err)
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await AuthService.login({ email, password })
      setUser(response.user)
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async (token: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await AuthService.googleLogin(token)
      setUser(response.user)
    } catch (err: any) {
      setError(err.response?.data?.message || "Google login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.register(data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await AuthService.logout()
      setUser(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed")
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.forgotPassword(email)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send password reset email")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.resetPassword(token, { password, confirmPassword })
    } catch (err: any) {
      setError(err.response?.data?.message || "Password reset failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        googleLogin,
        register,
        logout,
        forgotPassword,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
