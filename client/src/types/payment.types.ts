/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Patient } from "./patient.types"
import type { Appointment } from "./appointment.types"

export interface Payment {
  _id: string
  id?: string
  appointment: string | Appointment
  patient: string | Patient
  amount: number
  currency: string
  paymentMethod: "stripe" | "MoMo" | "cash"
  status: "pending" | "completed" | "failed" | "refunded"
  transactionId?: string | null
  receiptUrl?: string | null
  refundAmount?: number
  refundReason?: string
  refundDate?: string
  metadata?: {
    serviceName?: string
    serviceId?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentFormData {
  appointmentId: string
  patientId: string
  serviceId?: string
  amount?: number
  currency?: string
  paymentMethod: "stripe" | "MoMo" | "cash"
  metadata?: {
    [key: string]: any
  }
}

export interface PaymentFilterParams {
  sortBy?: string
  sortOrder?: "asc" | "desc"
  patientId?: string
  appointmentId?: string
  doctorId?: string
  status?: "pending" | "completed" | "failed" | "refunded"
  paymentMethod?: "stripe" | "MoMo" | "cash"
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

// API Response format for payment statistics
export interface PaymentStatsApiResponse {
  totalRevenue: number
  paymentMethods: {
    stripe: {
      count: number
      amount: number
      percentage: number
    }
    cash?: {
      count: number
      amount: number
      percentage: number
    }
    paypal?: {
      count: number
      amount: number
      percentage: number
    }
    MoMo?: {
      count: number
      amount: number
      percentage: number
    }
  }
  statuses: {
    failed: {
      count: number
      amount: number
    }
    refunded: {
      count: number
      amount: number
    }
    pending: {
      count: number
      amount: number
    }
    completed: {
      count: number
      amount: number
    }
  }
  dailyRevenue: {
    _id: string
    total: number
    count: number
  }[]
  averagePaymentAmount: number
  refundStats: {
    totalRefunded: number
    count: number
    averageRefund: number | null
  }
}

// Legacy PaymentStats interface for backward compatibility
export interface PaymentStats {
  totalPayments: number
  totalAmount: number
  completedPayments: number
  completedAmount: number
  pendingPayments: number
  pendingAmount: number
  failedPayments: number
  refundedPayments: number
  refundedAmount: number
  paymentsByMethod: {
    stripe: number
    MoMo: number
    cash: number
  }
  paymentsByPeriod: {
    daily: {
      date: string
      count: number
      amount: number
    }[]
    monthly: {
      month: string
      count: number
      amount: number
    }[]
  }
}

export interface PaymentState {
  payments: Payment[]
  selectedPayment: Payment | null
  patientPayments: Payment[]
  appointmentPayments: Payment[]
  outstandingPayments: Payment[]
  paymentStats: PaymentStatsApiResponse | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: PaymentFilterParams

  // Actions
  fetchPayments: (page?: number, limit?: number, filters?: PaymentFilterParams) => Promise<void>
  fetchPaymentById: (id: string) => Promise<void>
  fetchPatientPayments: (patientId: string) => Promise<void>
  fetchAppointmentPayments: (appointmentId: string) => Promise<void>
  fetchOutstandingPayments: () => Promise<void>
  fetchPaymentStats: (startDate?: string, endDate?: string) => Promise<void>
  createPayment: (data: PaymentFormData) => Promise<{ payment: Payment; invoiceUrl?: string }>
  updatePaymentStatus: (
    id: string,
    status: Payment["status"],
    transactionId?: string,
    receiptUrl?: string,
  ) => Promise<Payment>
  processRefund: (id: string, refundAmount: number, refundReason: string) => Promise<Payment>
  getInvoice: (id: string, format?: string) => Promise<string>
  getReceipt: (id: string, format?: string) => Promise<string>

  // Filter and pagination actions
  setFilters: (filters: Partial<PaymentFilterParams>) => void
  resetFilters: () => void
  setPage: (page: number) => void

  // Utility actions
  clearSelectedPayment: () => void
  clearError: () => void
}
