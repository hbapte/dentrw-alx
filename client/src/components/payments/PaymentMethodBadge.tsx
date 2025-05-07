import type React from "react"
import { Badge } from "../ui/badge"
import { CreditCard, Wallet, DollarSign } from "lucide-react"

interface PaymentMethodBadgeProps {
  method: "stripe" | "MoMo" | "cash"
}

const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method }) => {
  const getMethodDetails = () => {
    switch (method) {
      case "stripe":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <CreditCard className="w-3 h-3 mr-1" />,
          label: "Credit Card",
        }
      case "MoMo":
        return {
          color: "bg-pink-100 text-pink-800 border-pink-200",
          icon: <Wallet className="w-3 h-3 mr-1" />,
          label: "Mobile Money",
        }
      case "cash":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <DollarSign className="w-3 h-3 mr-1" />,
          label: "Cash",
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: null,
          label: method,
        }
    }
  }

  const { color, icon, label } = getMethodDetails()

  return (
    <Badge className={`${color} font-medium flex items-center`}>
      {icon}
      {label}
    </Badge>
  )
}

export default PaymentMethodBadge
