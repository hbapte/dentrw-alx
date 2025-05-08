"use client"

import type React from "react"
import { useState,  } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import { loginSchema, type LoginSchema } from "../../validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "../ui/form"
// import { PasswordRequirements } from "./password-requirements"

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>
  loading: boolean
  error?: string
  disabled?: boolean
  disabledMessage?: string
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, disabled, disabledMessage,  }) => {
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

  // const password = form.watch("password")

  // Show password requirements when the password field is focused
  // useEffect(() => {
  //   const subscription = form.watch((value, { name }) => {
  //     if (name === "password" && value.password) {
  //       setShowPasswordRequirements(true)
  //     }
  //   })
  //   return () => subscription.unsubscribe()
  // }, [form.watch])

  const handleSubmit = async (data: LoginSchema) => {
    if (!disabled) {
      await onSubmit(data.email, data.password, rememberMe)
    }
  }

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* {error && <div className="bg-red-50 p-3 text-sm text-red-600 rounded-md">{error}</div>} */}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">Email address</FormLabel>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          autoComplete="email"
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="you@example.com"
                          disabled={loading || disabled}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-blue-500" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                    {/* {showPasswordRequirements && password && <PasswordRequirements password={password} />} */}
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={loading || disabled}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading || disabled || !form.formState.isValid}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
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
                "Sign in"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button type="button" variant="outline" className="w-full" disabled={loading || disabled} size="lg">
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
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LoginForm
