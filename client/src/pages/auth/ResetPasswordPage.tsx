"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { motion } from "framer-motion"
import { ResetPasswordForm } from "../../components/auth/ResetPasswordForm"
import { ResetPasswordSuccess } from "../../components/auth/ResetPasswordSuccess"

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const [resetSuccess, setResetSuccess] = useState(false)

  const { resetPassword, loading, error, clearError } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()
  const navigate = useNavigate()

  // Check if token is provided
  useEffect(() => {
    if (!token) {
      showError("Invalid or missing reset token")
      navigate("/forgot-password")
    }
  }, [token, navigate, showError])

  const handleSubmit = async (password: string) => {
    clearError()

    try {
      await resetPassword(token!, password)
      setResetSuccess(true)
      showSuccess("Password reset successful! You can now log in with your new password.")

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate("/login")
      }, 5000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Password reset error:", err)

      // Handle standardized API error response format
      if (err.error?.code === "VALIDATION_ERROR" && err.error?.details) {
        // Show specific validation error
        if (err.error.details.password) {
          showError(err.error.details.password)
        } else {
          showError(err.error.message || "Validation failed")
        } 

       
      }  else if (
          err.error?.code === "BAD_REQUEST" &&
          err.error?.message &&
          typeof err.error.message === "string" &&
          err.error.message.includes("Invalid or expired reset token")
        ) {
          showError("Invalid or expired reset token");
          setTimeout(() => {
            navigate("/forgot-password");
          }, 3000);
        }
      else if (err.error?.message) {
        showError(err.error.message)
      } else {
        // Fallback to legacy error format
        showError(err.details || err.message || "Password reset failed")
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating decorative elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
       
          {resetSuccess ? (
            <ResetPasswordSuccess />
          ) : (
            <ResetPasswordForm onSubmit={handleSubmit} loading={loading} error={error} />
          )}


           {!resetSuccess && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div>

              <p className="text-sm text-gray-600">
                Remembered your password? 
              </p>

              <Link
                to="/login"
                className="inline-flex items-center hover:underline text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <motion.span
                  className="mr-1"
                  animate={{ x: [-2, 0, -2] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  
                </motion.span>
                Log in
              </Link>
            </motion.div>
          </motion.div>

           )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
