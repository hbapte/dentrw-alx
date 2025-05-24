/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle} from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { ResendVerificationForm } from "./ResendVerificationForm"
import { VerificationEmailSent } from "./VerificationEmailSent"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"

interface VerificationFailedProps {
  initialEmail?: string
}

export const VerificationFailed: React.FC<VerificationFailedProps> = ({ initialEmail = "" }) => {
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
            className="flex justify-center mb-2"
          >
            <div className="bg-red-100 rounded-full p-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold text-red-800">Verification Failed</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                The verification link is invalid or has already been used. Please request a new verification email.
              </AlertDescription>
            </Alert>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ResendVerificationForm
                onSubmit={handleResend}
                loading={loading}
                error={null}
                initialEmail={initialEmail}
              />

          </motion.div>
        </CardContent>

      </Card>
    </motion.div>
  )
}
