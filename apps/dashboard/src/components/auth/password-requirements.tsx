"use client"

import { Check, X } from "lucide-react"
import { motion } from "framer-motion"

interface PasswordRequirementProps {
  meets: boolean
  text: string
}

const PasswordRequirement = ({ meets, text }: PasswordRequirementProps) => (
  <motion.div
    className="flex items-center space-x-2"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2 }}
  >
    {meets ? (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <Check className="h-4 w-4 text-green-500" />
      </motion.div>
    ) : (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <X className="h-4 w-4 text-red-500" />
      </motion.div>
    )}
    <span className={meets ? "text-green-700 text-xs" : "text-red-700 text-xs"}>{text}</span>
  </motion.div>
)

interface PasswordRequirementsProps {
  password: string
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements = [
    { meets: password.length >= 8, text: "At least 8 characters" },
    { meets: /[A-Z]/.test(password), text: "Contains uppercase letter" },
    { meets: /[a-z]/.test(password), text: "Contains lowercase letter" },
    { meets: /\d/.test(password), text: "Contains a number" },
    { meets: /[^a-zA-Z0-9]/.test(password), text: "Contains a special character" },
    { meets: password.length <= 16, text: "Maximum 16 characters" },
  ]

  return (
    <motion.div
      className="mt-2 space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-xs font-medium text-gray-700 mb-1">Password requirements:</div>
      {requirements.map((req, index) => (
        <PasswordRequirement key={index} meets={req.meets} text={req.text} />
      ))}
    </motion.div>
  )
}
