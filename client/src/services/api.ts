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

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)


// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Logout user on auth error
      const { logout } = useAuthStore.getState()
      logout()

      // Redirect to login
      window.location.href = "/login"
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
