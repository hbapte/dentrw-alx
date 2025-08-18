"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Eye, Copy, Download, TrashIcon, Calendar, Pill, MoreHorizontal, Share } from "lucide-react"
import { toast } from "sonner"
import { MedicalRecordDetailsDialog } from "./medical-record-details-dialog"
import { DeleteMedicalRecordDialog } from "./delete-medical-record-dialog"
import type { MedicalRecord } from "../../types/medical-record.types"

interface MedicalRecordRowActionsProps {
  record: MedicalRecord
  onUpdate: (recordId: string, data: Partial<MedicalRecord>) => Promise<void>
  onDelete: (recordId: string) => Promise<void>
}

export function MedicalRecordRowActions({ record, onUpdate, onDelete }: MedicalRecordRowActionsProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (error) {
      toast.error(`Failed to copy ${label}`)
    }
  }

  const handleDelete = async () => {
    const deletePromise = onDelete(record._id)

    toast.promise(deletePromise, {
      loading: "Deleting medical record...",
      success: "Medical record deleted successfully",
      error: "Failed to delete medical record",
    })

    setDeleteDialogOpen(false)
  }

  const handleDownloadRecord = () => {
    // This would generate a PDF or formatted document of the medical record
    toast.success("Download functionality coming soon!")
  }

  const handleShareRecord = () => {
    // This would open a sharing dialog
    toast.success("Share functionality coming soon!")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setDetailsDialogOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View Details</span>
              <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Edit record clicked")}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Record</span>
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleCopyToClipboard(record._id, "Record ID")}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Record ID</span>
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyToClipboard(record.diagnosis, "Diagnosis")}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Diagnosis</span>
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleDownloadRecord}>
              <Download className="mr-2 h-4 w-4" />
              <span>Download Record</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareRecord}>
              <Share className="mr-2 h-4 w-4" />
              <span>Share Record</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("View prescriptions clicked")}>
              <Pill className="mr-2 h-4 w-4" />
              <span>View Prescriptions</span>
            </DropdownMenuItem>
            {record.followUpRequired && (
              <DropdownMenuItem onClick={() => toast.success("Schedule follow-up clicked")}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Schedule Follow-up</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete Record</span>
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <MedicalRecordDetailsDialog recordId={record._id} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />

      <DeleteMedicalRecordDialog
        record={record}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  )
}
