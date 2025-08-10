"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"

interface ForgotPasswordSuccessProps {
  email: string
}

export const ForgotPasswordSuccess: React.FC<ForgotPasswordSuccessProps> = ({ email }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="w-full backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-green-500/20 rounded-full blur-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="relative rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              We've sent a password reset link to your email
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="relative rounded-full bg-blue-100 p-3">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-1"
          >
            <h3 className="text-lg font-medium text-gray-900">Reset link sent</h3>
            <p className="text-gray-600">We've sent a password reset link to:</p>
            <p className="font-medium text-blue-600 break-all">{email}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600"
          >
            <p>
              Please check your inbox and click on the reset link to create a new password. If you don't see the email,
              check your spam folder.
            </p>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              asChild
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-gray-600"
          >
            Didn't receive the email?{" "}
            <button className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Resend link
            </button>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
