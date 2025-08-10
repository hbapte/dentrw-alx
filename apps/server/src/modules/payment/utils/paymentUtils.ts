import Payment from "../../../database/models/payment"
import { format } from "date-fns"

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXX (where XXXX is a sequential number)
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  const today = new Date()
  const dateStr = format(today, "yyyyMMdd")

  // Find the highest invoice number for today
  const latestPayment = await Payment.findOne(
    { invoiceNumber: { $regex: `^INV-${dateStr}` } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } },
  )

  let sequentialNumber = 1

  if (latestPayment && latestPayment.invoiceNumber) {
    // Extract the sequential number from the latest invoice number
    const match = latestPayment.invoiceNumber.match(/INV-\d{8}-(\d{4})/)
    if (match && match[1]) {
      sequentialNumber = Number.parseInt(match[1], 10) + 1
    }
  }

  // Format the sequential number with leading zeros
  const sequentialStr = sequentialNumber.toString().padStart(4, "0")

  return `INV-${dateStr}-${sequentialStr}`
}

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency = "RWF"): string => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate tax amount
 */
export const calculateTax = (amount: number, taxRate = 0.18): number => {
  return amount * taxRate
}

/**
 * Calculate total amount with tax
 */
export const calculateTotalWithTax = (amount: number, taxRate = 0.18): number => {
  return amount + calculateTax(amount, taxRate)
}

/**
 * Generate a payment reference
 */
export const generatePaymentReference = (paymentId: string, timestamp: Date = new Date()): string => {
  const dateStr = format(timestamp, "yyyyMMddHHmmss")
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()

  return `PAY-${dateStr}-${randomStr}-${paymentId.substring(0, 6)}`
}

/**
 * Validate payment amount against appointment cost
 */
export const validatePaymentAmount = (paymentAmount: number, appointmentCost: number): boolean => {
  // Allow a small tolerance for floating point errors
  const tolerance = 0.01
  return Math.abs(paymentAmount - appointmentCost) <= tolerance
}

/**
 * Get payment status color
 * Used for UI display
 */
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "green"
    case "pending":
      return "orange"
    case "failed":
      return "red"
    case "refunded":
      return "blue"
    default:
      return "gray"
  }
}

/**
 * Get payment method icon
 * Used for UI display
 */
export const getPaymentMethodIcon = (method: string): string => {
  switch (method) {
    case "stripe":
      return "credit-card"
    case "MoMo":
      return "smartphone"
    case "cash":
      return "dollar-sign"
    default:
      return "circle"
  }
}
