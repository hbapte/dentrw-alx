/* eslint-disable @typescript-eslint/no-explicit-any */
// client\src\services\api.ts
import axios from "axios"
import { useAuthStore } from "../store/auth-store"

// Create an axios instance with default config
const api = axios.create({
  baseURL:  import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a flag to track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false
// Store failed requests to retry them after token refresh
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = []

// Process the failed queue
const processQueue = (error: unknown, token: boolean | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Add response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're not already refreshing
      if (!isRefreshing) {
        originalRequest._retry = true
        isRefreshing = true

        try {
          // Try to refresh the token
          const refreshed = await useAuthStore.getState().refreshToken()

          if (refreshed) {
            // If refresh was successful, process queue and retry the original request
            processQueue(null, refreshed)
            isRefreshing = false
            return api(originalRequest)
          } else {
            // If refresh failed, reject all queued requests and logout
            processQueue(new Error("Refresh failed"), null)
            await useAuthStore.getState().logout()
            isRefreshing = false
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError)
          // If refresh fails, logout the user and reject all queued requests
          processQueue(refreshError, null)
          await useAuthStore.getState().logout()
          isRefreshing = false
        }
      } else {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }
    }

    return Promise.reject(error)
  },
)

export default api
