"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { ShieldAlert, Home } from "lucide-react"

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <ShieldAlert className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-center text-lg text-gray-600">You don't have permission to access this page.</p>
      <div className="mt-8 flex space-x-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Home className="mr-2 h-5 w-5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default UnauthorizedPage
