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
import { toast } from "sonner"
import type { Doctor } from "@/types/doctor.types"

interface DoctorExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctors: Doctor[]
  selectedDoctors?: Doctor[]
}

const exportFields = [
  { id: "name", label: "Full Name", default: true },
  { id: "email", label: "Email Address", default: true },
  { id: "phone", label: "Phone Number", default: true },
  { id: "specialization", label: "Specialization", default: true },
  { id: "experience", label: "Years of Experience", default: true },
  { id: "licenseNumber", label: "License Number", default: false },
  { id: "consultationFee", label: "Consultation Fees", default: true },
  { id: "workingHours", label: "Working Hours", default: false },
  { id: "dentalSpecialties", label: "Dental Specialties", default: true },
  { id: "qualifications", label: "Qualifications", default: false },
  { id: "languages", label: "Languages", default: false },
  { id: "statistics", label: "Statistics", default: false },
  { id: "rating", label: "Rating & Reviews", default: true },
  { id: "status", label: "Status", default: true },
  { id: "createdAt", label: "Join Date", default: false },
]

export function DoctorExportDialog({ open, onOpenChange, doctors, selectedDoctors }: DoctorExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [filename, setFilename] = useState("")
  const [includeFields, setIncludeFields] = useState<string[]>(
    exportFields.filter((field) => field.default).map((field) => field.id),
  )
  const [exporting, setExporting] = useState(false)

  const dataToExport = selectedDoctors && selectedDoctors.length > 0 ? selectedDoctors : doctors
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
        // Here you would implement the actual export logic
        // For now, we'll just simulate the export
        setTimeout(() => {
          const exportData = dataToExport.map((doctor) => {
            const data: any = {}

            if (includeFields.includes("name")) data.name = doctor.user.names
            if (includeFields.includes("email")) data.email = doctor.user.email
            if (includeFields.includes("phone")) data.phone = doctor.user.phoneNumber
            if (includeFields.includes("specialization")) data.specialization = doctor.specialization.join(", ")
            if (includeFields.includes("experience")) data.experience = doctor.experience
            if (includeFields.includes("licenseNumber")) data.licenseNumber = doctor.licenseNumber
            if (includeFields.includes("consultationFee")) {
              data.consultationFee = `${doctor.consultationFee.initial} ${doctor.consultationFee.currency}`
            }
            if (includeFields.includes("dentalSpecialties")) {
              data.dentalSpecialties = doctor.dentalSpecialties.join(", ")
            }
            if (includeFields.includes("rating")) {
              data.rating = `${doctor.averageRating} (${doctor.totalReviews} reviews)`
            }
            if (includeFields.includes("status")) data.status = doctor.isActive ? "Active" : "Inactive"
            if (includeFields.includes("createdAt")) data.createdAt = new Date(doctor.createdAt).toLocaleDateString()

            return data
          })

          // Convert to CSV format (simplified)
          if (format === "csv") {
            const headers = Object.keys(exportData[0] || {})
            const csvContent = [
              headers.join(","),
              ...exportData.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
            ].join("\n")

            const blob = new Blob([csvContent], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename.trim() || `doctors-export-${new Date().toISOString().split("T")[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
          }

          resolve()
        }, 2000)
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(exportPromise, {
      loading: `Exporting ${exportCount} doctors as ${format.toUpperCase()}...`,
      success: `Successfully exported ${exportCount} doctors as ${format.toUpperCase()}`,
      error: "Failed to export doctors",
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
            Export Doctors
          </DialogTitle>
          <DialogDescription>
            Export {exportCount} doctor{exportCount !== 1 ? "s" : ""} in your preferred format
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
              placeholder={`doctors-export-${new Date().toISOString().split("T")[0]}`}
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
