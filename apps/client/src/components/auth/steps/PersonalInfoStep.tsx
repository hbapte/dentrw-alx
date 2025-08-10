// client/src/components/auth/steps/PersonalInfoStep.tsx
"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Phone, Loader, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { containerVariants, itemVariants } from "@/constants/animations"
import type { RegisterFormData } from "@/store/register-form-store"

interface PersonalInfoStepProps {
  formData: RegisterFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  formErrors: Record<string, string>
  usernameAvailability: {
    isChecking: boolean
    isAvailable: boolean | null
    message: string
  }
  loading: boolean
  disabled: boolean | undefined
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  handleChange,
  formErrors,
  usernameAvailability,
  loading,
  disabled,
}) => {
  return (
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
          {usernameAvailability.isAvailable === true && formData.username && formData.username.length >= 3 && (
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
            value={formData.username || ""} // Ensure it's a controlled component
            onChange={handleChange}
            className={`pl-10 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg ${
              formErrors.username ? "border-red-300" : ""
            } ${usernameAvailability.isAvailable === true && formData.username && formData.username.length >= 3 ? "border-green-300 " : ""}`}
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
          {usernameAvailability.isAvailable === true && formData.username && formData.username.length >= 3 && (
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
  )
}
