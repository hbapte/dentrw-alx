/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Clock, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { ResendVerificationForm } from "./ResendVerificationForm"
import { VerificationEmailSent } from "./VerificationEmailSent"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"

interface VerificationExpiredProps {
  initialEmail?: string
}

export const VerificationExpired: React.FC<VerificationExpiredProps> = ({ initialEmail = "" }) => {
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")

  const { resendVerification, loading } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()

  const handleResend = async (email: string) => {
    try {
      await resendVerification(email)
      showSuccess("Verification email sent successfully")
      setSentToEmail(email)
      setEmailSent(true)
    } catch (err: any) {
      if (err.error?.message) {
        showError(err.error.message)
      } else {
        showError(err.message || "Failed to resend verification email")
      }
    }
  }

  if (emailSent) {
    return <VerificationEmailSent email={sentToEmail} />
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold text-yellow-800">Verification Link Expired</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                The verification link has expired. Please request a new verification email to continue.
              </AlertDescription>
            </Alert>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Request New Verification Email</h3>
              <ResendVerificationForm
                onSubmit={handleResend}
                loading={loading}
                error={null}
                initialEmail={initialEmail}
              />
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="pt-6">
          <motion.div className="w-full text-center" whileHover={{ scale: 1.02 }}>
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
