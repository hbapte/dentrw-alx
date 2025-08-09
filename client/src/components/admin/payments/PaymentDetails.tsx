/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { usePaymentStore } from "../../../store/payment-store"
import PaymentStatusBadge from "./PaymentStatusBadge"
import PaymentMethodBadge from "./PaymentMethodBadge"
import type { Payment } from "../../../types/payment.types"
import { toast } from "sonner"

interface PaymentDetailsProps {
  payment: Payment
  onRefresh: () => void
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, onRefresh }) => {
  const navigate = useNavigate()
  const { updatePaymentStatus, processRefund, getInvoice, getReceipt } = usePaymentStore()
  const [refundAmount, setRefundAmount] = useState<number>(payment.amount)
  const [refundReason, setRefundReason] = useState<string>("")
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<Payment["status"]>(payment.status)

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP p")
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "RWF",
    }).format(amount)
  }

  const getPatientName = () => {
    if (typeof payment.patient === "string") {
      return "Patient ID: " + payment.patient
    }
    return payment.patient.firstName + " " + payment.patient.lastName
  }

  const handleStatusUpdate = async () => {
    try {
      await updatePaymentStatus(payment._id, newStatus)
      toast.success(`Payment status updated to ${newStatus}`)
      setIsStatusDialogOpen(false)
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
    }
  }

  const handleRefund = async () => {
    try {
      if (refundAmount <= 0 || refundAmount > payment.amount) {
        toast.error( "Refund amount must be greater than 0 and less than or equal to the payment amount")
        return
      }

      if (!refundReason.trim()) {
        toast.error("Please provide a reason for the refund")
        return
      }

      await processRefund(payment._id, refundAmount, refundReason)
      toast.success(`Refund of ${formatCurrency(refundAmount, payment.currency)} processed successfully`)
      setIsRefundDialogOpen(false)
      onRefresh()
    } catch (error: any) {
      toast.error( error.message || "Failed to process refund")
    }
  }

  const handleGenerateInvoice = async () => {
    try {
      const invoiceUrl = await getInvoice(payment._id)
      window.open(invoiceUrl, "_blank")
    } catch (error: any) {
      toast.error( error.message || "Failed to generate invoice")
    }
  }

  const handleGenerateReceipt = async () => {
    try {
      const receiptUrl = await getReceipt(payment._id)
      window.open(receiptUrl, "_blank")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate receipt")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Payment Details</span>
          <PaymentStatusBadge status={payment.status} />
        </CardTitle>
        <CardDescription>
          Payment ID: {payment._id}
          {payment.transactionId && <span className="ml-2">(Transaction ID: {payment.transactionId})</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-2xl font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
              <div className="mt-1">
                <PaymentMethodBadge method={payment.paymentMethod} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p>{formatDate(payment.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient</h3>
              <p>{getPatientName()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Appointment</h3>
              <p>
                {typeof payment.appointment === "string"
                  ? `Appointment ID: ${payment.appointment}`
                  : `Appointment on ${format(new Date(payment.appointment.date), "PPP")}`}
              </p>
            </div>
            {payment.metadata?.serviceName && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Service</h3>
                <p>{payment.metadata.serviceName}</p>
              </div>
            )}
          </div>
        </div>

        {payment.refundAmount && payment.refundReason && (
          <div className="mt-6 p-4 bg-purple-50 rounded-md">
            <h3 className="text-sm font-medium text-purple-800">Refund Information</h3>
            <p className="mt-1 text-sm text-purple-700">
              Amount: {formatCurrency(payment.refundAmount, payment.currency)}
            </p>
            <p className="mt-1 text-sm text-purple-700">Reason: {payment.refundReason}</p>
            {payment.refundDate && (
              <p className="mt-1 text-sm text-purple-700">Date: {formatDate(payment.refundDate)}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <div className="flex gap-2">
          {payment.status === "completed" && (
            <>
              <Button variant="outline" onClick={handleGenerateInvoice}>
                Generate Invoice
              </Button>
              <Button variant="outline" onClick={handleGenerateReceipt}>
                Generate Receipt
              </Button>
              <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={payment.status !== "completed"}>
                    Process Refund
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Process Refund</DialogTitle>
                    <DialogDescription>
                      Enter the refund amount and reason. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="refundAmount">Refund Amount ({payment.currency})</Label>
                      <Input
                        id="refundAmount"
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        max={payment.amount}
                        min={0}
                      />
                      <p className="text-xs text-gray-500">
                        Maximum refund amount: {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refundReason">Reason for Refund</Label>
                      <Textarea
                        id="refundReason"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Please provide a reason for the refund"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRefund}>Process Refund</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button>Update Status</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment Status</DialogTitle>
                <DialogDescription>Change the status of this payment.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Payment["status"])}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>Update Status</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PaymentDetails
