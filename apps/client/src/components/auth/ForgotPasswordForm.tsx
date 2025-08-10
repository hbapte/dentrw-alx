"use client"

import type React from "react"
import { useState } from "react"
import { Mail, AlertCircle } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  loading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any | null
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState("")

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setFormError("Please enter your email address")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address")
      return false
    }

    setFormError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      return
    }

    await onSubmit(email)
  }

  const getErrorMessage = () => {
    if (!error) return null
    return error.details || error.message || "An error occurred"
  }

  const errorMessage = getErrorMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="w-full backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardHeader className="space-y-1 pb-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600 mt-2">
              Enter your email to receive a reset link
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6">
          {(errorMessage || formError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{formError || errorMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (formError) setFormError("")
                  }}
                  className={`pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                    formError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
