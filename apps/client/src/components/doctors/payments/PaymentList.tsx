"use client"

import type React from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Button } from "../../ui/button"
import { Eye, FileText, Receipt } from "lucide-react"
import PaymentStatusBadge from "./PaymentStatusBadge"
import PaymentMethodBadge from "./PaymentMethodBadge"
import type { Payment } from "../../../types/payment.types"
import { formatCurrency } from "@/utils/format-utils"

interface PaymentListProps {
  payments: Payment[]
  onViewPayment: (id: string) => void
  onGenerateInvoice: (id: string) => void
  onGenerateReceipt: (id: string) => void
}

const PaymentList: React.FC<PaymentListProps> = ({ payments, onViewPayment, onGenerateInvoice, onGenerateReceipt }) => {
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }



  const getPatientName = (payment: Payment) => {
    if (!payment.patient) {
      return "No Patient Information"
    }

    if (typeof payment.patient === "string") {
      return "Patient ID: " + payment.patient
    }

    // Access the name from the nested user object
    if (payment.patient.user && payment.patient.user.names) {
      return payment.patient.user.names
    }

    return "Unknown Patient"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                <TableCell>{getPatientName(payment)}</TableCell>
                <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                <TableCell>
                  <PaymentMethodBadge method={payment.paymentMethod} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onViewPayment(payment._id)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {payment.status === "completed" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onGenerateInvoice(payment._id)}
                          title="Generate Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onGenerateReceipt(payment._id)}
                          title="Generate Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default PaymentList
