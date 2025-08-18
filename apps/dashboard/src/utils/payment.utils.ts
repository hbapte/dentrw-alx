import type { Payment } from "../types/payment.types"
import { formatDate } from "./format-utils"


/**
 * Format payment method for display
 */
export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    stripe: "Stripe",
    MoMo: "Mobile Money",
    cash: "Cash",
    "mobile-money": "Mobile Money",
  }
  return methodMap[method] || method
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
}

/**
 * Get payment method color
 */
export function getPaymentMethodColor(method: string): string {
  const methodColors: Record<string, string> = {
    stripe: "bg-blue-100 text-blue-800 border-blue-200",
    MoMo: "bg-purple-100 text-purple-800 border-purple-200",
    cash: "bg-green-100 text-green-800 border-green-200",
    "mobile-money": "bg-purple-100 text-purple-800 border-purple-200",
  }
  return methodColors[method] || "bg-gray-100 text-gray-800 border-gray-200"
}


/**
 * Calculate payment statistics
 */
export function calculatePaymentStats(payments: Payment[]) {
  const stats = {
    total: payments.length,
    totalAmount: 0,
    completed: 0,
    completedAmount: 0,
    pending: 0,
    pendingAmount: 0,
    failed: 0,
    failedAmount: 0,
    refunded: 0,
    refundedAmount: 0,
    byMethod: {
      stripe: 0,
      MoMo: 0,
      cash: 0,
    },
  }

  payments.forEach((payment) => {
    stats.totalAmount += payment.amount

    switch (payment.status) {
      case "completed":
        stats.completed++
        stats.completedAmount += payment.amount
        break
      case "pending":
        stats.pending++
        stats.pendingAmount += payment.amount
        break
      case "failed":
        stats.failed++
        stats.failedAmount += payment.amount
        break
      case "refunded":
        stats.refunded++
        stats.refundedAmount += payment.refundAmount || payment.amount
        break
    }

    // Count by payment method
    if (payment.paymentMethod === "stripe") stats.byMethod.stripe++
    else if (payment.paymentMethod === "MoMo") stats.byMethod.MoMo++
    else if (payment.paymentMethod === "cash") stats.byMethod.cash++
  })

  return stats
}

/**
 * Get patient name from payment
 */
export function getPatientName(payment: Payment): string {
  if (typeof payment.patient === "object" && payment.patient?.user) {
    return payment.patient.user.names || "Unknown Patient"
  }
  return "Unknown Patient"
}

/**
 * Get patient email from payment
 */
export function getPatientEmail(payment: Payment): string {
  if (typeof payment.patient === "object" && payment.patient?.user) {
    return payment.patient.user.email || ""
  }
  return ""
}

/**
 * Get patient phone from payment
 */
export function getPatientPhone(payment: Payment): string {
  if (typeof payment.patient === "object" && payment.patient?.user) {
    return payment.patient.user.phoneNumber || ""
  }
  return ""
}

/**
 * Get appointment date from payment
 */
export function getAppointmentDate(payment: Payment): string {
  if (typeof payment.appointment === "object" && payment.appointment?.date) {
    return formatDate(payment.appointment.date)
  }
  return ""
}

/**
 * Get appointment type from payment
 */
export function getAppointmentType(payment: Payment): string {
  if (typeof payment.appointment === "object" && payment.appointment?.type) {
    return payment.appointment.type.charAt(0).toUpperCase() + payment.appointment.type.slice(1)
  }
  return ""
}

/**
 * Check if payment can be refunded
 */
export function canRefundPayment(payment: Payment): boolean {
  return payment.status === "completed" && !payment.refundAmount
}

/**
 * Check if payment has receipt
 */
export function hasReceipt(payment: Payment): boolean {
  return Boolean(payment.receiptUrl)
}

/**
 * Generate payment reference
 */
export function generatePaymentReference(payment: Payment): string {
  const date = new Date(payment.createdAt)
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const id = payment._id.slice(-6).toUpperCase()
  return `PAY-${year}${month}-${id}`
}

/**
 * Export payments to CSV format
 */
export function exportPaymentsToCSV(payments: Payment[]): string {
  const headers = [
    "Payment ID",
    "Reference",
    "Patient Name",
    "Patient Email",
    "Amount",
    "Currency",
    "Payment Method",
    "Status",
    "Transaction ID",
    "Appointment Date",
    "Appointment Type",
    "Created Date",
    "Refund Amount",
    "Refund Reason",
  ]

  const rows = payments.map((payment) => [
    payment._id,
    generatePaymentReference(payment),
    getPatientName(payment),
    getPatientEmail(payment),
    payment.amount.toString(),
    payment.currency,
    formatPaymentMethod(payment.paymentMethod),
    payment.status,
    payment.transactionId || "",
    getAppointmentDate(payment),
    getAppointmentType(payment),
    formatDate(payment.createdAt),
    payment.refundAmount?.toString() || "",
    payment.refundReason || "",
  ])

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
}

/**
 * Filter payments by search term
 */
export function filterPaymentsBySearch(payments: Payment[], searchTerm: string): Payment[] {
  if (!searchTerm.trim()) return payments

  const term = searchTerm.toLowerCase()
  return payments.filter((payment) => {
    const patientName = getPatientName(payment).toLowerCase()
    const patientEmail = getPatientEmail(payment).toLowerCase()
    const reference = generatePaymentReference(payment).toLowerCase()
    const transactionId = payment.transactionId?.toLowerCase() || ""
    const status = payment.status.toLowerCase()
    const method = formatPaymentMethod(payment.paymentMethod).toLowerCase()

    return (
      patientName.includes(term) ||
      patientEmail.includes(term) ||
      reference.includes(term) ||
      transactionId.includes(term) ||
      status.includes(term) ||
      method.includes(term)
    )
  })
}
