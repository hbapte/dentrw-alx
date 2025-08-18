// client\src\pages\auth\RegisterPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { useNotificationStore } from "../../store/notification-store"
import { UserPlus, CheckCircle2, ShieldCheck, Users, Stethoscope, AlertTriangle, ShieldAlert } from "lucide-react"
import { RegisterForm,  } from "../../components/auth/RegisterForm"
import { RegistrationSuccess } from "../../components/auth/RegistrationSuccess"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { type RegisterFormData } from "@/store/register-form-store"

const RegisterPage: React.FC = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const { register, loading, error, clearError, isAuthenticated } = useAuthStore()
  const { showError, showSuccess, showWarning } = useNotificationStore()
  const navigate = useNavigate()
  const [retryTimeText, setRetryTimeText] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)    
  const [helpText, setHelpText] = useState<string | null>(null)
  const [formError, setFormError] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }

    // Clear any previous errors when component mounts
    clearError()
  }, [isAuthenticated, navigate, clearError])

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




  // Handle form submission
  const handleSubmit = async (formData: RegisterFormData) => {
    clearError()
    setFormError("")
    setHelpText(null)

    try {
      // Remove confirmPassword as it's not needed in the API call
      const { ...registerData } = formData;

      // Call the register function from authStore
      const response = await register(registerData);

      // Check if registration was successful
      if (response && response.success) {
      showSuccess("Registration successful! Please check your email to verify your account.");
      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);

      // Redirect to login after 30 seconds
      setTimeout(() => {
        navigate("/login", { state: { registered: true } });
      }, 30000);
      return;
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setRegisteredEmail(formData.email);


      const errorCode = err.error?.code || err.code ;
      const errorStatus = err.error?.status || err.status;
      const errorMessage = err.error?.message || err.message;
      const retryAfter = err.error?.details?.retryAfter || err.data?.retryAfter || 900;

      if (errorCode === "TOO_MANY_REQUESTS" || errorCode === "RATE_LIMITED" || err.status === 429) {
      const retryTime = formatRetryTime(retryAfter);
      showWarning(`Too many register attempts. Please try again in ${retryTime}.`);
      setHelpText(err.error?.help || err.help || null);
      setRetryTimeText(retryTime);
      setRetryAfter(retryAfter);

      } else if (errorCode === "CONFLICT" || errorStatus === 409) {
        setFormError(err.error?.message || "Email or username already exists. Please log in or reset your password.");
        setHelpText(err.error?.help || err.help || null);
        showError(err.error?.message || "Email or username already exists. Please log in or reset your password.");
      } else if (errorCode === "VALIDATION_ERROR" || errorStatus === 422) {
        setFormError(err.error?.message || "Invalid input. Please check your data.");
        if (typeof err.error?.details === "object") {
          const detailsArray = Object.values(err.error.details);
          setHelpText(detailsArray.join(" "));
        } else {
          setHelpText(err.error?.details || err.details || null);
        }
        showError(err.error?.message || "Invalid input. Please check your data.");
      }  else if (errorCode === "DATABASE_ERROR" || errorStatus === 500) {
        setFormError(err.error?.message || "Server error. Please try again later.");
        setHelpText(err.error?.help || err.help || null);
        showError(err.error?.message || "Server error. Please try again later.");
      }
      
      else {
      setFormError(err.error?.details || err.details || errorMessage || "Registration failed");
      setHelpText(err.error?.help || err.help || null);
      showError(err.error?.details || err.details || errorMessage || "Registration failed");
      }

      // Reset registration state on error
      setRegistrationSuccess(false);
    }

}
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }


  const featureVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
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
      transition: { type: "spring" as const, stiffness: 400, damping: 20 },
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
        {/* Left side - Registration Form */}

        
        <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:w-1/2 xl:px-12 relative">
         
            <AnimatePresence>
              {retryTimeText && (
                <motion.div key="retry-alert" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                  <Alert variant="warning" className="mb-6 border-yellow-300 bg-yellow-50">
                    <ShieldAlert className="h-5 w-5 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Account protection activated</AlertTitle>
                    <AlertDescription className="mt-1">
                      <p className="text-yellow-700">
                        Too many register attempts. Please try again in{" "}
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
                      {helpText && <p className="mt-1 text-sm">{helpText}</p>}
                      {formError.includes("not verified") && (
                        <motion.div className="mt-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            to={`/resend-verification?${registeredEmail}`}
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
            {!registrationSuccess ? (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="flex justify-center mb-6 lg:hidden"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                >
                  <div className="p-4 bg-blue-100 rounded-full">
                    <UserPlus className="h-12 w-12 text-blue-600" />
                  </div>
                </motion.div>
                <RegisterForm onSubmit={handleSubmit}  loading={loading}
                    error={formError}
                    disabled={!!retryAfter}
                    disabledMessage={retryTimeText ? `Try again in ${retryTimeText}` : undefined}/>
              </motion.div>
            ) : (
              <motion.div
                key="registration-success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <RegistrationSuccess email={registeredEmail} />
              </motion.div>
            )}
          </AnimatePresence>
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
          

            <motion.h2
              className="text-3xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Join DentRW Portal
            </motion.h2>

            <motion.p
              className="text-lg text-blue-100 max-w-2xl text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Create your account and get access to our dental practice management system
            </motion.p>

            <div className="grid grid-cols-2 gap-6 max-w-lg">
              {[
                {
                  icon: CheckCircle2,
                  title: "Easy Registration",
                  desc: "Simple 3-step registration process",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure Access",
                  desc: "Your data is protected with encryption",
                },
                {
                  icon: Users,
                  title: "Patient Management",
                  desc: "Manage all your patients in one place",
                },
                {
                  icon: Stethoscope,
                  title: "Medical Records",
                  desc: "Access complete dental history",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors border border-white/20 shadow-lg flex items-center"
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
                    className="mr-4 flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                  >
                    <feature.icon className="h-8 w-8 text-blue-200" />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-blue-100">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <h3 className="font-semibold mb-2 text-center">Why Choose DentRW?</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />
                  Streamlined appointment scheduling
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />
                  Secure patient data management
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />
                  Integrated billing and insurance processing
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />
                  Real-time collaboration with colleagues
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-4 left-0 right-0 text-center text-blue-200 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            © 2025 DentRW. All rights reserved.
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default RegisterPage
