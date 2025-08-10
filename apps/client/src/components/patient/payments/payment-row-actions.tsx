"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Copy, FileText, Receipt, RefreshCw, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Payment } from "../../../types/payment.types"
import { PaymentDetailsDialog } from "./payment-details-dialog"
import { RefundPaymentDialog } from "./refund-payment-dialog"
import { DeletePaymentDialog } from "./delete-payment-dialog"
import { generatePaymentReference, canRefundPayment, hasReceipt } from "../../../utils/payment.utils"
import { usePaymentActions } from "../../../hooks/use-payments"

interface PaymentRowActionsProps {
  payment: Payment
  onUpdate?: () => void
}

export function PaymentRowActions({ payment, onUpdate }: PaymentRowActionsProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const { getInvoice, getReceipt, loading } = usePaymentActions()

  const canRefund = canRefundPayment(payment)
  const hasReceiptDoc = hasReceipt(payment)
  const reference = generatePaymentReference(payment)

  const handleCopyReference = () => {
    navigator.clipboard.writeText(reference)
    toast.success("Payment reference copied to clipboard")
  }

  const handleCopyTransactionId = () => {
    if (payment.transactionId) {
      navigator.clipboard.writeText(payment.transactionId)
      toast.success("Transaction ID copied to clipboard")
    } else {
      toast.error("No transaction ID available")
    }
  }

  const handleDownloadInvoice = async () => {
    if (payment.status !== "completed") {
      toast.error("Invoice is only available for completed payments")
      return
    }

    try {
      const invoiceUrl = await getInvoice(payment._id)
      window.open(invoiceUrl, "_blank")
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleDownloadReceipt = async () => {
    if (!hasReceiptDoc) {
      toast.error("Receipt is not available for this payment")
      return
    }

    try {
      const receiptUrl = await getReceipt(payment._id)
      window.open(receiptUrl, "_blank")
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleViewReceipt = () => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, "_blank")
    } else {
      toast.error("Receipt URL is not available")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyReference}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Reference
          </DropdownMenuItem>

          {payment.transactionId && (
            <DropdownMenuItem onClick={handleCopyTransactionId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Transaction ID
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {payment.status === "completed" && (
            <DropdownMenuItem onClick={handleDownloadInvoice} disabled={loading}>
              <FileText className="mr-2 h-4 w-4" />
              Download Invoice
            </DropdownMenuItem>
          )}

          {hasReceiptDoc && (
            <DropdownMenuItem onClick={handleDownloadReceipt} disabled={loading}>
              <Receipt className="mr-2 h-4 w-4" />
              Download Receipt
            </DropdownMenuItem>
          )}

          {payment.receiptUrl && (
            <DropdownMenuItem onClick={handleViewReceipt}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Receipt
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canRefund && (
            <DropdownMenuItem onClick={() => setShowRefund(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Process Refund
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentDetailsDialog payment={payment} open={showDetails} onOpenChange={setShowDetails} onUpdate={onUpdate} />

      <RefundPaymentDialog payment={payment} open={showRefund} onOpenChange={setShowRefund} onUpdate={onUpdate} />

      <DeletePaymentDialog payment={payment} open={showDelete} onOpenChange={setShowDelete} onUpdate={onUpdate} />
    </>
  )
}
