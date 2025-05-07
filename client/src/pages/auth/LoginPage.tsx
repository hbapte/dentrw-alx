/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity, Clock } from "lucide-react"
import LoginForm from "../../components/auth/LoginForm"
import TwoFactorForm from "../../components/auth/TwoFactorForm"

const LoginPage: React.FC = () => {
  const [formError, setFormError] = useState("")
  const [retryTimeText, setRetryTimeText] = useState<string | null>(null)
  const [twoFactorError, setTwoFactorError] = useState("")

  const { login, verifyTwoFactor, loading, error, clearError, twoFactorRequired, tempToken, isAuthenticated } =
    useAuthStore()

  const { showWarning, showSuccess } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard"

  // Format retry time for rate limiting
  const formatRetryTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // Handle rate limiting countdown
  useEffect(() => {
    let timerId: number | undefined

    if (error?.status === 429 && error?.data?.retryAfter) {
      let secondsLeft = error.data.retryAfter

      setRetryTimeText(formatRetryTime(secondsLeft))

      timerId = window.setInterval(() => {
        secondsLeft -= 1
        if (secondsLeft <= 0) {
          clearInterval(timerId)
          setRetryTimeText(null)
          clearError()
        } else {
          setRetryTimeText(formatRetryTime(secondsLeft))
        }
      }, 1000)
    }

    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [error, clearError])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      showSuccess("Login successful")
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from, showSuccess])

  // Handle login form submission
  const handleLogin = async (email: string, password: string, ) => {
    clearError()
    setFormError("")

    try {
      await login(email, password)
      // If 2FA is required, the UI will update based on twoFactorRequired state
      // Otherwise, we'll be redirected in the useEffect above
    } catch (err: any) {
      // Handle different error types
      if (err.status === 429) {
        showWarning(
          `Too many login attempts. Please try again in ${formatRetryTime(err.data?.retryAfter || 900)} minutes.`,
        )
      } else if (err.status === 401) {
        setFormError("Invalid email or password")
      } else if (err.details) {
        setFormError(err.details)
      } else {
        setFormError(err.message || "Login failed")
      }
      console.error("Login error:", err)
    }
  }

  // Handle 2FA verification
  const handleTwoFactorVerify = async (code: string) => {
    clearError()
    setTwoFactorError("")

    try {
      if (!tempToken) {
        setTwoFactorError("Authentication session expired. Please login again.")
        return
      }

      await verifyTwoFactor(tempToken, code)
      showSuccess("Authentication successful")
      // Redirect will happen in the useEffect above
    } catch (err: any) {
      setTwoFactorError(err.message || "Invalid verification code")
      console.error("2FA verification error:", err)
    }
  }

  // Handle going back to login from 2FA
  const handleBackToLogin = () => {
    clearError()
    setTwoFactorError("")
    useAuthStore.setState({ twoFactorRequired: false, tempToken: null })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {twoFactorRequired ? "Two-Factor Authentication" : "Sign in to dentRW"}
          </h2>
          {!twoFactorRequired && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          )}
        </div>

        {retryTimeText && (
          <div className="rounded-md bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Too many login attempts. Please try again in {retryTimeText}.</p>
              </div>
            </div>
          </div>
        )}

        {!twoFactorRequired ? (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={formError}
            disabled={!!retryTimeText}
            disabledMessage={retryTimeText ? `Try again in ${retryTimeText}` : undefined}
          />
        ) : (
          <TwoFactorForm
            onSubmit={handleTwoFactorVerify}
            onCancel={handleBackToLogin}
            loading={loading}
            error={twoFactorError}
          />
        )}
      </div>
    </div>
  )
}

export default LoginPage
