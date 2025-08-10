"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"

interface RegistrationSuccessProps {
  email: string
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ email }) => {
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

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.3 },
    },
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.97 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full border-0 overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl rounded-xl">
        <CardHeader>
          <motion.div className="flex justify-center mb-2" variants={iconVariants} initial="hidden" animate="visible">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-center text-2xl bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Registration Successful!
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-center">Your account has been created successfully</CardDescription>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent className="text-center">
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
          >
            <div className="rounded-full bg-blue-100 p-4">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h3 variants={itemVariants} className="text-lg font-medium">
              Verify your email address
            </motion.h3>
            <motion.p variants={itemVariants} className="mt-2 text-gray-600">
              We've sent a verification email to:
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mt-1 font-medium bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              {email}
            </motion.p>
            <motion.p variants={itemVariants} className="mt-4 text-sm text-gray-600">
              Please check your inbox and click on the verification link to activate your account. If you don't see the
              email, check your spam folder.
            </motion.p>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6">
          <motion.div variants={buttonVariants} initial="idle" whileHover="hover" whileTap="tap" className="w-full">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Link to="/login">Go to Login</Link>
            </Button>
          </motion.div>
          <motion.p
            className="text-center text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Didn't receive the email?{" "}
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                to="/resend-verification"
                state={{ email }}
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Resend verification email
              </Link>
            </motion.span>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
