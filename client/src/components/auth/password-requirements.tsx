import { Check, X } from "lucide-react"

interface PasswordRequirementProps {
  meets: boolean
  text: string
}

const PasswordRequirement = ({ meets, text }: PasswordRequirementProps) => (
  <div className="flex items-center space-x-2">
    {meets ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
    <span className={meets ? "text-green-700" : "text-red-700"}>{text}</span>
  </div>
)

interface PasswordRequirementsProps {
  password: string
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements = [
    { meets: password.length >= 8, text: "At least 8 characters" },
    { meets: /[A-Z]/.test(password), text: "Contains uppercase letter" },
    { meets: /[a-z]/.test(password), text: "Contains lowercase letter" },
    { meets: /\d/.test(password), text: "Contains a number" },
    { meets: /[^a-zA-Z0-9]/.test(password), text: "Contains a special character" },
    { meets: password.length <= 16, text: "Maximum 16 characters" },
  ]

  return (
    <div className="mt-2 space-y-1 text-xs">
      {requirements.map((req, index) => (
        <PasswordRequirement key={index} meets={req.meets} text={req.text} />
      ))}
    </div>
  )
}
