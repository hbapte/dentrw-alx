import type React from "react"

interface LoaderProps {
  size?: "small" | "medium" | "large"
  color?: string
  className?: string
}

const Loader: React.FC<LoaderProps> = ({ size = "medium", color = "blue", className = "" }) => {
  const sizeMap = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-3",
    large: "h-12 w-12 border-4",
  }

  const colorMap = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    yellow: "border-yellow-500",
    purple: "border-purple-500",
    gray: "border-gray-500",
  }

  const sizeClass = sizeMap[size]
  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.blue

  return (
    <div className={`${className} flex items-center justify-center`}>
      <div className={`${sizeClass} animate-spin rounded-full border-t-transparent ${colorClass}`}></div>
    </div>
  )
}

export default Loader
