/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, AlertCircle } from 'lucide-react'
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Resend Verification Email</CardTitle>
        <CardDescription>Enter your email address to receive a new verification link</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                className={`pl-10 ${formError ? "border-red-300" : ""}`}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send Verification Email"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already verified?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
