import type React from "react"
import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
    </div>
  )
}

export default LoadingScreen
