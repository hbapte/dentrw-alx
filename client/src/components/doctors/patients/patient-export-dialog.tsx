/* eslint-disable @typescript-eslint/no-explicit-any */
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
import type { Patient } from "../../../types/patient.types"
import { toast } from "sonner"

interface PatientExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: Patient[]
  selectedPatients?: Patient[]
}

const exportFields = [
  { id: "name", label: "Full Name", default: true },
  { id: "email", label: "Email Address", default: true },
  { id: "phone", label: "Phone Number", default: true },
  { id: "age", label: "Age", default: true },
  { id: "gender", label: "Gender", default: true },
  { id: "address", label: "Address", default: false },
  { id: "emergencyContact", label: "Emergency Contact", default: false },
  { id: "insurance", label: "Insurance Information", default: true },
  { id: "riskLevel", label: "Risk Assessment", default: true },
  { id: "allergies", label: "Allergies", default: false },
  { id: "chronicConditions", label: "Chronic Conditions", default: false },
  { id: "medications", label: "Current Medications", default: false },
  { id: "dentalHistory", label: "Dental History", default: false },
  { id: "preferences", label: "Preferences", default: false },
  { id: "createdAt", label: "Registration Date", default: true },
  { id: "lastVisit", label: "Last Dental Visit", default: false },
]

export function PatientExportDialog({ open, onOpenChange, patients, selectedPatients }: PatientExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [filename, setFilename] = useState("")
  const [includeFields, setIncludeFields] = useState<string[]>(
    exportFields.filter((field) => field.default).map((field) => field.id),
  )
  const [exporting, setExporting] = useState(false)

  const dataToExport = selectedPatients && selectedPatients.length > 0 ? selectedPatients : patients
  const exportCount = dataToExport.length

  const handleFieldChange = (fieldId: string, checked: boolean) => {
    if (checked) {
      setIncludeFields((prev) => [...prev, fieldId])
    } else {
      setIncludeFields((prev) => prev.filter((id) => id !== fieldId))
    }
  }

  const exportPatients = (patients: Patient[], options: any) => {
    // This would be implemented with actual export logic
    // For now, we'll just simulate the export
    const data = patients.map((patient) => {
      const exportData: any = {}

      if (options.includeFields.includes("name")) {
        exportData.name = patient.user.names
      }
      if (options.includeFields.includes("email")) {
        exportData.email = patient.user.email
      }
      if (options.includeFields.includes("phone")) {
        exportData.phone = patient.user.phoneNumber
      }
      if (options.includeFields.includes("gender")) {
        exportData.gender = patient.gender || patient.user.gender
      }
      if (options.includeFields.includes("insurance")) {
        exportData.hasInsurance = patient.insuranceInfo.hasInsurance
        exportData.insuranceProvider = patient.insuranceInfo.provider
      }
      if (options.includeFields.includes("riskLevel")) {
        exportData.riskLevel = patient.clinicalNotes?.riskAssessment || "low"
      }
      if (options.includeFields.includes("allergies")) {
        exportData.allergies = patient.medicalHistory.allergies.join(", ")
      }
      if (options.includeFields.includes("chronicConditions")) {
        exportData.chronicConditions = patient.medicalHistory.chronicConditions.join(", ")
      }
      if (options.includeFields.includes("createdAt")) {
        exportData.registrationDate = new Date(patient.createdAt).toLocaleDateString()
      }

      return exportData
    })

    // Convert to CSV format for demonstration
    if (options.format === "csv") {
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = options.filename || `patients-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
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
        const options = {
          format,
          includeFields,
          filename: filename.trim() || undefined,
        }

        exportPatients(dataToExport, options)
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(exportPromise, {
      loading: `Exporting ${exportCount} patients as ${format.toUpperCase()}...`,
      success: `Successfully exported ${exportCount} patients as ${format.toUpperCase()}`,
      error: "Failed to export patients",
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
            Export Patients
          </DialogTitle>
          <DialogDescription>
            Export {exportCount} patient{exportCount !== 1 ? "s" : ""} in your preferred format
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
              placeholder={`patients-export-${new Date().toISOString().split("T")[0]}`}
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
