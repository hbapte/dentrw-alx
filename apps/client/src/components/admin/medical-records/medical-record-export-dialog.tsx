"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, FileSpreadsheet, FileImage } from "lucide-react"
import type { MedicalRecord } from "@/types/medical-record.types"
import { exportMedicalRecords } from "@/utils/medical-record.utils"
import { toast } from "sonner"

interface MedicalRecordExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  records: MedicalRecord[]
  selectedRecords?: MedicalRecord[]
}

const exportFields = [
  { id: "recordId", label: "Record ID", default: true },
  { id: "patientName", label: "Patient Name", default: true },
  { id: "patientEmail", label: "Patient Email", default: true },
  { id: "doctorName", label: "Doctor Name", default: true },
  { id: "appointmentDate", label: "Appointment Date", default: true },
  { id: "appointmentType", label: "Appointment Type", default: true },
  { id: "diagnosis", label: "Diagnosis", default: true },
  { id: "treatment", label: "Treatment", default: true },
  { id: "prescriptions", label: "Prescriptions", default: true },
  { id: "followUpRequired", label: "Follow-up Required", default: false },
  { id: "followUpDate", label: "Follow-up Date", default: false },
  { id: "notes", label: "Notes", default: false },
  { id: "attachments", label: "Attachments Count", default: false },
  { id: "createdAt", label: "Created Date", default: true },
]

export function MedicalRecordExportDialog({
  open,
  onOpenChange,
  records,
  selectedRecords,
}: MedicalRecordExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [filename, setFilename] = useState("")
  const [includeFields, setIncludeFields] = useState<string[]>(
    exportFields.filter((field) => field.default).map((field) => field.id),
  )
  const [exporting, setExporting] = useState(false)

  const dataToExport = selectedRecords && selectedRecords.length > 0 ? selectedRecords : records
  const exportCount = dataToExport.length

  const handleFieldChange = (fieldId: string, checked: boolean) => {
    if (checked) {
      setIncludeFields((prev) => [...prev, fieldId])
    } else {
      setIncludeFields((prev) => prev.filter((id) => id !== fieldId))
    }
  }

  const handleExport = async () => {
    if (includeFields.length === 0) {
      toast.error("Please select at least one field to export")
      return
    }

    setExporting(true)

    const exportPromise = new Promise<void>((resolve, reject) => {
      try {
        exportMedicalRecords(dataToExport, format)
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(exportPromise, {
      loading: `Exporting ${exportCount} medical records as ${format.toUpperCase()}...`,
      success: `Successfully exported ${exportCount} medical records as ${format.toUpperCase()}`,
      error: "Failed to export medical records",
    })

    try {
      await exportPromise
      onOpenChange(false)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  const getFormatIcon = () => {
    switch (format) {
      case "csv":
        return <FileText className="h-4 w-4" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />
      case "pdf":
        return <FileImage className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Medical Records
          </DialogTitle>
          <DialogDescription>
            Export {exportCount} medical record{exportCount !== 1 ? "s" : ""} in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: "csv" | "excel" | "pdf") => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV File
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel File
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename (optional)</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={`medical-records-export-${new Date().toISOString().split("T")[0]}`}
            />
          </div>

          {/* Fields Selection */}
          <div className="space-y-3">
            <Label>Fields to Include</Label>
            <div className="grid max-h-48 grid-cols-1 gap-3 overflow-y-auto">
              {exportFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={includeFields.includes(field.id)}
                    onCheckedChange={(checked) => handleFieldChange(field.id, !!checked)}
                  />
                  <Label htmlFor={field.id} className="text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || includeFields.length === 0}>
            {exporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Exporting...
              </>
            ) : (
              <>
                {getFormatIcon()}
                <span className="ml-2">Export {format.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
