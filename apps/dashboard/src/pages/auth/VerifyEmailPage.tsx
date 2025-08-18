/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { motion } from "framer-motion"
import { VerifyingState } from "../../components/auth/VerifyingState"
import { VerificationSuccess } from "../../components/auth/VerificationSuccess"
import { VerificationExpired } from "../../components/auth/VerificationExpired"
import { VerificationFailed } from "../../components/auth/VerificationFailed"

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [expired, setExpired] = useState(false)
  const [email, setEmail] = useState("")

  const { verifyEmail } = useAuthStore()
  const { showError } = useNotificationStore()
  const navigate = useNavigate()

  // Verify email token
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        showError("Invalid verification link")
        navigate("/login")
        return
      }

      try {
        setVerifying(true)
        await verifyEmail(token)
        setVerified(true)

        // Redirect to login after 30 seconds
        setTimeout(() => {
          navigate("/login")
        }, 30000)
      } catch (err: any) {
        console.error("Verification error:", err)

        // Handle standardized API error response format
        if (err.error?.code === "BAD_REQUEST" && err.error?.details?.expired) {
          setExpired(true)
          // Try to get email from the standardized format
          setEmail(err.error.details.email || "")
        }
        // Backward compatibility with the old format
        else if (err.status === 400 && err.data?.expired) {
          setExpired(true)
          setEmail(err.data.email || "")
        } else {
          // Generic error handling
          showError(err.error?.message || err.message || "Email verification failed")

          // Redirect to login after 30 seconds
          setTimeout(() => {
            navigate("/login")
          }, 30000)
        }
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [token, navigate, showError, verifyEmail])

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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
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
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl"
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

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
        

          {/* Content based on state */}
          {verifying && <VerifyingState />}
          {verified && <VerificationSuccess />}
          {expired && <VerificationExpired initialEmail={email} />}
          {!verifying && !verified && !expired && <VerificationFailed initialEmail={email} />}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
