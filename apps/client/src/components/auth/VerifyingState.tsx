"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../ui/card"

export const VerifyingState: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mb-6"
          >
            <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-medium text-gray-900 mb-2"
          >
            Verifying your email...
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-center"
          >
            Please wait while we verify your email address
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
