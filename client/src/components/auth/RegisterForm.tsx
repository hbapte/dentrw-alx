/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff, Phone, Globe,  Loader, CheckCircle, XCircle } from 'lucide-react'
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core"
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en"
import { PasswordStrengthIndicator } from "./password-strength-indicator"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "../../lib/utils"
import api from "../../services/api"
import { buttonVariants, containerVariants, itemVariants, slideVariants } from "../../constants/animations"

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
  disabled?: boolean
  disabledMessage?: string
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading ,disabled, disabledMessage  }) => {
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
  const [currentStep, setCurrentStep] = useState(1)
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [formData, formTouched]);

  
    const [usernameAvailability, setUsernameAvailability] = useState<{
    isChecking: boolean
    isAvailable: boolean | null
    message: string
  }>({
    isChecking: false,
    isAvailable: null,
    message: "",
  })


  // Check username availability
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailability({
          isChecking: false,
          isAvailable: null,
          message: "",
        })
        return
      }

      setUsernameAvailability((prev) => ({
        ...prev,
        isChecking: true,
      }))

      try {
        const response = await api.get(`/auth/checkUsername/${username}`)
        const data = response.data

        if (data.success) {
          setUsernameAvailability({
            isChecking: false,
            isAvailable: true,
            message: "Username is available",
          })
          // Clear username error if it exists
          if (formErrors.username) {
            setFormErrors((prev) => ({ ...prev, username: "" }))
          }
        } else {
          setUsernameAvailability({
            isChecking: false,
            isAvailable: false,
            message: data.error?.message || "Username is not available",
          })
          setFormErrors((prev) => ({ ...prev, username: data.error?.message || "Username is not available" }))
          
        }
      } catch (error: any) {
        console.error("Error checking username:", error)
        setUsernameAvailability({
          isChecking: false,
          isAvailable: null,
          message: "Error checking username",
        })

        // Handle error response from API
        if (error.response?.data?.error?.message) {
          setFormErrors((prev) => ({ ...prev, username: error.response.data.error.message }))
        }
      }
    },
    [formErrors],
  )

  // Debounce username check to avoid too many requests
  const debouncedUsernameCheck = useCallback(
    debounce((username: string) => {
      checkUsernameAvailability(username)
    }, 500),
    [checkUsernameAvailability],
  )

  // Handle input changes
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormTouched(true)

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

    // Check username availability
    if (name === "username" && value.length >= 3) {
      debouncedUsernameCheck(value)
    }

  }

  // Handle select change for language
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, preferredLanguage: value }))
    setFormTouched(true)
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.names.trim()) {
      errors.names = "Name is required"
    } else if (formData.names.trim().length < 3) {
      errors.names = "Name must be at least 3 characters long"
    } else if (formData.names.trim().length > 100) {
      errors.names = "Name cannot exceed 100 characters"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please provide a valid email address"
    }

    if (formData.username) {
      if (formData.username.length < 3) {
        errors.username = "Username must be at least 3 characters"
      } else if (formData.username.length > 30) {
        errors.username = "Username cannot exceed 30 characters"
      }  else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        errors.username = "Username must only contain alphanumeric characters"
      } 
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

    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required"
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Please provide a valid phone number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate current step
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.names.trim()) {
        errors.names = "Name is required"
      } else if (formData.names.trim().length < 3) {
        errors.names = "Name must be at least 3 characters long"
      } else if (formData.names.trim().length > 100) {
        errors.names = "Name cannot exceed 100 characters"
      }

      if (!formData.email.trim()) {
        errors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please provide a valid email address"
      }

      if (formData.username) {
        if (formData.username.length < 3) {
          errors.username = "Username must be at least 3 characters"
        } else if (formData.username.length > 30) {
          errors.username = "Username cannot exceed 30 characters"
        }  else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        errors.username = "Username must only contain alphanumeric characters"
      } 
      }
      if (!formData.phoneNumber) {
        errors.phoneNumber = "Phone number is required"
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
        errors.phoneNumber = "Please provide a valid phone number"
      }
    } else if (step === 2) {
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
    } 

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

       if(!disabled) {
       onSubmit(formData)
    } 
  }



  // Direction for animations
  const [[page, direction], setPage] = useState([0, 0])

  useEffect(() => {
    setPage([currentStep - 1, currentStep > page + 1 ? 1 : -1])
  }, [currentStep, page])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full border-1 overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl rounded-xl">
        <CardHeader className="relative py-3 -mt-7 ">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-400/5 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          <CardTitle className="text-center text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Create your account
          </CardTitle>
          <CardDescription className="text-center">Join our community and access exclusive features</CardDescription>

          <motion.div
            className="flex justify-center mt-4 mb-2 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-full max-w-xs bg-gray-200 h-1 rounded-full overflow-hidden flex items-center">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: "33.33%" }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="absolute -top-2 w-full max-w-xs flex justify-between">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: step === currentStep ? 1.1 : 1,
                    backgroundColor: step <= currentStep ? "#2563eb" : "#d1d5db",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                {currentStep === 1 && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {/* Full Name */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="names" className="text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        <Input
                          id="names"
                          name="names"
                          type="text"
                          autoComplete="name"
                          required
                          value={formData.names}
                          onChange={handleChange}
                          className={`pl-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
                            formErrors.names ? "border-red-300" : ""
                          }`}
                          placeholder="John Doe"
                           disabled={loading || disabled}
                        />
                      </div>
                      <AnimatePresence>
                        {formErrors.names && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-600"
                          >
                            {formErrors.names}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
                            formErrors.email ? "border-red-300" : ""
                          }`}
                          placeholder="you@example.com"
                           disabled={loading || disabled}
                        />
                      </div>
                      <AnimatePresence>
                        {formErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-600"
                          >
                            {formErrors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Username (optional) */}
                        <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 flex items-center">
                Username
                {usernameAvailability.isChecking && <Loader className="ml-2 h-3 w-3 animate-spin text-blue-500" />}
                {usernameAvailability.isAvailable === true && formData.username.length >= 3 && (
                  <CheckCircle className="ml-2 h-3 w-3 text-green-500" />
                )}
                {usernameAvailability.isAvailable === false && <XCircle className="ml-2 h-3 w-3 text-red-500" />}
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-10 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
                    formErrors.username ? "border-red-300" : ""
                  } ${usernameAvailability.isAvailable === true ? "border-green-300 " : ""}`}
                  placeholder="johndoe"
                   disabled={loading || disabled}
                />
              </div>
              <AnimatePresence>
                {formErrors.username && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-600"
                  >
                    {formErrors.username}
                  </motion.p>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {usernameAvailability.isAvailable === true && formData.username.length >= 3 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-green-600 flex items-center"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> {usernameAvailability.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

                    {/* Phone Number */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700">
                        Phone Number
                      </Label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className={`pl-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
                            formErrors.phoneNumber ? "border-red-300" : ""
                          }`}
                          placeholder="+1234567890"
                           disabled={loading || disabled}
                        />
                      </div>
                      <AnimatePresence>
                        {formErrors.phoneNumber && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-600"
                          >
                            {formErrors.phoneNumber}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      </motion.div>

                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {/* Password */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className={`pl-10 pr-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
                            formErrors.password ? "border-red-300" : ""
                          }`}
                          placeholder="••••••••"
                           disabled={loading || disabled}
                        />
                        <motion.button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {formData.password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <PasswordStrengthIndicator strength={passwordStrength} feedback={passwordFeedback} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {formErrors.password && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-600"
                          >
                            {formErrors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`pl-10 pr-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
                            formErrors.confirmPassword ? "border-red-300" : ""
                          }`}
                          placeholder="••••••••"
                           disabled={loading || disabled}
                        />
                        <motion.button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {formErrors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-600"
                          >
                            {formErrors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                

                    {/* Language Preference */}
                    gg
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="preferredLanguage" className="text-gray-700">
                        Preferred Language
                      </Label>
                      <div className="relative group">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors z-10" />
                        <Select
                          value={formData.preferredLanguage}
                          onValueChange={handleSelectChange}
                           disabled={loading || disabled}
                        >
                          <SelectTrigger className="pl-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg">
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="rw">Kinyarwanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
              
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.div
              className="flex justify-between mt-6 space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                   disabled={loading || disabled}
                >
                  Previous
                </motion.button>
              )}
              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 ml-auto transition-colors"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                   disabled={loading || disabled}
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 ml-auto transition-colors flex items-center disabled:cursor-not-allowed"
                  variants={buttonVariants}
                  initial="idle"
                  // whileHover="hover"
                  whileTap="tap"
                   disabled={loading || disabled}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Creating account...
                    </>
                  ) : disabled && disabledMessage ? (
                    disabledMessage
                  ) : (
                    "Create account"
                  )}
                </motion.button>
              )}
            </motion.div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 -mb-7">
          <motion.p
            className="text-center text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            By creating an account, you agree to our{" "}
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Terms of Service
              </Link>
            </motion.span>{" "}
            and{" "}
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Privacy Policy
              </Link>
            </motion.span>
            .
          </motion.p>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Sign in
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

