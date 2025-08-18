"use client"

import type React from "react"
import { motion } from "framer-motion"

interface PasswordStrengthIndicatorProps {
  password: string
  strength: number
  feedback: string
}

export  const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  feedback,
}) => {
  if (!password) return null

  const getStrengthInfo = () => {
    const colors = [
      { bg: "bg-red-500", text: "text-red-600", label: "Very Weak" },
      { bg: "bg-orange-500", text: "text-orange-600", label: "Weak" },
      { bg: "bg-yellow-500", text: "text-yellow-600", label: "Fair" },
      { bg: "bg-green-500", text: "text-green-600", label: "Good" },
      { bg: "bg-green-600", text: "text-green-700", label: "Strong" },
    ]

    return colors[strength] || colors[0]
  }

  const strengthInfo = getStrengthInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strengthInfo.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength + 1) * 20}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <motion.span
          className={`text-xs font-medium ${strengthInfo.text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {strengthInfo.label}
        </motion.span>
      </div>

      {feedback && (
        <motion.p
          className="text-xs text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {feedback}
        </motion.p>
      )}
    </motion.div>
  )
}
