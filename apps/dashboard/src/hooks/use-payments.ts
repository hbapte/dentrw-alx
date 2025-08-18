"use client"

import { useState, useEffect, useCallback } from "react"
import PaymentService from "../services/payment.service"
import type { Payment, PaymentFilterParams, PaymentStatsApiResponse } from "../types/payment.types"
import { toast } from "sonner"

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  const fetchPayments = useCallback(async (page = 1, limit = 10, filters: PaymentFilterParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await PaymentService.getAllPayments(page, limit, filters)
      setPayments(response.payments)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payments"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshPayments = useCallback(() => {
    fetchPayments(pagination.page, pagination.pageSize)
  }, [fetchPayments, pagination.page, pagination.pageSize])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return {
    payments,
    loading,
    error,
    pagination,
    fetchPayments,
    refreshPayments,
  }
}

export function usePaymentStats() {
  const [stats, setStats] = useState<PaymentStatsApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await PaymentService.getPaymentStats(startDate, endDate)
      setStats(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payment statistics"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}

export function usePaymentActions() {
  const [loading, setLoading] = useState(false)

  const updatePaymentStatus = useCallback(
    async (id: string, status: Payment["status"], transactionId?: string, receiptUrl?: string) => {
      setLoading(true)
      try {
        const updatedPayment = await PaymentService.updatePaymentStatus(id, status, transactionId, receiptUrl)
        toast.success("Payment status updated successfully")
        return updatedPayment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update payment status"
        toast.error(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const processRefund = useCallback(async (id: string, refundAmount: number, refundReason: string) => {
    setLoading(true)
    try {
      const updatedPayment = await PaymentService.processRefund(id, refundAmount, refundReason)
      toast.success("Refund processed successfully")
      return updatedPayment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process refund"
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getInvoice = useCallback(async (id: string, format = "pdf") => {
    setLoading(true)
    try {
      const invoiceUrl = await PaymentService.getInvoice(id, format)
      toast.success("Invoice generated successfully")
      return invoiceUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate invoice"
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReceipt = useCallback(async (id: string, format = "pdf") => {
    setLoading(true)
    try {
      const receiptUrl = await PaymentService.getReceipt(id, format)
      toast.success("Receipt generated successfully")
      return receiptUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate receipt"
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    updatePaymentStatus,
    processRefund,
    getInvoice,
    getReceipt,
  }
}
