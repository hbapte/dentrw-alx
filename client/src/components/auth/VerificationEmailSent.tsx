"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"

interface VerificationEmailSentProps {
  email: string
}

export const VerificationEmailSent: React.FC<VerificationEmailSentProps> = ({ email }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="w-full backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="relative bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Verification Email Sent!
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              A new verification link has been sent to your email
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="relative bg-blue-100 p-4 rounded-full">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <h3 className="text-md font-semibold text-gray-900">Check your inbox</h3>
            <p className="text-gray-600">We've sent a verification email to:</p>
            <motion.div
              className="bg-gray-50 rounded-lg p-2 border"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="font-medium text-gray-900 break-all">{email}</p>
            </motion.div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Please check your inbox and click on the verification link to activate your account. If you don't see the
              email, check your spam folder.
            </p>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              asChild
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link to="/login" className="inline-flex items-center justify-center">
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.p
            className="text-center text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Need help?{" "}
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              <Link
                to="/contact"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Contact Support
              </Link>
            </motion.span>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
