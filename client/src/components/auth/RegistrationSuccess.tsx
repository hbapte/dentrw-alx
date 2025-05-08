import type React from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

interface RegistrationSuccessProps {
  email: string
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ email }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl">Registration Successful!</CardTitle>
        <CardDescription className="text-center">Your account has been created successfully</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-100 p-4">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium">Verify your email address</h3>
        <p className="mt-2 text-gray-600">We've sent a verification email to:</p>
        <p className="mt-1 font-medium">{email}</p>
        <p className="mt-4 text-sm text-gray-600">
          Please check your inbox and click on the verification link to activate your account. If you don't see the
          email, check your spam folder.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button asChild className="w-full">
          <Link to="/login">Go to Login</Link>
        </Button>
        <p className="text-center text-sm text-gray-600">
          Didn't receive the email?{" "}
          <Link to="/resend-verification" state={{ email }} className="font-medium text-primary hover:underline">
            Resend verification email
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
