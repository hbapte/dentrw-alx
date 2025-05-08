/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff, Phone, Globe, AlertCircle } from "lucide-react"
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core"
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

// Initialize zxcvbn password strength estimator
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
}
zxcvbnOptions.setOptions(options)

export interface RegisterFormData {
  names: string
  email: string
  username: string
  password: string
  confirmPassword: string
  phoneNumber: string
  preferredLanguage: string
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  loading: boolean
  error: any | null
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    names: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    preferredLanguage: "en",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState("")

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Check password strength
    if (name === "password") {
      const result = zxcvbn(value)
      setPasswordStrength(result.score)
      setPasswordFeedback(result.feedback.warning || result.feedback.suggestions[0] || "")
    }

    // Check password match
    if (name === "confirmPassword" || (name === "password" && formData.confirmPassword)) {
      if (name === "password" && value !== formData.confirmPassword) {
        setFormErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      } else if (name === "confirmPassword" && value !== formData.password) {
        setFormErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      } else {
        setFormErrors((prev) => ({ ...prev, confirmPassword: "" }))
      }
    }
  }

  // Handle select change for language
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, preferredLanguage: value }))
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.names.trim()) {
      errors.names = "Full name is required"
    } else if (formData.names.trim().length < 3) {
      errors.names = "Name must be at least 3 characters long"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (formData.username && formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (formData.username && formData.username.length > 30) {
      errors.username = "Username cannot exceed 30 characters"
    } else if (formData.username && !/^[a-zA-Z0-9]+$/.test(formData.username)) {
      errors.username = "Username can only contain alphanumeric characters"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Invalid phone number format"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
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
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
  

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="names">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="names"
                name="names"
                type="text"
                autoComplete="name"
                required
                value={formData.names}
                onChange={handleChange}
                className={`pl-10 ${formErrors.names ? "border-red-300" : ""}`}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
            {formErrors.names && <p className="text-sm text-red-600">{formErrors.names}</p>}
          </div>

          {/* Email */}
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
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 ${formErrors.email ? "border-red-300" : ""}`}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
          </div>

          {/* Username (optional) */}
          <div className="space-y-2">
            <Label htmlFor="username">Username (optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`pl-10 ${formErrors.username ? "border-red-300" : ""}`}
                placeholder="johndoe"
                disabled={loading}
              />
            </div>
            {formErrors.username && <p className="text-sm text-red-600">{formErrors.username}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 pr-10 ${formErrors.password ? "border-red-300" : ""}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {formData.password && <PasswordStrengthIndicator strength={passwordStrength} feedback={passwordFeedback} />}
            {formErrors.password && <p className="text-sm text-red-600">{formErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-10 pr-10 ${formErrors.confirmPassword ? "border-red-300" : ""}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {formErrors.confirmPassword && <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>}
          </div>

          {/* Phone Number (optional) */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`pl-10 ${formErrors.phoneNumber ? "border-red-300" : ""}`}
                placeholder="+1234567890"
                disabled={loading}
              />
            </div>
            {formErrors.phoneNumber && <p className="text-sm text-red-600">{formErrors.phoneNumber}</p>}
          </div>

          {/* Language Preference */}
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Preferred Language</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 z-10" />
              <Select value={formData.preferredLanguage} onValueChange={handleSelectChange} disabled={loading}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-center text-sm text-gray-600">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
