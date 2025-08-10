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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import type { Payment } from "../../../types/payment.types"
import { exportPaymentsToCSV, } from "../../../utils/payment.utils"
import { formatCurrency } from "@/utils/format-utils"

interface PaymentExportDialogProps {
  payments: Payment[]
  selectedPayments?: Payment[]
}

export function PaymentExportDialog({ payments, selectedPayments = [] }: PaymentExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [exportType, setExportType] = useState<"all" | "selected">("all")
  const [includeFields, setIncludeFields] = useState({
    basicInfo: true,
    patientInfo: true,
    appointmentInfo: true,
    paymentDetails: true,
    refundInfo: true,
    timestamps: true,
  })
  const [loading, setLoading] = useState(false)

  const dataToExport = exportType === "selected" ? selectedPayments : payments
  const hasSelectedPayments = selectedPayments.length > 0

  const handleExport = async () => {
    if (dataToExport.length === 0) {
      toast.error("No payments to export")
      return
    }

    setLoading(true)
    try {
      let content: string
      let filename: string
      let mimeType: string

      switch (format) {
        case "csv":
          content = exportPaymentsToCSV(dataToExport)
          filename = `payments-export-${new Date().toISOString().split("T")[0]}.csv`
          mimeType = "text/csv"
          break
        case "excel":
          // For now, export as CSV (can be enhanced to actual Excel format)
          content = exportPaymentsToCSV(dataToExport)
          filename = `payments-export-${new Date().toISOString().split("T")[0]}.csv`
          mimeType = "text/csv"
          break
        case "pdf":
          // For now, export as CSV (can be enhanced to PDF format)
          content = exportPaymentsToCSV(dataToExport)
          filename = `payments-export-${new Date().toISOString().split("T")[0]}.csv`
          mimeType = "text/csv"
          break
        default:
          throw new Error("Unsupported format")
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${dataToExport.length} payments successfully`)
      setOpen(false)
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export payments")
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = dataToExport.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Payments</DialogTitle>
          <DialogDescription>
            Export payment data in your preferred format. Choose what data to include and how to format it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data to Export</Label>
            <RadioGroup value={exportType} onValueChange={(value: "all" | "selected") => setExportType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-sm">
                  All payments ({payments.length} records)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" disabled={!hasSelectedPayments} />
                <Label htmlFor="selected" className={`text-sm ${!hasSelectedPayments ? "text-muted-foreground" : ""}`}>
                  Selected payments ({selectedPayments.length} records)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: "csv" | "excel" | "pdf") => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  CSV (Comma Separated Values)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center text-sm">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel Spreadsheet
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF Report
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Fields</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries({
                basicInfo: "Basic Info",
                patientInfo: "Patient Details",
                appointmentInfo: "Appointment Info",
                paymentDetails: "Payment Details",
                refundInfo: "Refund Info",
                timestamps: "Timestamps",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={includeFields[key as keyof typeof includeFields]}
                    onCheckedChange={(checked) =>
                      setIncludeFields((prev) => ({
                        ...prev,
                        [key]: checked,
                      }))
                    }
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted p-3">
            <div className="text-sm">
              <div className="font-medium">Export Summary</div>
              <div className="mt-1 text-muted-foreground">
                {dataToExport.length} payments • Total: {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading || dataToExport.length === 0}>
            {loading ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
