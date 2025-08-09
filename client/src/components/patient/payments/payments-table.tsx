"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import type { Payment } from "../../../types/payment.types"
import {
  formatCurrency,
  formatPaymentMethod,
  getPaymentStatusColor,
  getPaymentMethodColor,
  formatDateTime,
  getPatientName,
  getPatientEmail,
  getPatientPhone,
  getAppointmentDate,
  getAppointmentType,
  generatePaymentReference,
  canRefundPayment,
  hasReceipt,
} from "../../../utils/payment.utils"
import { PaymentRowActions } from "./payment-row-actions"
import { Receipt, FileText, AlertCircle } from "lucide-react"

interface PaymentsTableProps {
  payments: Payment[]
  loading?: boolean
  onRefresh?: () => void
  onPaymentUpdate?: () => void
}

export function PaymentsTable({ payments, loading, onRefresh, onPaymentUpdate }: PaymentsTableProps) {
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
 
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => {
          const payment = row.original
          const reference = generatePaymentReference(payment)
          return <div className="font-mono text-sm">{reference}</div>
        },
        size: 120,
      },
      {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => {
          const payment = row.original
          const patientName = getPatientName(payment)
          const patientEmail = getPatientEmail(payment)
          const patientPhone = getPatientPhone(payment)

          let avatarSrc = ""
          if (typeof payment.patient === "object" && payment.patient?.user?.picture) {
            avatarSrc = payment.patient.user.picture
          }

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={patientName} />
                <AvatarFallback className="text-xs">
                  {patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{patientName}</div>
                <div className="text-xs text-muted-foreground truncate">{patientEmail}</div>
                {patientPhone && <div className="text-xs text-muted-foreground">{patientPhone}</div>}
              </div>
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const payment = row.original
          return (
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</div>
              {payment.refundAmount && (
                <div className="text-xs text-red-600">
                  Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                </div>
              )}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => {
          const payment = row.original
          const method = formatPaymentMethod(payment.paymentMethod)
          const colorClass = getPaymentMethodColor(payment.paymentMethod)

          return (
            <Badge variant="outline" className={colorClass}>
              {method}
            </Badge>
          )
        },
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const payment = row.original
          const colorClass = getPaymentStatusColor(payment.status)

          return (
            <Badge variant="outline" className={colorClass}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </Badge>
          )
        },
        size: 100,
      },
      {
        accessorKey: "appointment",
        header: "Appointment",
        cell: ({ row }) => {
          const payment = row.original
          const appointmentDate = getAppointmentDate(payment)
          const appointmentType = getAppointmentType(payment)

          return (
            <div className="text-sm">
              {appointmentDate && <div className="font-medium">{appointmentDate}</div>}
              {appointmentType && <div className="text-muted-foreground">{appointmentType}</div>}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: "transactionId",
        header: "Transaction ID",
        cell: ({ row }) => {
          const payment = row.original
          return (
            <div className="font-mono text-xs">
              {payment.transactionId || <span className="text-muted-foreground">—</span>}
            </div>
          )
        },
        size: 150,
      },
      {
        accessorKey: "documents",
        header: "Documents",
        cell: ({ row }) => {
          const payment = row.original
          const hasReceiptDoc = hasReceipt(payment)
          const canRefund = canRefundPayment(payment)

          return (
            <div className="flex items-center gap-1">
              {hasReceiptDoc && <Receipt className="h-4 w-4 text-green-600" title="Receipt available" />}
              {payment.status === "completed" && (
                <FileText className="h-4 w-4 text-blue-600" title="Invoice available" />
              )}
              {canRefund && <AlertCircle className="h-4 w-4 text-yellow-600" title="Refundable" />}
            </div>
          )
        },
        size: 100,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const payment = row.original
          return <div className="text-sm text-muted-foreground">{formatDateTime(payment.createdAt)}</div>
        },
        size: 150,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const payment = row.original
          return <PaymentRowActions payment={payment} onUpdate={onPaymentUpdate} />
        },
        size: 60,
      },
    ],
    [onPaymentUpdate],
  )

  const filterConfigs = useMemo(
    () => [
      {
        columnId: "status",
        label: "Status",
        options: [
          { value: "completed", label: "Completed" },
          { value: "pending", label: "Pending" },
          { value: "failed", label: "Failed" },
          { value: "refunded", label: "Refunded" },
        ],
      },
      {
        columnId: "paymentMethod",
        label: "Payment Method",
        options: [
          { value: "stripe", label: "Stripe" },
          { value: "MoMo", label: "Mobile Money" },
          { value: "cash", label: "Cash" },
        ],
      },
    ],
    [],
  )

  if (loading) {
    return <DataTableSkeleton columns={11} rows={10} />
  }

  return (
    <DataTable
      data={payments}
      columns={columns}
      searchColumnId="patient"
      searchPlaceholder="Search by patient name, email, or reference..."
      filterConfigs={filterConfigs}
      onRefresh={onRefresh}
      enableSelection={true}
      enableBulkDelete={false}
      emptyMessage="No payments found."
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 25, 50, 100]}
    />
  )
}
