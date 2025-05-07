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


// Add response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh the token
        const refreshed = await useAuthStore.getState().refreshToken()
        
        if (refreshed) {
          // If refresh was successful, retry the original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
        // If refresh fails, logout the user
        await useAuthStore.getState().logout()
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
