"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import { loginSchema, type LoginSchema } from "../../validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "../ui/form"
import { motion } from "framer-motion"
// import { PasswordRequirements } from "./password-requirements"

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>
  loading: boolean
  error?: string
  disabled?: boolean
  disabledMessage?: string
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, disabled, disabledMessage }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  // const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)


  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const handleSubmit = async (data: LoginSchema) => {
    if (!disabled) {
      await onSubmit(data.email, data.password, rememberMe)
    }
  }


  // const password = form.watch("password")

  // // Show password requirements when the password field is focused  
  // useEffect(() => {  
  //   const subscription = form.watch((value, { name }) => {  
  //     if (name === "password" && value.password) {  
  //       setShowPasswordRequirements(true)  
  //     }  
  //   })  
  //   return () => subscription.unsubscribe()  
  // }, [form.watch])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.97 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full md:min-w-[28rem]  border-1 overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl rounded-xl">
        <CardContent className="px-8 py-3">
          <Form {...form}>
            <motion.form
              className="space-y-5"
              onSubmit={form.handleSubmit(handleSubmit)}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email address
                      </FormLabel>
                      <div className="relative group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            className="pl-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                            placeholder="you@example.com"
                            disabled={loading || disabled}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Password
                        </FormLabel>
                        <motion.div
                          className="text-xs"

                        >
                          <Link to="/forgot-password" className="font-medium hover:underline   text-blue-600 hover:text-blue-700 transition-colors">
                            Forgot password?
                          </Link>
                        </motion.div>
                      </div>
                      <div className="relative group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="pl-10 pr-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                            placeholder="••••••••"
                            disabled={loading || disabled}
                          // onFocus={() => setShowPasswordRequirements(true)}                      
                          // onBlur={() => {                          
                          //   // Only hide requirements if there are no errors                        
                          //   if (!form.formState.errors.password) {                         
                          //     setShowPasswordRequirements(false)                        
                          //   }                    
                          // }}
                          />
                        </FormControl>
                        <motion.button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-5 w-5" aria-hidden="true" />
                          )}
                        </motion.button>
                      </div>
                      <FormMessage className="text-xs" />


                      {/* {showPasswordRequirements && password && <PasswordRequirements password={password} />}  */}


                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading || disabled}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4 transition-all"
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading || disabled || !form.formState.isValid}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  variants={buttonVariants}
                  initial="idle"
               
                  whileTap="tap"
                >
                  {loading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : disabled && disabledMessage ? (
                    disabledMessage
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3">
                <motion.button
                  type="button"
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={loading || disabled}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                  Sign in with Google
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center text-sm">
                <span className="text-gray-600">Don't have an account?</span>{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Sign up
                  </Link>
                </motion.span>
              </motion.div>
            </motion.form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default LoginForm
