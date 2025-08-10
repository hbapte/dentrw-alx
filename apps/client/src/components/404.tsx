"use client"

import type React from "react"
import { PenToolIcon as Tool, Clock } from "lucide-react"

const MaintenancePage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
        <Tool className="h-12 w-12 text-blue-600" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-gray-900">We'll be back soon!</h1>
      <p className="mt-2 max-w-md text-lg text-gray-600">
        Our website is currently undergoing scheduled maintenance. We apologize for any inconvenience and appreciate
        your patience.
      </p>

      <div className="mt-8 flex items-center justify-center">
        <Clock className="mr-2 h-5 w-5 text-gray-500" />
        <p className="text-gray-500">
          Expected completion: <span className="font-medium">2 hours</span>
        </p>
      </div>

      <div className="mt-10 max-w-md">
        <h2 className="text-lg font-medium text-gray-900">Need immediate assistance?</h2>
        <p className="mt-2 text-gray-600">For urgent matters, please contact us directly:</p>
        <div className="mt-4 rounded-md bg-white p-4 shadow">
          <p className="font-medium text-gray-900">Emergency Contact</p>
          <p className="text-gray-600">(123) 456-7890</p>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
