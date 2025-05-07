/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import type { PaymentState, PaymentFilterParams, PaymentFormData, Payment } from "../types/payment.types"
import paymentService from "../services/payment.service"

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  selectedPayment: null,
  patientPayments: [],
  appointmentPayments: [],
  outstandingPayments: [],
  paymentStats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  // Fetch all payments with pagination and filtering
  fetchPayments: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ loading: true, error: null })
      const { payments, pagination } = await paymentService.getAllPayments(page, limit, {
        ...get().filters,
        ...filters,
      })
      set({ payments, pagination, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to fetch payments",
      })
    }
  },

  // Fetch a payment by ID
  fetchPaymentById: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const payment = await paymentService.getPaymentById(id)
      set({ selectedPayment: payment, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to fetch payment",
      })
    }
  },

  // Fetch patient payment history
  fetchPatientPayments: async (patientId: string) => {
    try {
      set({ loading: true, error: null })
      const payments = await paymentService.getPatientPaymentHistory(patientId)
      set({ patientPayments: payments, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to fetch patient payments",
      })
    }
  },

  // Fetch appointment payments
  fetchAppointmentPayments: async (appointmentId: string) => {
    try {
      set({ loading: true, error: null })
      const payments = await paymentService.getPaymentsByAppointment(appointmentId)
      set({ appointmentPayments: payments, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to fetch appointment payments",
      })
    }
  },

  // Fetch outstanding payments
  fetchOutstandingPayments: async () => {
    try {
      set({ loading: true, error: null })
      const payments = await paymentService.getOutstandingPayments()
      set({ outstandingPayments: payments, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to fetch outstanding payments",
      })
    }
  },

  // Fetch payment statistics
  fetchPaymentStats: async (startDate?: string, endDate?: string) => {
    try {
      set({ loading: true, error: null })
      const stats = await paymentService.getPaymentStats(startDate, endDate)
      set({ paymentStats: stats, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to fetch payment statistics",
      })
    }
  },

  // Create a new payment
  createPayment: async (data: PaymentFormData) => {
    try {
      set({ loading: true, error: null })
      const result = await paymentService.createPayment(data)

      // Refresh payments list
      await get().fetchPayments()

      set({ loading: false })
      return result
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to create payment",
      })
      throw error
    }
  },

  // Update payment status
  updatePaymentStatus: async (id: string, status: Payment["status"], transactionId?: string, receiptUrl?: string) => {
    try {
      set({ loading: true, error: null })
      const payment = await paymentService.updatePaymentStatus(id, status, transactionId, receiptUrl)

      // Update the payment in the list
      set((state) => ({
        payments: state.payments.map((p) => (p._id === id ? payment : p)),
        selectedPayment: state.selectedPayment?._id === id ? payment : state.selectedPayment,
        loading: false,
      }))

      return payment
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to update payment status",
      })
      throw error
    }
  },

  // Process a refund
  processRefund: async (id: string, refundAmount: number, refundReason: string) => {
    try {
      set({ loading: true, error: null })
      const payment = await paymentService.processRefund(id, refundAmount, refundReason)

      // Update the payment in the list
      set((state) => ({
        payments: state.payments.map((p) => (p._id === id ? payment : p)),
        selectedPayment: state.selectedPayment?._id === id ? payment : state.selectedPayment,
        loading: false,
      }))

      return payment
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to process refund",
      })
      throw error
    }
  },

  // Generate invoice
  getInvoice: async (id: string, format = "pdf") => {
    try {
      set({ loading: true, error: null })
      const invoiceUrl = await paymentService.getInvoice(id, format)
      set({ loading: false })
      return invoiceUrl
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to generate invoice",
      })
      throw error
    }
  },

  // Generate receipt
  getReceipt: async (id: string, format = "pdf") => {
    try {
      set({ loading: true, error: null })
      const receiptUrl = await paymentService.getReceipt(id, format)
      set({ loading: false })
      return receiptUrl
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.error?.message || "Failed to generate receipt",
      })
      throw error
    }
  },

  // Set filters
  setFilters: (filters: Partial<PaymentFilterParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    })
  },

  // Set page
  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
    get().fetchPayments(page, get().pagination.pageSize)
  },

  // Clear selected payment
  clearSelectedPayment: () => {
    set({ selectedPayment: null })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
