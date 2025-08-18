/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Mail, AlertCircle, ArrowLeft } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"

interface ResendVerificationFormProps {
  onSubmit: (email: string) => Promise<void>
  loading: boolean
  error: any | null
  initialEmail?: string
}

export const ResendVerificationForm: React.FC<ResendVerificationFormProps> = ({
  onSubmit,
  loading,
  error,
  initialEmail = "",
}) => {
  const [email, setEmail] = useState(initialEmail)
  const [formError, setFormError] = useState("")

  // Update email state when initialEmail prop changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [initialEmail])

  // Validate email
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setFormError("Email is required")
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      return
    }

    await onSubmit(email)
  }

  // Format error message from API
  const getErrorMessage = () => {
    if (!error) return null

    // Handle standardized API error response format
    if (error.error?.message) {
      return error.error.message
    }

    // Handle legacy error format
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
              Resend Verification Email
            </CardTitle>
            <CardDescription className="text-center text-gray-600 mt-2">
              Enter your email address to receive a new verification link
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
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
              {formError && (
                <motion.p
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {formError}
                </motion.p>
              )}
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
                  "Send Verification Email"
                )}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="flex flex-col space-y-3 w-full">
            <motion.div className="text-center" whileHover={{ scale: 1.02 }}>
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </motion.div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already verified?{" "}
                <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </motion.span>
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                  <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Create an account
                  </Link>
                </motion.span>
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
