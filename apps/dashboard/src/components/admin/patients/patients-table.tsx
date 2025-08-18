"use client"

import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import {
  Shield,
  ShieldCheck,
  Download,
  Heart,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  User,
  Clock,
} from "lucide-react"
import { DataTable, type FilterConfig, type ActionConfig } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePatients } from "../../../hooks/use-patients"
import { PatientExportDialog } from "./patient-export-dialog"
import { PatientRowActions } from "./patient-row-actions"
import { toast } from "sonner"
import type { Patient } from "../../../types/patient.types"
import {
  calculateAge,
  getRiskBadgeColor,
  getInsuranceBadgeColor,
  getAnxietyBadgeColor,
} from "../../../utils/patient.utils"
import { formatPhoneNumber } from "@/utils/format-utils"


export default function PatientsTable() {
  const { patients, loading, error, updatePatient, deletePatient, refetch } = usePatients()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([])

  // Column definitions
  const columns: ColumnDef<Patient>[] = [
    {
      header: "Patient",
      accessorKey: "user.names",
      cell: ({ row }) => {
        const patient = row.original
        const age = calculateAge(patient.dateOfBirth || patient.user.dateOfBirth || "")

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
                {age > 0 && (
                  <>
                    <span>•</span>
                    <span>{age} years</span>
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
      header: "Contact",
      accessorKey: "user.phoneNumber",
      cell: ({ row }) => {
        const patient = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{formatPhoneNumber(patient.user.phoneNumber)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{patient.user.email}</span>
            </div>
          </div>
        )
      },
      size: 200,
    },
    {
      header: "Demographics",
      accessorKey: "gender",
      cell: ({ row }) => {
        const patient = row.original
        const gender = patient.gender || patient.user.gender
        const maritalStatus = patient.maritalStatus || patient.user.maritalStatus

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "N/A"}
              </Badge>
            </div>
            {maritalStatus && (
              <div className="text-xs text-muted-foreground">
                {maritalStatus.charAt(0).toUpperCase() + maritalStatus.slice(1)}
              </div>
            )}
          </div>
        )
      },
      size: 120,
      filterFn: (row, columnId, filterValue) => {
        const gender = row.original.gender || row.original.user.gender
        return filterValue.includes(gender)
      },
    },
    {
      header: "Location",
      accessorKey: "address.district",
      cell: ({ row }) => {
        const patient = row.original
        const { district, province } = patient.address

        return (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{district && province ? `${district}, ${province}` : district || province || "Not specified"}</span>
          </div>
        )
      },
      size: 150,
    },
    {
      header: "Insurance",
      accessorKey: "insuranceInfo.hasInsurance",
      cell: ({ row }) => {
        const patient = row.original
        const { hasInsurance, provider, coverageType } = patient.insuranceInfo

        return (
          <div className="space-y-1">
            <Badge className={getInsuranceBadgeColor(hasInsurance)}>
              {hasInsurance ? (
                <>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Insured
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Uninsured
                </>
              )}
            </Badge>
            {hasInsurance && provider && (
              <div className="text-xs text-muted-foreground">
                {provider} ({coverageType})
              </div>
            )}
          </div>
        )
      },
      size: 130,
      filterFn: (row, columnId, filterValue) => {
        const hasInsurance = row.original.insuranceInfo.hasInsurance
        if (filterValue === "insured") return hasInsurance
        if (filterValue === "uninsured") return !hasInsurance
        return true
      },
    },
    {
      header: "Risk Level",
      accessorKey: "clinicalNotes.riskAssessment",
      cell: ({ row }) => {
        const patient = row.original
        const riskLevel = patient.clinicalNotes?.riskAssessment || "low"
        const anxietyLevel = patient.preferences.anxietyLevel

        return (
          <div className="space-y-1">
            <Badge className={getRiskBadgeColor(riskLevel)}>
              <Heart className="h-3 w-3 mr-1" />
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getAnxietyBadgeColor(anxietyLevel)}`}>
              {anxietyLevel} anxiety
            </Badge>
          </div>
        )
      },
      size: 120,
      filterFn: (row, columnId, filterValue) => {
        const riskLevel = row.original.clinicalNotes?.riskAssessment || "low"
        return filterValue.includes(riskLevel)
      },
    },
    {
      header: "Medical Info",
      accessorKey: "medicalHistory",
      cell: ({ row }) => {
        const patient = row.original
        const { allergies, chronicConditions, currentMedications } = patient.medicalHistory
        const totalConditions = allergies.length + chronicConditions.length + currentMedications.length

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-3 w-3 text-muted-foreground" />
              <span>{totalConditions} conditions</span>
            </div>
            {allergies.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {allergies.length} allergies
              </Badge>
            )}
          </div>
        )
      },
      size: 130,
    },
    {
      header: "Last Visit",
      accessorKey: "dentalHistory.lastDentalVisit",
      cell: ({ row }) => {
        const patient = row.original
        const lastVisit = patient.dentalHistory.lastDentalVisit
        const lastLogin = patient.user.lastLogin

        return (
          <div className="space-y-1">
            {lastVisit ? (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{formatDistanceToNow(new Date(lastVisit), { addSuffix: true })}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No visits</span>
            )}
            {lastLogin && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Active {formatDistanceToNow(new Date(lastLogin), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        )
      },
      size: 150,
    },
    {
      header: "Status",
      accessorKey: "user.active",
      cell: ({ row }) => {
        const patient = row.original
        const isActive = patient.user.active
        const isVerified = patient.user.emailVerified

        return (
          <div className="space-y-1">
            <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
            <Badge variant={isVerified ? "default" : "outline"} className="text-xs">
              {isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        )
      },
      size: 100,
      filterFn: (row, columnId, filterValue) => {
        const isActive = row.original.user.active
        if (filterValue === "active") return isActive
        if (filterValue === "inactive") return !isActive
        return true
      },
    },
    {
      header: "Joined",
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
        <PatientRowActions
          patient={row.original}
          onUpdate={async (patientId, data) => {
            await updatePatient(patientId, data)
          }}
          onDelete={async (patientId) => {
            await deletePatient(patientId)
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
        columnId: "user.active",
        label: "Status",
        options: [
          {
            value: "active",
            label: "Active",
            count: patients.filter((p) => p.user.active).length,
          },
          {
            value: "inactive",
            label: "Inactive",
            count: patients.filter((p) => !p.user.active).length,
          },
        ],
      },
      {
        columnId: "gender",
        label: "Gender",
        options: [
          {
            value: "male",
            label: "Male",
            count: patients.filter((p) => (p.gender || p.user.gender) === "male").length,
          },
          {
            value: "female",
            label: "Female",
            count: patients.filter((p) => (p.gender || p.user.gender) === "female").length,
          },
          {
            value: "other",
            label: "Other",
            count: patients.filter((p) => (p.gender || p.user.gender) === "other").length,
          },
        ],
      },
      {
        columnId: "insuranceInfo.hasInsurance",
        label: "Insurance",
        options: [
          {
            value: "insured",
            label: "Insured",
            count: patients.filter((p) => p.insuranceInfo.hasInsurance).length,
          },
          {
            value: "uninsured",
            label: "Uninsured",
            count: patients.filter((p) => !p.insuranceInfo.hasInsurance).length,
          },
        ],
      },
      {
        columnId: "clinicalNotes.riskAssessment",
        label: "Risk Level",
        options: [
          {
            value: "low",
            label: "Low Risk",
            count: patients.filter((p) => (p.clinicalNotes?.riskAssessment || "low") === "low").length,
          },
          {
            value: "moderate",
            label: "Moderate Risk",
            count: patients.filter((p) => p.clinicalNotes?.riskAssessment === "moderate").length,
          },
          {
            value: "high",
            label: "High Risk",
            count: patients.filter((p) => p.clinicalNotes?.riskAssessment === "high").length,
          },
        ],
      },
    ],
    [patients],
  )

  // Action configurations
  const actions: ActionConfig<Patient>[] = [
    {
      label: "Export",
      icon: Download,
      onClick: (selectedPatients) => {
        setSelectedPatients(selectedPatients)
        setExportDialogOpen(true)
      },
      variant: "outline",
    },
  ]

  const handleRefresh = async () => {
    const refreshPromise = refetch()
    toast.promise(refreshPromise, {
      loading: "Refreshing patients...",
      success: "Patients refreshed successfully",
      error: "Failed to refresh patients",
    })
  }

  const handleBulkDelete = async (patientsToDelete: Patient[]) => {
    const deletePromise = Promise.all(patientsToDelete.map((patient) => deletePatient(patient._id)))

    toast.promise(deletePromise, {
      loading: `Deleting ${patientsToDelete.length} patients...`,
      success: `Successfully deleted ${patientsToDelete.length} patients`,
      error: "Failed to delete some patients",
    })
  }

  if (loading) {
    return <DataTableSkeleton columns={10} rows={10} />
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load patients: {error}</p>
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
        data={patients}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search patients by name, email, or phone..."
        searchColumnId="user.names"
        filterConfigs={filterConfigs}
        actions={actions}
        onRefresh={handleRefresh}
        enableSelection={true}
        enableBulkDelete={true}
        onBulkDelete={handleBulkDelete}
        bulkDeleteConfirmText={(count) => `DELETE ${count} PATIENTS`}
        emptyMessage="No patients found."
        defaultSorting={[{ id: "createdAt", desc: true }]}
        SkeletonComponent={() => <DataTableSkeleton columns={10} rows={10} />}
      />

      <PatientExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        patients={patients}
        selectedPatients={selectedPatients}
      />
    </>
  )
}
