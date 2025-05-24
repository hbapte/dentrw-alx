"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"

export const ResetPasswordSuccess: React.FC = () => {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Password Reset Successful!
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Your password has been updated successfully
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 rounded-lg p-4"
          >
            <p className="text-green-800 font-medium">🎉 Your password has been reset successfully!</p>
            <p className="text-green-700 text-sm mt-1">You can now log in with your new password.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 rounded-lg p-4"
          >
            <p className="text-blue-800 text-sm">
              You will be redirected to the login page in{" "}
              <motion.span
                key={countdown}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-bold text-blue-600"
              >
                {countdown}
              </motion.span>{" "}
              seconds
            </p>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              asChild
              className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Link to="/login">
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
