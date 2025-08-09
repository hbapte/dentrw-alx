// client/src/components/auth/steps/SecurityStep.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"
import { containerVariants } from "@/constants/animations"
import type { RegisterFormData } from "@/store/register-form-store"

interface SecurityStepProps {
  formData: RegisterFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  formErrors: Record<string, string>
  passwordStrength: number
  passwordFeedback: string
  loading: boolean
  disabled: boolean | undefined
}

export const SecurityStep: React.FC<SecurityStepProps> = ({
  formData,
  handleChange,
  formErrors,
  passwordStrength,
  passwordFeedback,
  loading,
  disabled,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Password */}
      <motion.div  className="space-y-2">
        <Label htmlFor="password" className="text-gray-700">
          Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            // autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`pl-10 pr-10 border-gray-500 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
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
      <motion.div className="space-y-2">
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
  )
}
