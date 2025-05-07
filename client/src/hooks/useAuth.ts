"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../store/auth-store"
import { useNavigate, useLocation } from "react-router-dom"

export function useAuth(requireAuth = true, redirectTo = "/login") {
  const { isAuthenticated, user, checkAuth, loading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true)
      const isAuthed = await checkAuth()

      if (requireAuth && !isAuthed) {
        // Redirect to login if authentication is required but user is not authenticated
        navigate(redirectTo, { state: { from: location } })
      } else if (!requireAuth && isAuthed) {
        // Redirect to dashboard if user is already authenticated and tries to access login/register
        navigate("/dashboard")
      }

      setIsChecking(false)
    }

    verifyAuth()
  }, [checkAuth, isAuthenticated, navigate, location, requireAuth, redirectTo])

  return {
    isAuthenticated,
    user,
    isLoading: loading || isChecking,
  }
}
