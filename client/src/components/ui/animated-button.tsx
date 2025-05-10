"use client"

import type React from "react"

import { motion } from "framer-motion"
import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "../../lib/utils"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, variant = "primary", size = "md", isLoading = false, loadingText, icon, ...props }, ref) => {
    // Button variants
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    }

    // Button sizes
    const sizes = {
      sm: "py-1.5 px-3 text-sm",
      md: "py-2 px-4 text-sm",
      lg: "py-3 px-5 text-base",
    }

    // Animation variants
    const buttonVariants = {
      idle: { scale: 1 },
      hover: {
        scale: 1.03,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      tap: { scale: 0.97 },
      disabled: { opacity: 0.7 },
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center",
          variants[variant],
          sizes[size],
          isLoading && "cursor-not-allowed",
          className,
        )}
        variants={buttonVariants}
        initial="idle"
        whileHover={!isLoading && !props.disabled ? "hover" : "disabled"}
        whileTap={!isLoading && !props.disabled ? "tap" : "disabled"}
        disabled={isLoading || props.disabled}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || "Loading..."}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </motion.button>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
