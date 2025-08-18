/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PaymentStatsCards } from "./payments-stats-cards"
import { PaymentsTable } from "./payments-table"
import { PaymentExportDialog } from "./payment-export-dialog"
import { usePayments, usePaymentStats } from "@/hooks/use-payments"

export function ReceptionistPaymentsPageComponent() {
  const { payments, loading, refreshPayments } = usePayments()
  const { stats, loading: statsLoading } = usePaymentStats()
  const [selectedPayments, setSelectedPayments] = useState<any[]>([])

  const handlePaymentUpdate = () => {
    refreshPayments()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage and track all payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentExportDialog payments={payments} selectedPayments={selectedPayments} />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <PaymentStatsCards stats={stats} loading={statsLoading} />

      {/* Payments Table */}
      <PaymentsTable
        payments={payments}
        loading={loading}
        onRefresh={refreshPayments}
        onPaymentUpdate={handlePaymentUpdate}
      />
    </div>
  )
}
