import type React from "react"

interface PasswordStrengthIndicatorProps {
  strength: number
  feedback: string
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength, feedback }) => {
  // Get password strength color and label
  const getPasswordStrengthInfo = () => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"]
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]

    return {
      color: colors[strength] || colors[0],
      label: labels[strength] || labels[0],
    }
  }

  const strengthInfo = getPasswordStrengthInfo()

  return (
    <div className="mt-2">
      <div className="flex items-center">
        <div className="h-2 flex-1 rounded-full bg-gray-200">
          <div className={`h-2 rounded-full ${strengthInfo.color}`} style={{ width: `${(strength + 1) * 20}%` }}></div>
        </div>
        <span className="ml-2 text-xs font-medium text-gray-500">{strengthInfo.label}</span>
      </div>
      {feedback && <p className="mt-1 text-xs text-gray-500">{feedback}</p>}
    </div>
  )
}
