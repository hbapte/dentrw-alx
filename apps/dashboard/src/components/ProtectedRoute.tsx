"use client"

import type React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/auth-store"
import Loader from "./ui/Loader"

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If roles are specified and user doesn't have permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // If user is authenticated and authorized, render the child routes
  return <Outlet />
}

export default ProtectedRoute
