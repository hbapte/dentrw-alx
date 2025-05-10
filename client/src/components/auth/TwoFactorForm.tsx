"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { AnimatedButton } from "../ui/animated-button"
import { motion } from "framer-motion"
import { ArrowLeft, KeyRound } from "lucide-react"

interface TwoFactorFormProps {
  onSubmit: (code: string) => Promise<void>
  onCancel: () => void
  loading: boolean
  error?: string
}

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onSubmit, onCancel, loading, error }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste event
      const pastedValue = value.slice(0, 6).split("")
      const newCode = [...code]

      pastedValue.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char
        }
      })

      setCode(newCode)

      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + pastedValue.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      // Handle single character input
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length === 6) {
      await onSubmit(fullCode)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const inputVariants = {
    idle: { scale: 1, borderColor: "rgba(209, 213, 219, 1)" },
    focus: { scale: 1.05, borderColor: "rgba(59, 130, 246, 1)" },
    filled: { scale: 1, borderColor: "rgba(59, 130, 246, 1)" },
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full border-0 overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl rounded-xl">
        <CardContent className="p-6">
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <KeyRound className="h-8 w-8 text-blue-600" />
              </div>
            </motion.div>

            {error && (
              <motion.div variants={itemVariants} className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <p className="text-sm text-gray-600 text-center mb-4">
                Enter the 6-digit verification code sent to your device
              </p>
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <motion.input
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                      variants={inputVariants}
                      initial="idle"
                      animate={
                        digit ? "filled" : inputRefs.current[index] === document.activeElement ? "focus" : "idle"
                      }
                      whileFocus="focus"
                      whileHover={{ scale: 1.02 }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col space-y-3">
              <AnimatedButton
                type="submit"
                disabled={code.join("").length !== 6 || loading}
                isLoading={loading}
                loadingText="Verifying..."
                size="lg"
                className="w-full"
              >
                Verify
              </AnimatedButton>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center text-xs text-gray-500">
              <p>
                Didn't receive a code?{" "}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Resend code
                </button>
              </p>
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TwoFactorForm
