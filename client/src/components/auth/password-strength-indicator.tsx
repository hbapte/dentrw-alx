"use client"

import type React from "react"

import { motion } from "framer-motion"

interface PasswordStrengthIndicatorProps {
  strength: number
  feedback: string
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength, feedback }) => {
  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return "Very Weak"
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return "Very Weak"
    }
  }

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return "bg-red-500"
      case 1:
        return "bg-orange-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-green-500"
      case 4:
        return "bg-emerald-500"
      default:
        return "bg-red-500"
    }
  }

  const getStrengthTextColor = (score: number) => {
    switch (score) {
      case 0:
        return "text-red-700"
      case 1:
        return "text-orange-700"
      case 2:
        return "text-yellow-700"
      case 3:
        return "text-green-700"
      case 4:
        return "text-emerald-700"
      default:
        return "text-red-700"
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">Password strength:</span>
        <motion.span
          className={`text-xs font-semibold ${getStrengthTextColor(strength)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={getStrengthLabel(strength)}
        >
          {getStrengthLabel(strength)}
        </motion.span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getStrengthColor(strength)}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength + 1) * 20}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      {feedback && (
        <motion.p
          className="mt-1 text-xs text-gray-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {feedback}
        </motion.p>
      )}
    </div>
  )
}
