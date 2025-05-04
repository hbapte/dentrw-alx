/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { Activity, AlertCircle, CheckCircle, Mail, ArrowLeft } from "lucide-react"

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [expired, setExpired] = useState(false)
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)

  const { verifyEmail, resendVerification } = useAuthStore()
  const { showError, showSuccess } = useNotificationStore()
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

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } catch (err: any) {
        if (err.status === 400 && err.data?.expired) {
          setExpired(true)
          setEmail(err.data.email || "")
        } else {
          showError(err.message || "Email verification failed")

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login")
          }, 3000)
        }
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [token, navigate, showError, verifyEmail])

  // Handle resend verification
  const handleResend = async () => {
    if (!email) {
      showError("Email address is required")
      return
    }

    try {
      setResending(true)
      await resendVerification(email)
      showSuccess("Verification email sent successfully")
    } catch (err: any) {
      showError(err.message || "Failed to resend verification email")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
        </div>

        {verifying ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg
              className="h-12 w-12 animate-spin text-blue-600"
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
            <p className="mt-4 text-center text-lg text-gray-600">Verifying your email...</p>
          </div>
        ) : verified ? (
          <div className="rounded-md bg-green-50 border-l-4 border-green-400 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Email verified successfully!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your email has been verified. You can now log in to your account.</p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Go to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : expired ? (
          <div className="space-y-6">
            <div className="rounded-md bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Verification link expired</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The verification link has expired. Please request a new verification email.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-300 bg-white px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="you@example.com"
                      disabled={resending}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {resending ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Resend verification email"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>The verification link is invalid or has already been used.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
