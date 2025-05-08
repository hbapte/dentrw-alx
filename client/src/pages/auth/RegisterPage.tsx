/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity } from "lucide-react"
import { RegisterForm, type RegisterFormData } from "../../components/auth/RegisterForm"
import { RegistrationSuccess } from "../../components/auth/RegistrationSuccess"

const RegisterPage: React.FC = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const { register, loading, error, clearError, isAuthenticated } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }

    // Clear any previous errors when component mounts
    clearError()
  }, [isAuthenticated, navigate, clearError])

  // Handle form submission
  const handleSubmit = async (formData: RegisterFormData) => {
    clearError()

    try {
      await register(formData)
      showSuccess("Registration successful! Please check your email to verify your account.")
      setRegisteredEmail(formData.email)
      setRegistrationSuccess(true)

      // Redirect to login after 30 seconds
      setTimeout(() => {
        navigate("/login", { state: { registered: true } })
      }, 30000)
    } catch (err: any) {
      // Error handling is done in the store and displayed in the form
      console.error("Registration error:", err)

      // Handle standardized API error response format
      if (err.error?.message) {
        showError(err.error.message)
      } else {
        // Handle legacy error format
        showError(err.details || err.message || "Registration failed")
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {!registrationSuccess ? (
          <>
            <div className="flex justify-center">
              <Activity className="h-12 w-12 text-primary" />
            </div>
            <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
          </>
        ) : (
          <RegistrationSuccess email={registeredEmail} />
        )}
      </div>
    </div>
  )
}

export default RegisterPage
