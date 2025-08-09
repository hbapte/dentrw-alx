// client\src\components\auth\RegisterForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Link } from "react-router-dom"
import { Loader } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { buttonVariants} from "../../constants/animations"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "../ui/stepper"
import { useRegisterFormStore, type RegisterFormData } from "../../store/register-form-store"
import { PersonalInfoStep } from "./steps/PersonalInfoStep"
import { SecurityStep } from "./steps/SecurityStep"
import { PreferencesStep } from "./steps/PreferencesStep"
interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  loading: boolean
  error: any | null
  disabled?: boolean
  disabledMessage?: string
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading, disabled, disabledMessage }) => {
  const {
    formData,
    currentStep,
    formErrors,
    usernameAvailability,
    passwordStrength,
    passwordFeedback,
    updateFormData,
    setCurrentStep,
    setFormErrors,
    validateStep,
    validateForm,
    checkUsernameAvailability,
    setPasswordStrengthAndFeedback,
    isStepValid,
  } = useRegisterFormStore()

  const steps = [
    { id: 1, title: "Personal Info" },
    { id: 2, title: "Security" },
    { id: 3, title: "Preferences" },
  ]

  // Effect to validate current step and update formErrors
  useEffect(() => {
    const errors = validateStep(currentStep)
    setFormErrors(errors)
  }, [formData, currentStep, validateStep, setFormErrors])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value } as Partial<RegisterFormData>)

    // Check password strength if password field
    if (name === "password") {
      setPasswordStrengthAndFeedback(value)
    }

    // Check username availability
    if (name === "username") {
      checkUsernameAvailability(value)
    }
  }

  // Handle select change for language
  const handleSelectChange = (value: string) => {
    updateFormData({ preferredLanguage: value })
  }

  // Handle next step
  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allErrors = validateForm()
    setFormErrors(allErrors)

    if (Object.keys(allErrors).length > 0) {
      // If there are errors, navigate to the first step with an error
      const firstInvalidStep = steps.find((step) => {
        const stepErrors = validateStep(step.id)
        return Object.keys(stepErrors).length > 0
      })
      if (firstInvalidStep) {
        setCurrentStep(firstInvalidStep.id)
      }
      return
    }

    if (!disabled) {
      onSubmit(formData)
    }
  }

  // Handle step click for stepper navigation
  const handleStepClick = (stepIndex: number) => {
    const targetStep = stepIndex + 1 // Convert 0-indexed stepper value to 1-indexed form step
    // Allow navigating to any previous step or the current step
    // Also allow navigating to the next step if the current step is valid
    if (targetStep <= currentStep || (targetStep === currentStep + 1 && isStepValid(currentStep))) {
      setCurrentStep(targetStep)
    }
  }

  // Direction for animations
  const [[page, direction], setPage] = useState([0, 0])

  useEffect(() => {
    setPage([currentStep - 1, currentStep > page + 1 ? 1 : -1])
  }, [currentStep, page])

  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleChange,
      formErrors,
      loading,
      disabled,
    }

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...commonProps} usernameAvailability={usernameAvailability} />
      case 2:
        return <SecurityStep {...commonProps} passwordStrength={passwordStrength} passwordFeedback={passwordFeedback} />
      case 3:
        return <PreferencesStep {...commonProps} handleSelectChange={handleSelectChange} />
      default:
        return null
    }
  }

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
            <Stepper
              value={currentStep - 1} // Stepper is 0-indexed
              onValueChange={handleStepClick}
              orientation="horizontal"
              className="w-full max-w-xs"
            >
              {steps.map((step, index) => (
                <StepperItem
                  key={step.id}
                  step={index + 1} // StepperItem is 1-indexed
                  className="relative flex-1 flex-col!"
                  completed={index + 1 < currentStep}
                  disabled={index + 1 > currentStep && !isStepValid(index + 1)} // Use isStepValid from store
                >
                  <StepperTrigger className="flex-col gap-2 rounded">
                    <StepperIndicator />
                    <div className="space-y-0.5 px-2">
                      <StepperTitle>{step.title}</StepperTitle>
                    </div>
                  </StepperTrigger>
                  {index < steps.length - 1 && (
                    <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </motion.div>
        </CardHeader>

        <CardContent className="">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                // variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <Suspense fallback={<div>Loading step...</div>}>{renderStepContent()}</Suspense>
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
              {currentStep < steps.length ? (
                <motion.button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 ml-auto transition-colors"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={loading || disabled || !isStepValid(currentStep)}
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 ml-auto transition-colors flex items-center disabled:cursor-not-allowed"
                  variants={buttonVariants}
                  initial="idle"
                  whileTap="tap"
                  disabled={loading || disabled || !isStepValid(currentStep)}
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
