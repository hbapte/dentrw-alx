"use client"

import type React from "react"
import { AlertCircle, X } from "lucide-react"

interface ErrorAlertProps {
  message: string
  onClose?: () => void
  className?: string
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose, className = "" }) => {
  if (!message) return null

  return (
    <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onClose && (
          <div className="pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-50 text-red-500 hover:text-red-700 focus:outline-none"
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

export default ErrorAlert
