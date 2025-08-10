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
import {
  Edit,
  Eye,
  Copy,
  Mail,
  UserX,
  UserIcon,
  TrashIcon,
  Calendar,
  FileText,
  MoreHorizontal,
  Phone,
} from "lucide-react"
import { toast } from "sonner"
import { PatientDetailsDialog } from "./patient-details-dialog"
import { DeletePatientDialog } from "./delete-patient-dialog"
import type { Patient } from "../../../types/patient.types"

interface PatientRowActionsProps {
  patient: Patient
  onUpdate: (patientId: string, data: Partial<Patient>) => Promise<void>
  onDelete: (patientId: string) => Promise<void>
}

export function PatientRowActions({ patient, onUpdate, onDelete }: PatientRowActionsProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (error) {
      console.error(`Failed to copy ${label}:`, error)
      toast.error(`Failed to copy ${label}`)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = !patient.user.active
    const updatePromise = onUpdate(patient._id, {
      user: { ...patient.user, active: newStatus },
    })

    toast.promise(updatePromise, {
      loading: `${newStatus ? "Activating" : "Deactivating"} patient...`,
      success: `Patient ${newStatus ? "activated" : "deactivated"} successfully`,
      error: `Failed to ${newStatus ? "activate" : "deactivate"} patient`,
    })
  }

  const handleDelete = async () => {
    const deletePromise = onDelete(patient._id)

    toast.promise(deletePromise, {
      loading: "Deleting patient...",
      success: "Patient deleted successfully",
      error: "Failed to delete patient",
    })

    setDeleteDialogOpen(false)
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
            <DropdownMenuItem onClick={() => toast.success("Edit patient clicked")}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Patient</span>
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleCopyToClipboard(patient._id, "Patient ID")}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy ID</span>
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyToClipboard(patient.user.email, "Email")}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Email</span>
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyToClipboard(patient.user.phoneNumber, "Phone")}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Phone</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => toast.success("Send email clicked")}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Send Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Call patient clicked")}>
              <Phone className="mr-2 h-4 w-4" />
              <span>Call Patient</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Schedule appointment clicked")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Schedule Appointment</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("View medical records clicked")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Medical Records</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {patient.user.active ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Activate</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete Patient</span>
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <PatientDetailsDialog patientId={patient._id} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />

      <DeletePatientDialog
        patient={patient}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  )
}
