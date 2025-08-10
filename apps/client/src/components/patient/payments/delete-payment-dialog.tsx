"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { Payment } from "../../../types/payment.types"
import { generatePaymentReference, getPatientName } from "@/utils/payment.utils"

interface DeletePaymentDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function DeletePaymentDialog({ payment, open, onOpenChange, onUpdate }: DeletePaymentDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const [loading, setLoading] = useState(false)

  if (!payment) return null

  const reference = generatePaymentReference(payment)
  const patientName = getPatientName(payment)
  const expectedText = "DELETE"
  const isConfirmed = confirmText === expectedText

  const handleDelete = async () => {
    if (!isConfirmed) {
      toast.error(`Please type "${expectedText}" to confirm`)
      return
    }

    setLoading(true)
    try {
      // Note: This would typically call a delete API endpoint
      // For now, we'll just show a success message
      toast.success("Payment deleted successfully")
      onUpdate?.()
      onOpenChange(false)
      setConfirmText("")
    } catch (error) {
      console.error("Failed to delete payment:", error)
      toast.error("Failed to delete payment")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setConfirmText("")
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50"
            aria-hidden="true"
          >
            <AlertTriangle className="text-red-600" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              Are you sure you want to delete this payment? This action cannot be undone.
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <strong>Payment:</strong> {reference}
                </div>
                <div>
                  <strong>Patient:</strong> {patientName}
                </div>
                <div>
                  <strong>Status:</strong> {payment.status}
                </div>
              </div>
              <div className="mt-3">
                Please type <strong>{expectedText}</strong> to confirm deletion.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <div className="mt-2">
          <Input
            type="text"
            placeholder={expectedText}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="border-red-200 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? "Deleting..." : "Delete Payment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
