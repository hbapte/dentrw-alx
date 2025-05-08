/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity } from "lucide-react"
import { ResendVerificationForm } from "../../components/auth/ResendVerificationForm"
import { VerificationEmailSent } from "../../components/auth/VerificationEmailSent"

const ResendVerificationPage: React.FC = () => {
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")
  const [initialEmail, setInitialEmail] = useState("")

  const { resendVerification, loading, error, clearError, isAuthenticated } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Get email from location state if available
  useEffect(() => {
    if (location.state?.email) {
      setInitialEmail(location.state.email)
    }
  }, [location.state])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }

    // Clear any previous errors when component mounts
    clearError()
  }, [isAuthenticated, navigate, clearError])

  // Handle form submission
  const handleSubmit = async (email: string) => {
    clearError()

    try {
      await resendVerification(email)
      showSuccess("Verification email sent successfully")
      setSentToEmail(email)
      setEmailSent(true)
    } catch (err: any) {
      // Error handling is done in the store and displayed in the form
      console.error("Resend verification error:", err)

      // Handle standardized API error response format
      if (err.error?.message) {
        showError(err.error.message)
      } else {
        // Handle legacy error format
        showError(err.details || err.message || "Failed to resend verification email")
      }

      // If email is already verified, redirect to login
      if (
        (err.error?.message && err.error.message.includes("already verified")) ||
        (err.message && err.message.includes("already verified"))
      ) {
        showSuccess("Your email is already verified. Please log in.")
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {!emailSent ? (
          <>
            <div className="flex justify-center">
              <Activity className="h-12 w-12 text-primary" />
            </div>
            <ResendVerificationForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              initialEmail={initialEmail}
            />
          </>
        ) : (
          <VerificationEmailSent email={sentToEmail} />
        )}
      </div>
    </div>
  )
}

export default ResendVerificationPage
