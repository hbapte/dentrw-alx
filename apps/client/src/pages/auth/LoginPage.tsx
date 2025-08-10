// client\src\pages\auth\LoginPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { AlertTriangle, ShieldAlert, LockKeyhole, CheckCircle2 } from "lucide-react"
import LoginForm from "../../components/auth/LoginForm"
import TwoFactorForm from "../../components/auth/TwoFactorForm"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

const LoginPage: React.FC = () => {
  const [formError, setFormError] = useState("")
  const [retryTimeText, setRetryTimeText] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [twoFactorError, setTwoFactorError] = useState("")
  const [helpText, setHelpText] = useState<string | null>(null)
  // const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)

  const { login, verifyTwoFactor, loading, error, clearError, twoFactorRequired, tempToken, isAuthenticated } =
    useAuthStore()

  const { showWarning, showSuccess } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard"

  // Format retry time for rate limiting
  const formatRetryTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`
    }

    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }, [])

  // Handle rate limiting countdown
  useEffect(() => {
    let timerId: number | undefined

    // Check for rate limit error in the standardized API response format
    if (error?.error?.code === "TOO_MANY_REQUESTS" || error?.error?.code === "RATE_LIMITED") {
      // Get retry after from the standardized format
      let secondsLeft = error.error.details?.retryAfter || 900
      setRetryAfter(secondsLeft)
      setRetryTimeText(formatRetryTime(secondsLeft))

      // Set help text if available
      if (error.error.help) {
        setHelpText(error.error.help)
      }

      // If debug info is available, set remaining attempts
      // if (error.debug?.maxAttempts) {
      //   setRemainingAttempts(error.debug.maxAttempts)
      // }

      timerId = window.setInterval(() => {
        secondsLeft -= 1
        if (secondsLeft <= 0) {
          clearInterval(timerId)
          setRetryTimeText(null)
          setRetryAfter(null)
          setHelpText(null)
          clearError()
        } else {
          setRetryTimeText(formatRetryTime(secondsLeft))
        }
      }, 1000)
    }
    // Backward compatibility with the old format
    else if (error?.status === 429 && error?.data?.retryAfter) {
      let secondsLeft = error.data.retryAfter
      setRetryAfter(secondsLeft)
      setRetryTimeText(formatRetryTime(secondsLeft))

      // Set help text if available
      if (error.help) {
        setHelpText(error.help)
      }

      timerId = window.setInterval(() => {
        secondsLeft -= 1
        if (secondsLeft <= 0) {
          clearInterval(timerId)
          setRetryTimeText(null)
          setRetryAfter(null)
          setHelpText(null)
          clearError()
        } else {
          setRetryTimeText(formatRetryTime(secondsLeft))
        }
      }, 1000)
    }

    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [error, clearError, formatRetryTime])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      showSuccess("Login successful")
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from, showSuccess])

  // Handle login form submission
  const handleLogin = async (email: string, password: string, ) => {
    clearError()
    setFormError("")
    setHelpText(null)

    try {
      await login(email, password)
      // If 2FA is required, the UI will update based on twoFactorRequired state
      // Otherwise, we'll be redirected in the useEffect above
    } catch (err: any) {
      console.error("Login error:", err)

      // Handle standardized API error response format
      if (err.error?.code === "TOO_MANY_REQUESTS" || err.error?.code === "RATE_LIMITED") {
        // Rate limit error in standardized format
        const retryTime = formatRetryTime(err.error.details?.retryAfter || 900)
        showWarning(`Too many login attempts. Please try again in ${retryTime}.`)

        // Set help text if available
        if (err.error.help) {
          setHelpText(err.error.help)
        }
      }
      // Backward compatibility with the old format
      else if (err.status === 429) {
        // Rate limit error in old format
        const retryTime = formatRetryTime(err.data?.retryAfter || 900)
        showWarning(`Too many login attempts. Please try again in ${retryTime}.`)

        // Set help text if available
        if (err.help) {
          setHelpText(err.help)
        }
      } else if (err.error?.code === "UNAUTHORIZED" || err.status === 401) {
        setFormError(err.error?.message || "Invalid email or password")
      } else if (
        err.error?.message?.includes("verify") || err.message?.includes("verify")
      ) {
        // Email verification required
        setFormError("Please verify your email before logging in")
        setHelpText("Check your inbox for a verification email or request a new one")
      } else if (err.error?.details || err.details) {
        setFormError(err.error?.details || err.details)
      } else {
        setFormError(err.error?.message || err.message || "Login failed")

        // Set help text if available
        if (err.error?.help || err.help) {
          setHelpText(err.error?.help || err.help)
        }
      }
    }
  }

  // Handle 2FA verification
  const handleTwoFactorVerify = async (code: string) => {
    clearError()
    setTwoFactorError("")

    try {
      if (!tempToken) {
        setTwoFactorError("Authentication session expired. Please login again.")
        return
      }

      await verifyTwoFactor(tempToken, code)
      showSuccess("Authentication successful")
      // Redirect will happen in the useEffect above
    } catch (err: any) {
      // Handle standardized API error response format
      if (err.error?.message) {
        setTwoFactorError(err.error.message)
      } else {
        setTwoFactorError(err.message || "Invalid verification code")
      }
      console.error("2FA verification error:", err)
    }
  }

  // Handle going back to login from 2FA
  const handleBackToLogin = () => {
    clearError()
    setTwoFactorError("")
    useAuthStore.setState({ twoFactorRequired: false, tempToken: null })
  }

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.2,
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.4 + i * 0.1,
      },
    }),
  }

  const alertVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Login Form */}
        <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:w-1/2 xl:px-12 relative">
          <motion.div
            className="absolute inset-0 bg-white/30 backdrop-blur-[2px] -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          <div className="mx-auto w-full max-w-sm lg:w-96">
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
             
              <h2 className="text-3xl font-extrabold  bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {twoFactorRequired ? "Two-Factor Authentication" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {twoFactorRequired
                  ? "Please enter the verification code to continue"
                  : "Sign in to your account to continue"}
              </p>
            </motion.div>

            <AnimatePresence>
              {retryTimeText && (
                <motion.div key="retry-alert" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                  <Alert variant="warning" className="mb-6 border-yellow-300 bg-yellow-50">
                    <ShieldAlert className="h-5 w-5 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Account protection activated</AlertTitle>
                    <AlertDescription className="mt-1">
                      <p className="text-yellow-700">
                        Too many login attempts. Please try again in{" "}
                        <span className="font-medium">{retryTimeText}</span>.
                      </p>
                      {/* {helpText && <p className="mt-2 text-yellow-600">{helpText}</p>} */}
                        
                        {/* {remainingAttempts && (
                          <p className="mt-2 text-yellow-600">
                            Remaining attempts: <span className="font-medium">{remainingAttempts}</span>
                          </p>
                        )} */}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {formError && !retryTimeText && (
                <motion.div key="error-alert" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                  <Alert variant="destructive" className="mb-4 bg-red-50">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertDescription>
                      <p>{formError}</p>
                      {helpText && <p className="mt-2 text-sm">{helpText}</p>}
                      {formError.includes("verify") && (
                        <motion.div className="mt-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                            to={`/resend-verification?email=${encodeURIComponent((document.querySelector('input[type="email"]') as HTMLInputElement)?.value || "")}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                            >
                            Resend verification email
                            </Link>
                        </motion.div>
                      )}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!twoFactorRequired ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm
                    onSubmit={handleLogin}
                    loading={loading}
                    error={formError}
                    disabled={!!retryAfter}
                    disabledMessage={retryTimeText ? `Try again in ${retryTimeText}` : undefined}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="2fa-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TwoFactorForm
                    onSubmit={handleTwoFactorVerify}
                    onCancel={handleBackToLogin}
                    loading={loading}
                    error={twoFactorError}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side - Illustration/Branding */}
        <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M0,0 L100,0 L100,100 L0,100 Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.circle
                  key={i}
                  cx={20 + i * 15}
                  cy={20 + i * 15}
                  r={5 + i * 2}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: i * 0.2, ease: "easeInOut" }}
                />
              ))}
            </svg>
          </motion.div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
              className="mb-8 bg-white/10 backdrop-blur-sm p-6 rounded-full"
            >
              <LockKeyhole className="h-24 w-24 text-white opacity-90" />
            </motion.div>

            <motion.h2 className="text-4xl font-bold mb-4" variants={cardVariants} initial="hidden" animate="visible">
              DentRW Portal
            </motion.h2>

            <motion.p
              className="text-xl text-blue-100 max-w-md text-center mb-8"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              Secure access to your dental practice management system
            </motion.p>

            <div className="grid grid-cols-3 gap-6 max-w-lg">
              {[
                { title: "Appointments", desc: "Manage your schedule" },
                { title: "Patients", desc: "Access patient records" },
                { title: "Billing", desc: "Handle payments" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors border border-white/20 shadow-lg"
                  custom={i}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -5,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                  }}
                  whileTap={{ y: 0 }}
                >
                  <motion.div
                    className="mb-2 flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-blue-200" />
                  </motion.div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-blue-100">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="absolute bottom-4 left-0 right-0 text-center text-blue-200 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            © 2025 dentRW. All rights reserved.
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default LoginPage
