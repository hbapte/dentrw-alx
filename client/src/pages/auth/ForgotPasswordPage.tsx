"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"

import { motion } from "framer-motion"
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm"
import { ForgotPasswordSuccess } from "../../components/auth/ForgotPasswordSuccess"

const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const { forgotPassword, loading, error, clearError } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()
  

  const handleSubmit = async (email: string) => {
    clearError()

    try {
      await forgotPassword(email)
      setSubmittedEmail(email)
      setSubmitted(true)
      showSuccess("If your email is registered, you will receive a password reset link")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Don't show specific errors for security reasons
      showError("An error occurred. Please try again later.")
      console.error("Forgot password error:", err)
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
       

          {submitted ? (
            <ForgotPasswordSuccess email={submittedEmail} />
          ) : (
            <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} error={error} />
          )}

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {!submitted && (
              <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <motion.span
                className="mr-1"
                animate={{ x: [-2, 0, -2] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                ←
                </motion.span>
                Back to login
              </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage


