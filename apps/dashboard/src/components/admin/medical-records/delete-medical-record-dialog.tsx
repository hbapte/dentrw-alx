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
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import type { MedicalRecord } from "../../types/medical-record.types"

interface DeleteMedicalRecordDialogProps {
  record: MedicalRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteMedicalRecordDialog({ record, open, onOpenChange, onConfirm }: DeleteMedicalRecordDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const expectedText = "DELETE RECORD"
  const isDeleteEnabled = confirmText === expectedText

  const handleConfirm = () => {
    if (isDeleteEnabled) {
      onConfirm()
      setConfirmText("")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-destructive"
            aria-hidden="true"
          >
            <AlertTriangle className="opacity-80 text-destructive" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              Are you sure you want to delete this medical record for <strong>{record.patient.user.names}</strong>?
              <br />
              <br />
              This action cannot be undone. This will permanently delete the medical record, including all
              prescriptions, notes, and attachments.
              <br />
              <br />
              Please type <strong>{expectedText}</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <div className="mt-2">
          <Label htmlFor="confirm-delete" className="sr-only">
            Confirmation text
          </Label>
          <Input
            id="confirm-delete"
            type="text"
            placeholder={expectedText}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="border-destructive/50 focus:border-destructive"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setConfirmText("")}
            className="bg-slate-700 text-white hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isDeleteEnabled}
            className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
              !isDeleteEnabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Delete Record
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
