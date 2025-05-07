/**
 * Utility functions for token management
 */

// Check if token is about to expire (within the next 5 minutes)
export const isTokenExpiringSoon = (token: string): boolean => {
    if (!token) return true
  
    try {
      // Extract the payload from the JWT
      const payload = JSON.parse(atob(token.split(".")[1]))
  
      // Check if the token has an expiration
      if (!payload.exp) return false
  
      // Calculate time until expiration in seconds
      const expiresIn = payload.exp - Math.floor(Date.now() / 1000)
  
      // Return true if token expires in less than 5 minutes
      return expiresIn < 300
    } catch (error) {
      console.error("Error checking token expiration:", error)
      return true
    }
  }
  
  // Extract user ID from token
  export const getUserIdFromToken = (token: string): string | null => {
    if (!token) return null
  
    try {
      // Extract the payload from the JWT
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.userId || payload.sub || null
    } catch (error) {
      console.error("Error extracting user ID from token:", error)
      return null
    }
  }
  
  // Get token expiration time in seconds
  export const getTokenExpirationTime = (token: string): number | null => {
    if (!token) return null
  
    try {
      // Extract the payload from the JWT
      const payload = JSON.parse(atob(token.split(".")[1]))
  
      // Check if the token has an expiration
      if (!payload.exp) return null
  
      return payload.exp
    } catch (error) {
      console.error("Error getting token expiration time:", error)
      return null
    }
  }
  