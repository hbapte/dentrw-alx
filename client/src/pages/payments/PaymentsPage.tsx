/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "../../components/ui/button"
import { usePaymentStore } from "../../store/payment-store"
import PaymentFilters from "../../components/payments/PaymentFilters"
import PaymentList from "../../components/payments/PaymentList"
import PaymentPagination from "../../components/payments/PaymentPagination"
import PageHeader from "../../components/ui/page-header"
import toast from "react-hot-toast"

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    payments,
    pagination,
    filters,
    loading,
    error,
    fetchPayments,
    setFilters,
    resetFilters,
    setPage,
    getInvoice,
    getReceipt,
  } = usePaymentStore()

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleViewPayment = (id: string) => {
    navigate(`/payments/${id}`)
  }

  const handleGenerateInvoice = async (id: string) => {
    try {
      const invoiceUrl = await getInvoice(id)
      window.open(invoiceUrl, "_blank")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invoice")
    }
  }

  const handleGenerateReceipt = async (id: string) => {
    try {
      const receiptUrl = await getReceipt(id)
      window.open(receiptUrl, "_blank")
    } catch (error: any) {
      toast.error( error.message || "Failed to generate receipt")
    }
  }

  const handlePageSizeChange = (pageSize: number) => {
    setPage(1)
    fetchPayments(1, pageSize)
  }

  const handleSearch = () => {
    setPage(1)
    fetchPayments(1, pagination.pageSize, filters)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Payments"
        description="Manage and track all payments"
        actions={
          <Button onClick={() => navigate("/payments/create")}>
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        }
      />

      <PaymentFilters
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        onSearch={handleSearch}
      />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading payments...</p>
        </div>
      ) : (
        <>
          <PaymentList
            payments={payments}
            onViewPayment={handleViewPayment}
            onGenerateInvoice={handleGenerateInvoice}
            onGenerateReceipt={handleGenerateReceipt}
          />

          <PaymentPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  )
}

export default PaymentsPage
