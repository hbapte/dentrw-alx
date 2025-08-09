import type React from "react"
import { Badge } from "../../ui/badge"

interface PaymentStatusBadgeProps {
  status: "pending" | "completed" | "failed" | "refunded"
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusColor()} font-medium`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

export default PaymentStatusBadge
