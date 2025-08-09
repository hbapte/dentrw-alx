"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CircleAlertIcon } from "lucide-react"
import type { Patient } from "../../../types/patient.types"
import { getRiskBadgeColor } from "../../../utils/patient.utils"

interface DeletePatientDialogProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeletePatientDialog({ patient, open, onOpenChange, onConfirm }: DeletePatientDialogProps) {
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const confirmText = patient.user.email
  const isDeleteEnabled = deleteConfirm === confirmText

  const handleConfirm = () => {
    if (isDeleteEnabled) {
      onConfirm()
      setDeleteConfirm("")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setDeleteConfirm("")
    }
  }

  const riskLevel = patient.clinicalNotes?.riskAssessment || "low"

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50"
              aria-hidden="true"
            >
              <CircleAlertIcon className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">Delete Patient Account</AlertDialogTitle>
              <AlertDialogDescription className="mt-1 text-left">
                This action cannot be undone. This will permanently delete the patient account and all associated
                medical records.
              </AlertDialogDescription>
            </div>
          </div>

          {/* Patient Preview */}
          <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={patient.user.picture || "/placeholder.svg"} alt={patient.user.names} />
              <AvatarFallback>
                {patient.user.names
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{patient.user.names}</p>
              <p className="text-muted-foreground text-sm">{patient.user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={patient.user.active ? "default" : "secondary"} className="text-xs">
                  {patient.user.active ? "Active" : "Inactive"}
                </Badge>
                <Badge className={`text-xs ${getRiskBadgeColor(riskLevel)}`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </Badge>
                {patient.insuranceInfo.hasInsurance && (
                  <Badge variant="outline" className="text-xs">
                    Insured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Please type <span className="bg-muted rounded px-1 font-mono">{patient.user.email}</span> to confirm:
            </p>
            <Input
              type="text"
              placeholder={confirmText}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:text-white dark:hover:bg-red-600 ${
              !isDeleteEnabled ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={!isDeleteEnabled}
          >
            Delete Patient
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
