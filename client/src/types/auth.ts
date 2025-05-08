/* eslint-disable @typescript-eslint/no-explicit-any */

export interface User {
    id: string
    names: string
    email: string
    username?: string
    role: string
    picture?: string
    preferredLanguage?: string
    phoneNumber?: string
    emailVerified?: boolean
    phoneVerified?: boolean
    totpEnabled?: boolean
    lastLogin?: string
  }


export interface LoginData {
    email?: string
    password?: string
    userId?: string
    token?: string
    twoFactorCode?: string
    tempToken?: string
    rememberMe?: boolean
  }
  
  export interface RegisterData {
    names: string
    email: string
    password: string
    confirmPassword?: string
    username?: string
    phoneNumber?: string
    preferredLanguage?: string
  }
  
  export interface AuthError {
    status?: number
    message?: string
    details?: any
    data?: any
    code?: string
    help?: string
    error?: {
      code: string
      message: string
      details?: any
      help?: string
    }
    debug?: any
  }