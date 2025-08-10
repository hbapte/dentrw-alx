"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Payment } from "../../../types/payment.types"
import { canRefundPayment } from "@/utils/payment.utils"
import { usePaymentActions } from "../../../hooks/use-payments"
import { formatCurrency } from "@/utils/format-utils"

interface RefundPaymentDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function RefundPaymentDialog({ payment, open, onOpenChange, onUpdate }: RefundPaymentDialogProps) {
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const { processRefund, loading } = usePaymentActions()

  if (!payment || !canRefundPayment(payment)) return null

  const maxRefundAmount = payment.amount
  const isValidAmount = refundAmount && Number(refundAmount) > 0 && Number(refundAmount) <= maxRefundAmount

  const handleRefund = async () => {
    if (!isValidAmount || !refundReason.trim()) {
      toast.error("Please enter a valid refund amount and reason")
      return
    }

    try {
      await processRefund(payment._id, Number(refundAmount), refundReason.trim())
      onUpdate?.()
      onOpenChange(false)
      setRefundAmount("")
      setRefundReason("")
    } catch (error) {
      console.error("Failed to process refund:", error)
      // Error is handled in the hook
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setRefundAmount("")
        setRefundReason("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Process a refund for this payment. The refund will be processed through the original payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Info */}
          <div className="rounded-lg bg-muted p-3">
            <div className="text-sm">
              <div className="font-medium">Original Payment</div>
              <div className="text-muted-foreground">
                {formatCurrency(payment.amount, payment.currency)} via{" "}
                {payment.paymentMethod === "MoMo" ? "Mobile Money" : payment.paymentMethod}
              </div>
            </div>
          </div>

          {/* Refund Amount */}
          <div className="space-y-2">
            <Label htmlFor="refundAmount">Refund Amount</Label>
            <Input
              id="refundAmount"
              type="number"
              placeholder="0.00"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              max={maxRefundAmount}
              min="0"
              step="0.01"
            />
            <div className="text-xs text-muted-foreground">
              Maximum refund amount: {formatCurrency(maxRefundAmount, payment.currency)}
            </div>
          </div>

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label htmlFor="refundReason">Refund Reason</Label>
            <Textarea
              id="refundReason"
              placeholder="Please provide a reason for the refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={loading || !isValidAmount || !refundReason.trim()}>
            {loading ? "Processing..." : "Process Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
