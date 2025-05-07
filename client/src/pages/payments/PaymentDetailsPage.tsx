"use client"

import type React from "react"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { usePaymentStore } from "../../store/payment-store"
import PaymentDetails from "../../components/payments/PaymentDetails"
import PageHeader from "../../components/ui/page-header"

const PaymentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { selectedPayment, loading, error, fetchPaymentById, clearSelectedPayment } = usePaymentStore()

  useEffect(() => {
    if (id) {
      fetchPaymentById(id)
    }

    return () => {
      clearSelectedPayment()
    }
  }, [id, fetchPaymentById, clearSelectedPayment])

  const handleRefresh = () => {
    if (id) {
      fetchPaymentById(id)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Payment Details" description="View and manage payment information" />

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading payment details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      ) : selectedPayment ? (
        <PaymentDetails payment={selectedPayment} onRefresh={handleRefresh} />
      ) : (
        <div className="text-center py-8 text-gray-500">Payment not found</div>
      )}
    </div>
  )
}

export default PaymentDetailsPage
