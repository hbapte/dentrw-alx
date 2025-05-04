"use client"

import type React from "react"
import { CheckCircle, X } from "lucide-react"

interface SuccessAlertProps {
  message: string
  onClose?: () => void
  className?: string
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onClose, className = "" }) => {
  if (!message) return null

  return (
    <div className={`bg-green-50 border-l-4 border-green-400 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-700">{message}</p>
        </div>
        {onClose && (
          <div className="pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-green-50 text-green-500 hover:text-green-700 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuccessAlert
