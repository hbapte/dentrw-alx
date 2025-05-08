/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity, AlertTriangle, ShieldAlert, LockKeyhole } from "lucide-react"
import LoginForm from "../../components/auth/LoginForm"
import TwoFactorForm from "../../components/auth/TwoFactorForm"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"

const LoginPage: React.FC = () => {
  const [formError, setFormError] = useState("")
  const [retryTimeText, setRetryTimeText] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [twoFactorError, setTwoFactorError] = useState("")
  const [helpText, setHelpText] = useState<string | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)

  const { login, verifyTwoFactor, loading, error, clearError, twoFactorRequired, tempToken, isAuthenticated } =
    useAuthStore()

  const { showWarning, showSuccess } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard"

  // Format retry time for rate limiting
  const formatRetryTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`
    }

    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }, [])

  // Handle rate limiting countdown
  useEffect(() => {
    let timerId: number | undefined

    // Check for rate limit error in the standardized API response format
    if (error?.error?.code === "TOO_MANY_REQUESTS" || error?.error?.code === "RATE_LIMITED") {
      // Get retry after from the standardized format
      let secondsLeft = error.error.details?.retryAfter || 900
      setRetryAfter(secondsLeft)
      setRetryTimeText(formatRetryTime(secondsLeft))

      // Set help text if available
      if (error.error.help) {
        setHelpText(error.error.help)
      }

      // If debug info is available, set remaining attempts
      if (error.debug?.maxAttempts) {
        setRemainingAttempts(error.debug.maxAttempts)
      }

      timerId = window.setInterval(() => {
        secondsLeft -= 1
        if (secondsLeft <= 0) {
          clearInterval(timerId)
          setRetryTimeText(null)
          setRetryAfter(null)
          setHelpText(null)
          clearError()
        } else {
          setRetryTimeText(formatRetryTime(secondsLeft))
        }
      }, 1000)
    }
    // Backward compatibility with the old format
    else if (error?.status === 429 && error?.data?.retryAfter) {
      let secondsLeft = error.data.retryAfter
      setRetryAfter(secondsLeft)
      setRetryTimeText(formatRetryTime(secondsLeft))

      // Set help text if available
      if (error.help) {
        setHelpText(error.help)
      }

      timerId = window.setInterval(() => {
        secondsLeft -= 1
        if (secondsLeft <= 0) {
          clearInterval(timerId)
          setRetryTimeText(null)
          setRetryAfter(null)
          setHelpText(null)
          clearError()
        } else {
          setRetryTimeText(formatRetryTime(secondsLeft))
        }
      }, 1000)
    }

    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [error, clearError, formatRetryTime])

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
    setHelpText(null)

    try {
      await login(email, password)
      // If 2FA is required, the UI will update based on twoFactorRequired state
      // Otherwise, we'll be redirected in the useEffect above
    } catch (err: any) {
      console.error("Login error:", err)

      // Handle standardized API error response format
      if (err.error?.code === "TOO_MANY_REQUESTS" || err.error?.code === "RATE_LIMITED") {
        // Rate limit error in standardized format
        const retryTime = formatRetryTime(err.error.details?.retryAfter || 900)
        showWarning(`Too many login attempts. Please try again in ${retryTime}.`)

        // Set help text if available
        if (err.error.help) {
          setHelpText(err.error.help)
        }
      }
      // Backward compatibility with the old format
      else if (err.status === 429) {
        // Rate limit error in old format
        const retryTime = formatRetryTime(err.data?.retryAfter || 900)
        showWarning(`Too many login attempts. Please try again in ${retryTime}.`)

        // Set help text if available
        if (err.help) {
          setHelpText(err.help)
        }
      } else if (err.error?.code === "UNAUTHORIZED" || err.status === 401) {
        setFormError(err.error?.message || "Invalid email or password")
      } else if (
        err.error?.message?.includes("verify") || err.message?.includes("verify")
      ) {
        // Email verification required
        setFormError("Please verify your email before logging in")
        setHelpText("Check your inbox for a verification email or request a new one")
      } else if (err.error?.details || err.details) {
        setFormError(err.error?.details || err.details)
      } else {
        setFormError(err.error?.message || err.message || "Login failed")

        // Set help text if available
        if (err.error?.help || err.help) {
          setHelpText(err.error?.help || err.help)
        }
      }
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
      // Handle standardized API error response format
      if (err.error?.message) {
        setTwoFactorError(err.error.message)
      } else {
        setTwoFactorError(err.message || "Invalid verification code")
      }
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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Left side - Login Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {twoFactorRequired ? "Two-Factor Authentication" : "Welcome back"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {twoFactorRequired
                ? "Please enter the verification code to continue"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {retryTimeText && (
            <Alert variant="warning" className="mb-6 border-yellow-300 bg-yellow-50">
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Account protection activated</AlertTitle>
              <AlertDescription className="mt-1">
                <p className="text-yellow-700">
                  Too many login attempts. Please try again in <span className="font-medium">{retryTimeText}</span>.
                </p>
                {helpText && <p className="mt-2 text-yellow-600">{helpText}</p>}
                {remainingAttempts !== null && (
                  <p className="mt-2 text-xs text-yellow-500">Maximum attempts: {remainingAttempts}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {formError && !retryTimeText && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-5 w-5" />

              <AlertDescription>
                <p>{formError}</p>
                {helpText && <p className="mt-2 text-sm">{helpText}</p>}
                {formError.includes("verify") && (
                  <div className="mt-2">
                    <Link
                      to="/resend-verification"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                    >
                      Resend verification email
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!twoFactorRequired ? (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={formError}
              disabled={!!retryAfter}
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

      {/* Right side - Illustration/Branding */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="mb-8">
            <LockKeyhole className="h-24 w-24 text-white opacity-90" />
          </div>
          <h2 className="text-4xl font-bold mb-4">dentRW Portal</h2>
          <p className="text-xl text-blue-100 max-w-md text-center mb-8">
            Secure access to your dental practice management system
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-1">Appointments</h3>
              <p className="text-sm text-blue-100">Manage your schedule</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-1">Patients</h3>
              <p className="text-sm text-blue-100">Access patient records</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-1">Billing</h3>
              <p className="text-sm text-blue-100">Handle payments</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-blue-200 text-sm">
          © 2023 dentRW. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default LoginPage
