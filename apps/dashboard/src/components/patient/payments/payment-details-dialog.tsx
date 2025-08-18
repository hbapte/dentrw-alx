"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreditCard, User, Calendar, FileText, Receipt, RefreshCw, ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"
import type { Payment } from "../../../types/payment.types"
import {
  formatPaymentMethod,
  getPaymentStatusColor,
  getPaymentMethodColor,
  getPatientName,
  getPatientEmail,
  getPatientPhone,
  getAppointmentDate,
  getAppointmentType,
  generatePaymentReference,
  canRefundPayment,
  hasReceipt,
} from "../../../utils/payment.utils"
import { usePaymentActions } from "../../../hooks/use-payments"
import { formatCurrency, formatDateTime } from "@/utils/format-utils"

interface PaymentDetailsDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function PaymentDetailsDialog({ payment, open, onOpenChange, onUpdate }: PaymentDetailsDialogProps) {
  const { getInvoice, getReceipt, loading } = usePaymentActions()
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)

  if (!payment) return null

  const patientName = getPatientName(payment)
  const patientEmail = getPatientEmail(payment)
  const patientPhone = getPatientPhone(payment)
  const appointmentDate = getAppointmentDate(payment)
  const appointmentType = getAppointmentType(payment)
  const reference = generatePaymentReference(payment)
  const canRefund = canRefundPayment(payment)
  const hasReceiptDoc = hasReceipt(payment)

  let avatarSrc = ""
  if (typeof payment.patient === "object" && payment.patient?.user?.picture) {
    avatarSrc = payment.patient.user.picture
  }

  const handleCopyReference = () => {
    navigator.clipboard.writeText(reference)
    toast.success("Payment reference copied to clipboard")
  }

  const handleCopyTransactionId = () => {
    if (payment.transactionId) {
      navigator.clipboard.writeText(payment.transactionId)
      toast.success("Transaction ID copied to clipboard")
    }
  }

  const handleDownloadInvoice = async () => {
    if (payment.status !== "completed") {
      toast.error("Invoice is only available for completed payments")
      return
    }

    setDownloadingInvoice(true)
    try {
      const invoiceUrl = await getInvoice(payment._id)
      window.open(invoiceUrl, "_blank")
    } catch (error) {
      console.error("Failed to download invoice:", error)
      // Error is handled in the hook
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const handleDownloadReceipt = async () => {
    if (!hasReceiptDoc) {
      toast.error("Receipt is not available for this payment")
      return
    }

    setDownloadingReceipt(true)
    try {
      const receiptUrl = await getReceipt(payment._id)
      window.open(receiptUrl, "_blank")
    } catch (error) {
      // Error is handled in the hook
      console.error("Failed to download receipt:", error)
    } finally {
      setDownloadingReceipt(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>Complete information about payment {reference}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Payment Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold">{reference}</span>
                    <Button variant="ghost" size="sm" onClick={handleCopyReference} className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Created {formatDateTime(payment.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(payment.amount, payment.currency)}</div>
                  {payment.refundAmount && (
                    <div className="text-sm text-red-600">
                      Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getPaymentStatusColor(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={getPaymentMethodColor(payment.paymentMethod)}>
                  {formatPaymentMethod(payment.paymentMethod)}
                </Badge>
                {canRefund && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Refundable
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Patient Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h3 className="font-semibold">Patient Information</h3>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={patientName} />
                  <AvatarFallback>
                    {patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{patientName}</div>
                  <div className="text-sm text-muted-foreground">{patientEmail}</div>
                  {patientPhone && <div className="text-sm text-muted-foreground">{patientPhone}</div>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Appointment Information */}
            {(appointmentDate || appointmentType) && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <h3 className="font-semibold">Appointment Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {appointmentDate && (
                      <div>
                        <div className="text-sm font-medium">Date</div>
                        <div className="text-sm text-muted-foreground">{appointmentDate}</div>
                      </div>
                    )}
                    {appointmentType && (
                      <div>
                        <div className="text-sm font-medium">Type</div>
                        <div className="text-sm text-muted-foreground">{appointmentType}</div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Payment Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h3 className="font-semibold">Payment Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Amount</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Method</div>
                  <div className="text-sm text-muted-foreground">{formatPaymentMethod(payment.paymentMethod)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm text-muted-foreground">{payment.status}</div>
                </div>
                {payment.transactionId && (
                  <div>
                    <div className="text-sm font-medium">Transaction ID</div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground font-mono">{payment.transactionId}</span>
                      <Button variant="ghost" size="sm" onClick={handleCopyTransactionId} className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Refund Information */}
            {(payment.refundAmount || payment.refundReason) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <h3 className="font-semibold">Refund Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {payment.refundAmount && (
                      <div>
                        <div className="text-sm font-medium">Refund Amount</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(payment.refundAmount, payment.currency)}
                        </div>
                      </div>
                    )}
                    {payment.refundDate && (
                      <div>
                        <div className="text-sm font-medium">Refund Date</div>
                        <div className="text-sm text-muted-foreground">{formatDateTime(payment.refundDate)}</div>
                      </div>
                    )}
                    {payment.refundReason && (
                      <div className="col-span-2">
                        <div className="text-sm font-medium">Refund Reason</div>
                        <div className="text-sm text-muted-foreground">{payment.refundReason}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {payment.metadata && Object.keys(payment.metadata).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <h3 className="font-semibold">Additional Information</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(payment.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                        <span className="text-sm text-muted-foreground">
                          {typeof value === "string" ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {payment.status === "completed" && (
                  <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={downloadingInvoice}>
                    <FileText className="mr-2 h-4 w-4" />
                    {downloadingInvoice ? "Generating..." : "Download Invoice"}
                  </Button>
                )}
                {hasReceiptDoc && (
                  <Button variant="outline" size="sm" onClick={handleDownloadReceipt} disabled={downloadingReceipt}>
                    <Receipt className="mr-2 h-4 w-4" />
                    {downloadingReceipt ? "Downloading..." : "Download Receipt"}
                  </Button>
                )}
                {payment.receiptUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(payment.receiptUrl!, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Receipt
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
