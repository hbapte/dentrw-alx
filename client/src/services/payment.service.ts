import api from "./api"
import type { Payment, PaymentFormData, PaymentStats, PaymentFilterParams } from "../types/payment.types"

/**
 * Service for handling payment-related API calls
 */
class PaymentService {
  /**
   * Get all payments with pagination and filtering
   */
  async getAllPayments(
    page = 1,
    limit = 10,
    filters: PaymentFilterParams = {},
  ): Promise<{
    payments: Payment[]
    pagination: {
      page: number
      pageSize: number
      totalItems: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.appointmentId && { appointmentId: filters.appointmentId }),
      ...(filters.doctorId && { doctorId: filters.doctorId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.minAmount && { minAmount: filters.minAmount.toString() }),
      ...(filters.maxAmount && { maxAmount: filters.maxAmount.toString() }),
    })

    const response = await api.get(`/payments?${queryParams.toString()}`)
    return {
      payments: response.data.data,
      pagination: response.data.metadata.pagination,
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`)
    return response.data.data.payment
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentData: PaymentFormData): Promise<{
    payment: Payment
    invoiceUrl?: string
  }> {
    const response = await api.post("/payments", paymentData)
    return response.data.data
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string,
    status: "pending" | "completed" | "failed" | "refunded",
    transactionId?: string,
    receiptUrl?: string,
  ): Promise<Payment> {
    const response = await api.patch(`/payments/${id}/status`, {
      status,
      ...(transactionId && { transactionId }),
      ...(receiptUrl && { receiptUrl }),
    })
    return response.data.data.payment
  }

  /**
   * Process a refund
   */
  async processRefund(id: string, refundAmount: number, refundReason: string): Promise<Payment> {
    const response = await api.post(`/payments/${id}/refund`, {
      refundAmount,
      refundReason,
    })
    return response.data.data.payment
  }

  /**
   * Generate invoice
   */
  async getInvoice(id: string, format = "pdf"): Promise<string> {
    const response = await api.get(`/payments/${id}/invoice?format=${format}`)
    return response.data.data.invoiceUrl
  }

  /**
   * Generate receipt
   */
  async getReceipt(id: string, format = "pdf"): Promise<string> {
    const response = await api.get(`/payments/${id}/receipt?format=${format}`)
    return response.data.data.receiptUrl
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(startDate?: string, endDate?: string): Promise<PaymentStats> {
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })

    const response = await api.get(`/payments/stats?${queryParams.toString()}`)
    return response.data.data
  }

  /**
   * Get patient payment history
   */
  async getPatientPaymentHistory(patientId: string): Promise<Payment[]> {
    const response = await api.get(`/payments/patient/${patientId}`)
    return response.data.data.payments
  }

  /**
   * Get outstanding payments
   */
  async getOutstandingPayments(): Promise<Payment[]> {
    const response = await api.get("/payments/outstanding")
    return response.data.data.payments
  }

  /**
   * Get payments by appointment
   */
  async getPaymentsByAppointment(appointmentId: string): Promise<Payment[]> {
    const response = await api.get(`/payments/appointment/${appointmentId}`)
    return response.data.data.payments
  }
}

export default new PaymentService()
