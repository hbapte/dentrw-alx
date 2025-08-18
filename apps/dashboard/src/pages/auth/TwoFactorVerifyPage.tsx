/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity, AlertCircle, Shield } from "lucide-react"

const TwoFactorVerifyPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState("")
  const [formError, setFormError] = useState("")
  const [tempToken, setTempToken] = useState<string | null>(null)

  const { verifyTwoFactor, loading, error, clearError } = useAuthStore()
  useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard"

  // Extract temp token from location state
  useEffect(() => {
    const state = location.state as any
    if (state?.tempToken) {
      setTempToken(state.tempToken)
    } else {
      // If no temp token is provided, redirect to login
      navigate("/login", { replace: true })
    }
  }, [location.state, navigate])

  // Handle verification code input
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setVerificationCode(value)

    if (formError) {
      setFormError("")
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFormError("")

    if (!tempToken) {
      setFormError("Invalid session. Please try logging in again.")
      return
    }

    if (verificationCode.length !== 6) {
      setFormError("Please enter a valid 6-digit verification code")
      return
    }

    try {
      await verifyTwoFactor(tempToken, verificationCode)
      navigate(from, { replace: true })
    } catch (err: any) {
      if (err.status === 401) {
        setFormError("Invalid verification code")
      } else {
        setFormError(err.message || "Verification failed")
      }
      console.error("2FA verification error:", err)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Two-Factor Verification</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code from your authenticator app
          </p>
        </div>

        {(error || formError) && (
          <div className="rounded-md bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {formError || error?.details || error?.message || "An error occurred"}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="verification-code" className="sr-only">
              Verification Code
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={verificationCode}
                onChange={handleCodeChange}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Enter 6-digit code"
                disabled={loading || !tempToken}
                autoFocus
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !tempToken || verificationCode.length !== 6}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TwoFactorVerifyPage
