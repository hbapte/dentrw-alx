/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity } from "lucide-react"
import { ResendVerificationForm } from "../../components/auth/ResendVerificationForm"
import { VerificationEmailSent } from "../../components/auth/VerificationEmailSent"
import { motion } from "framer-motion"

const ResendVerificationPage: React.FC = () => {
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")
  const [initialEmail, setInitialEmail] = useState("")


  const { resendVerification, loading, error, clearError, isAuthenticated } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Get email from location state or query param if available
  useEffect(() => {
    const emailFromState = location.state?.email
    const emailFromQuery = searchParams.get("email")

    if (emailFromState) {
      setInitialEmail(emailFromState)
    } else if (emailFromQuery) {
      // Decode the URL-encoded email parameter
      const decodedEmail = decodeURIComponent(emailFromQuery)
      setInitialEmail(decodedEmail)
    }
  }, [location.state, searchParams])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="w-full max-w-[31rem] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!emailSent ? (
          <>
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-100">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </motion.div>
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
      </motion.div>
    </div>
  )
}

export default ResendVerificationPage
