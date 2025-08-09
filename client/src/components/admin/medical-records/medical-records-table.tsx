"use client"

import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow, format } from "date-fns"
import { FileText, Download, Calendar, Clock, Pill } from "lucide-react"
import { DataTable, type FilterConfig, type ActionConfig } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMedicalRecords } from "@/hooks/use-medical-records"
import { MedicalRecordExportDialog } from "./medical-record-export-dialog"
import { MedicalRecordRowActions } from "./medical-record-row-actions"
import { toast } from "sonner"
import type { MedicalRecord } from "@/types/medical-record.types"
import {
  getAppointmentTypeBadgeColor,
  getFollowUpBadgeColor,
  getPrescriptionSummary,
} from "@/utils/medical-record.utils"
import { formatDuration } from "@/utils/format-utils"

export default function MedicalRecordsTable() {
  const { records, loading, error, updateRecord, deleteRecord, refetch } = useMedicalRecords()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<MedicalRecord[]>([])

  // Column definitions
  const columns: ColumnDef<MedicalRecord>[] = [
    {
      header: "Patient",
      accessorKey: "patient.user.names",
      cell: ({ row }) => {
        const record = row.original
        const patient = record.patient

        return (
          <div className="flex items-center space-x-3">
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
            <div>
              <p className="font-medium">{patient.user.names}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{patient.user.email}</span>
                {patient.clinicalNotes?.riskAssessment && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {patient.clinicalNotes.riskAssessment} risk
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      },
      size: 280,
      enableHiding: false,
    },
    {
      header: "Doctor",
      accessorKey: "doctor.user.names",
      cell: ({ row }) => {
        const record = row.original
        const doctor = record.doctor

        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={doctor.user.picture || "/placeholder.svg"} alt={doctor.user.names} />
              <AvatarFallback className="text-xs">
                {doctor.user.names
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{doctor.user.names}</p>
              <div className="text-xs text-muted-foreground">{doctor.specialization[0] || "General"}</div>
            </div>
          </div>
        )
      },
      size: 200,
    },
    {
      header: "Appointment",
      accessorKey: "appointment.date",
      cell: ({ row }) => {
        const record = row.original
        const appointment = record.appointment

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{format(new Date(appointment.date), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {appointment.startTime} - {appointment.endTime}
              </span>
              <span>({formatDuration(appointment.startTime, appointment.endTime)})</span>
            </div>
            <Badge className={getAppointmentTypeBadgeColor(appointment.type)}>
              {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
            </Badge>
          </div>
        )
      },
      size: 180,
    },
    {
      header: "Diagnosis",
      accessorKey: "diagnosis",
      cell: ({ row }) => {
        const record = row.original

        return (
          <div className="space-y-1">
            <p className="font-medium text-sm line-clamp-2">{record.diagnosis}</p>
            {record.treatment && (
              <p className="text-xs text-muted-foreground line-clamp-1">Treatment: {record.treatment}</p>
            )}
          </div>
        )
      },
      size: 200,
    },
    {
      header: "Prescriptions",
      accessorKey: "prescription",
      cell: ({ row }) => {
        const record = row.original
        const prescriptionCount = record.prescription.length

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Pill className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{prescriptionCount} medications</span>
            </div>
            {prescriptionCount > 0 && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {getPrescriptionSummary(record.prescription)}
              </p>
            )}
          </div>
        )
      },
      size: 150,
    },
    {
      header: "Follow-up",
      accessorKey: "followUpRequired",
      cell: ({ row }) => {
        const record = row.original

        return (
          <div className="space-y-1">
            <Badge className={getFollowUpBadgeColor(record.followUpRequired)}>
              {record.followUpRequired ? "Required" : "Not needed"}
            </Badge>
            {record.followUpRequired && record.followUpDate && (
              <p className="text-xs text-muted-foreground">
                Due: {format(new Date(record.followUpDate), "MMM dd, yyyy")}
              </p>
            )}
          </div>
        )
      },
      size: 120,
      filterFn: (row, columnId, filterValue) => {
        const followUpRequired = row.original.followUpRequired
        if (filterValue === "required") return followUpRequired
        if (filterValue === "not_required") return !followUpRequired
        return true
      },
    },
    {
      header: "Attachments",
      accessorKey: "attachments",
      cell: ({ row }) => {
        const record = row.original
        const attachmentCount = record.attachments.length

        return (
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{attachmentCount} files</span>
          </div>
        )
      },
      size: 100,
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-sm">{formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}</div>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <MedicalRecordRowActions
          record={row.original}
          onUpdate={async (recordId, data) => {
            await updateRecord(recordId, data)
          }}
          onDelete={async (recordId) => {
            await deleteRecord(recordId)
          }}
        />
      ),
      size: 60,
      enableHiding: false,
    },
  ]

  // Filter configurations
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        columnId: "appointment.type",
        label: "Appointment Type",
        options: [
          {
            value: "consultation",
            label: "Consultation",
            count: records.filter((r) => r.appointment.type === "consultation").length,
          },
          {
            value: "checkup",
            label: "Check-up",
            count: records.filter((r) => r.appointment.type === "checkup").length,
          },
          {
            value: "treatment",
            label: "Treatment",
            count: records.filter((r) => r.appointment.type === "treatment").length,
          },
          {
            value: "follow-up",
            label: "Follow-up",
            count: records.filter((r) => r.appointment.type === "follow-up").length,
          },
          {
            value: "emergency",
            label: "Emergency",
            count: records.filter((r) => r.appointment.type === "emergency").length,
          },
        ],
      },
      {
        columnId: "followUpRequired",
        label: "Follow-up Status",
        options: [
          {
            value: "required",
            label: "Required",
            count: records.filter((r) => r.followUpRequired).length,
          },
          {
            value: "not_required",
            label: "Not Required",
            count: records.filter((r) => !r.followUpRequired).length,
          },
        ],
      },
      {
        columnId: "doctor.specialization",
        label: "Specialization",
        options: Array.from(new Set(records.flatMap((r) => r.doctor.specialization))).map((spec) => ({
          value: spec,
          label: spec,
          count: records.filter((r) => r.doctor.specialization.includes(spec)).length,
        })),
      },
    ],
    [records],
  )

  // Action configurations
  const actions: ActionConfig<MedicalRecord>[] = [
    {
      label: "Export",
      icon: Download,
      onClick: (selectedRecords) => {
        setSelectedRecords(selectedRecords)
        setExportDialogOpen(true)
      },
      variant: "outline",
    },
  ]

  const handleRefresh = async () => {
    const refreshPromise = refetch()
    toast.promise(refreshPromise, {
      loading: "Refreshing medical records...",
      success: "Medical records refreshed successfully",
      error: "Failed to refresh medical records",
    })
  }

  const handleBulkDelete = async (recordsToDelete: MedicalRecord[]) => {
    const deletePromise = Promise.all(recordsToDelete.map((record) => deleteRecord(record._id)))

    toast.promise(deletePromise, {
      loading: `Deleting ${recordsToDelete.length} medical records...`,
      success: `Successfully deleted ${recordsToDelete.length} medical records`,
      error: "Failed to delete some medical records",
    })
  }

  if (loading) {
    return <DataTableSkeleton columns={9} rows={10} />
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load medical records: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={records}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by patient name, diagnosis, or treatment..."
        searchColumnId="patient.user.names"
        filterConfigs={filterConfigs}
        actions={actions}
        onRefresh={handleRefresh}
        enableSelection={true}
        enableBulkDelete={true}
        onBulkDelete={handleBulkDelete}
        bulkDeleteConfirmText={(count) => `DELETE ${count} MEDICAL RECORDS`}
        emptyMessage="No medical records found."
        defaultSorting={[{ id: "createdAt", desc: true }]}
        SkeletonComponent={() => <DataTableSkeleton columns={9} rows={10} />}
      />

      <MedicalRecordExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        records={records}
        selectedRecords={selectedRecords}
      />
    </>
  )
}
