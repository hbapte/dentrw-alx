"use client"

import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import {
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Star,
  Users,
  Clock,
  DollarSign,
  ShieldCheck,
  Award,
} from "lucide-react"
import { DataTable, type FilterConfig, type ActionConfig } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Doctor } from "@/types/doctor.types"
import { DoctorExportDialog } from "./doctor-export-dialog"
import { DoctorDetailsDialog } from "./doctor-details-dialog"
import { formatCurrency, formatPhoneNumber } from "@/utils/format-utils"

interface DoctorsTableProps {
  doctors: Doctor[]
  loading: boolean
  onRefresh: () => Promise<void>
  onEdit?: (doctor: Doctor) => void
  onDelete?: (doctorId: string) => Promise<void>
}

const daysOfWeek = [
  { key: "sunday", label: "S" },
  { key: "monday", label: "M" },
  { key: "tuesday", label: "T" },
  { key: "wednesday", label: "W" },
  { key: "thursday", label: "T" },
  { key: "friday", label: "F" },
  { key: "saturday", label: "S" },
]

export function DoctorsTable({ doctors, loading, onRefresh, onEdit, onDelete }: DoctorsTableProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>([])
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  // Helper functions
  const getWorkingDays = (workingHours: Doctor["workingHours"]) => {
    return daysOfWeek.map((day) => {
      const workingDay = workingHours.find((wh) => wh.day.toLowerCase() === day.key)
      return {
        ...day,
        isWorking: workingDay?.isWorking || false,
      }
    })
  }

  const getEmploymentType = (doctor: Doctor) => {
    const workingDaysCount = doctor.workingHours.filter((wh) => wh.isWorking).length
    return workingDaysCount >= 5 ? "FULL-TIME" : "PART-TIME"
  }



  // Column definitions
  const columns: ColumnDef<Doctor>[] = [
    {
      header: "Doctor",
      accessorKey: "user.names",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.user.picture || "/placeholder.svg"} alt={row.original.user.names} />
            <AvatarFallback>
              {row.original.user.names
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{row.original.user.names}</p>
            <p className="text-sm text-gray-500 truncate">{row.original.specialization.join(", ")}</p>
            <div className="flex items-center gap-1 mt-1">
              {row.original.isVerified && <ShieldCheck className="w-3 h-3 text-green-500" />}
              <span className="text-xs text-gray-400">{row.original.experience} years exp.</span>
            </div>
          </div>
        </div>
      ),
      size: 280,
      enableHiding: false,
    },
    {
      header: "Contact",
      accessorKey: "user.email",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-gray-400" />
            <span>{formatPhoneNumber(row.original.user.phoneNumber)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Mail className="w-3 h-3" />
            <span className="truncate">{row.original.user.email}</span>
          </div>
        </div>
      ),
      size: 200,
    },
    {
      header: "Working Days",
      accessorKey: "workingHours",
      cell: ({ row }) => {
        const workingDays = getWorkingDays(row.original.workingHours)
        return (
          <div className="flex items-center gap-1">
            {workingDays.map((day) => (
              <div
                key={day.key}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  day.isWorking ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                {day.label}
              </div>
            ))}
          </div>
        )
      },
      size: 180,
    },
    {
      header: "Specialties",
      accessorKey: "dentalSpecialties",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {row.original.dentalSpecialties.slice(0, 2).map((specialty, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {row.original.dentalSpecialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{row.original.dentalSpecialties.length - 2}
              </Badge>
            )}
          </div>
        </div>
      ),
      size: 200,
    },
    {
      header: "Consultation Fee",
      accessorKey: "consultationFee.initial",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign className="w-3 h-3 text-green-500" />
            {formatCurrency(row.original.consultationFee.initial, row.original.consultationFee.currency)}
          </div>
          <p className="text-xs text-gray-500">Initial consultation</p>
        </div>
      ),
      size: 140,
    },
    {
      header: "Statistics",
      accessorKey: "statistics",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-3 h-3 text-blue-500" />
            <span>{row.original.statistics.totalPatients} patients</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-3 h-3 text-green-500" />
            <span>{row.original.statistics.totalAppointments} appointments</span>
          </div>
        </div>
      ),
      size: 150,
    },
    {
      header: "Rating",
      accessorKey: "averageRating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">
            {row.original.averageRating > 0 ? row.original.averageRating.toFixed(1) : "N/A"}
          </span>
          <span className="text-xs text-gray-500">({row.original.totalReviews})</span>
        </div>
      ),
      size: 100,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge
            variant={row.original.isActive ? "default" : "secondary"}
            className={
              row.original.isActive
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant={getEmploymentType(row.original) === "FULL-TIME" ? "default" : "secondary"}
            className={
              getEmploymentType(row.original) === "FULL-TIME"
                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                : "bg-orange-100 text-orange-800 hover:bg-orange-100"
            }
          >
            {getEmploymentType(row.original)}
          </Badge>
        </div>
      ),
      size: 120,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === "active") {
          return row.original.isActive
        } else if (filterValue === "inactive") {
          return !row.original.isActive
        } else if (filterValue === "full-time") {
          return getEmploymentType(row.original) === "FULL-TIME"
        } else if (filterValue === "part-time") {
          return getEmploymentType(row.original) === "PART-TIME"
        }
        return true
      },
    },
    {
      header: "Joined",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          })}
        </div>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DoctorRowActions
          doctor={row.original}
          onView={() => {
            setSelectedDoctor(row.original)
            setDetailsDialogOpen(true)
          }}
          onEdit={onEdit}
          onDelete={onDelete}
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
        columnId: "isActive",
        label: "Status",
        options: [
          {
            value: "active",
            label: "Active",
            count: doctors.filter((d) => d.isActive).length,
          },
          {
            value: "inactive",
            label: "Inactive",
            count: doctors.filter((d) => !d.isActive).length,
          },
          {
            value: "full-time",
            label: "Full-time",
            count: doctors.filter((d) => getEmploymentType(d) === "FULL-TIME").length,
          },
          {
            value: "part-time",
            label: "Part-time",
            count: doctors.filter((d) => getEmploymentType(d) === "PART-TIME").length,
          },
        ],
      },
      {
        columnId: "specialization",
        label: "Specialization",
        options: [
          {
            value: "General Dentistry",
            label: "General Dentistry",
            count: doctors.filter((d) => d.specialization.includes("General Dentistry")).length,
          },
          {
            value: "Orthodontics",
            label: "Orthodontics",
            count: doctors.filter((d) => d.specialization.includes("Orthodontics")).length,
          },
          {
            value: "Oral Surgery",
            label: "Oral Surgery",
            count: doctors.filter((d) => d.specialization.includes("Oral Surgery")).length,
          },
          {
            value: "Cosmetic Dentistry",
            label: "Cosmetic Dentistry",
            count: doctors.filter((d) => d.specialization.includes("Cosmetic Dentistry")).length,
          },
        ],
      },
      {
        columnId: "isVerified",
        label: "Verification",
        options: [
          {
            value: "verified",
            label: "Verified",
            count: doctors.filter((d) => d.isVerified).length,
          },
          {
            value: "unverified",
            label: "Unverified",
            count: doctors.filter((d) => !d.isVerified).length,
          },
        ],
      },
    ],
    [doctors],
  )

  // Action configurations
  const actions: ActionConfig<Doctor>[] = [
    {
      label: "Export",
      icon: Download,
      onClick: (selectedDoctors) => {
        setSelectedDoctors(selectedDoctors)
        setExportDialogOpen(true)
      },
      variant: "outline",
    },
  ]

  const handleBulkDelete = async (doctorsToDelete: Doctor[]) => {
    if (!onDelete) return

    const deletePromise = Promise.all(doctorsToDelete.map((doctor) => onDelete(doctor._id)))

    toast.promise(deletePromise, {
      loading: `Deleting ${doctorsToDelete.length} doctors...`,
      success: `Successfully deleted ${doctorsToDelete.length} doctors`,
      error: "Failed to delete some doctors",
    })
  }

  if (loading) {
    return <DataTableSkeleton columns={10} rows={10} />
  }

  return (
    <>
      <DataTable
        data={doctors}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search doctors by name, email, or specialization..."
        searchColumnId="user.names"
        filterConfigs={filterConfigs}
        actions={actions}
        onRefresh={onRefresh}
        enableSelection={true}
        enableBulkDelete={!!onDelete}
        onBulkDelete={handleBulkDelete}
        bulkDeleteConfirmText={(count) => `DELETE ${count} DOCTORS`}
        emptyMessage="No doctors found."
        defaultSorting={[{ id: "createdAt", desc: true }]}
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        SkeletonComponent={() => <DataTableSkeleton columns={10} rows={10} />}
      />

      <DoctorExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        doctors={doctors}
        selectedDoctors={selectedDoctors}
      />

      {selectedDoctor && (
        <DoctorDetailsDialog doctor={selectedDoctor} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />
      )}
    </>
  )
}

function DoctorRowActions({
  doctor,
  onView,
  onEdit,
  onDelete,
}: {
  doctor: Doctor
  onView: () => void
  onEdit?: (doctor: Doctor) => void
  onDelete?: (doctorId: string) => Promise<void>
}) {
  const handleDelete = async () => {
    if (!onDelete) return

    const deletePromise = onDelete(doctor._id)
    toast.promise(deletePromise, {
      loading: "Deleting doctor...",
      success: "Doctor deleted successfully",
      error: "Failed to delete doctor",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(doctor)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Doctor
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.success("Schedule management clicked")}>
          <Calendar className="mr-2 h-4 w-4" />
          Manage Schedule
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success("View appointments clicked")}>
          <Clock className="mr-2 h-4 w-4" />
          View Appointments
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onDelete && (
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
            <Award className="mr-2 h-4 w-4" />
            Delete Doctor
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
