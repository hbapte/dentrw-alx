/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { useNotificationStore } from "../../store/notification-store"
import { useAuthStore } from "../../store/auth-store"
import {
  formatAppointment,
  getStatusColor,
  getStatusLabel,
  getTypeColor,
  getTypeLabel,
} from "../../utils/appointment.utils"
import { Edit, Plus, Trash2, Calendar, Filter, Clock, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import Loader from "../ui/Loader"
import ErrorAlert from "../ui/ErrorAlert"
import ConfirmDialog from "../ui/ConfirmDialog"
import EmptyState from "../ui/EmptyState"

const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    loading,
    error,
    pagination,
    filters,
    fetchAppointments,
    cancelAppointment,
    clearError,
    setFilters,
    resetFilters,
    setPage,
  } = useAppointmentStore()

  const { showSuccess, showError } = useNotificationStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Local state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  // Check if user has permission to manage appointments
  const canManageAppointments = user && ["admin", "doctor", "receptionist"].includes(user.role)

  useEffect(() => {
    // Initial fetch of appointments
    fetchAppointments()
  }, [fetchAppointments])

  // Handle search input with debounce
  useEffect(() => {
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout)
    }

    const timeout = setTimeout(() => {
      setFilters({ search: searchTerm })
    }, 500) // 500ms debounce

    setSearchDebounceTimeout(timeout)

    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout)
      }
    }
  }, [searchTerm, setFilters])

  const handleCancelClick = (id: string) => {
    setAppointmentToCancel(id)
    setIsCancelDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (appointmentToCancel && cancelReason) {
      try {
        await cancelAppointment(appointmentToCancel, cancelReason)
        showSuccess("Appointment cancelled successfully")
      } catch (err) {
        console.error("Error cancelling appointment:", err)
        showError("Failed to cancel appointment")
      } finally {
        setIsCancelDialogOpen(false)
        setAppointmentToCancel(null)
        setCancelReason("")
      }
    }
  }

  const handleCancelDialogClose = () => {
    setIsCancelDialogOpen(false)
    setAppointmentToCancel(null)
    setCancelReason("")
  }

  const handleFilterChange = (filterName: string, value: string) => {
    if (value === "all") {
      // Remove this filter
      const newFilters = { ...filters }
      delete newFilters[filterName as keyof typeof newFilters]
      setFilters(newFilters)
    } else {
      setFilters({ [filterName]: value })
    }
  }

  const handleDateFilterChange = (value: string) => {
    if (value) {
      setFilters({ startDate: value })
    } else {
      const newFilters = { ...filters }
      delete newFilters.startDate
      setFilters(newFilters)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    resetFilters()
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  // Show loading state for initial load
  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  // Format appointments for display
  const formattedAppointments = appointments.map((appointment) => formatAppointment(appointment))

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        {canManageAppointments && (
          <Link
            to="/appointments/add"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Appointment
          </Link>
        )}
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-1 items-center">
            <div className="relative w-full max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search appointments..."
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="ml-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Clear Filters
                <X className="ml-1 h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filters.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <select
              value={filters.type || "all"}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="checkup">Check-up</option>
              <option value="treatment">Treatment</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {filters.startDate && (
              <button onClick={() => handleDateFilterChange("")} className="text-xs text-gray-500 hover:text-gray-700">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="text-sm text-gray-500">
        Showing {pagination.totalItems > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0} to{" "}
        {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} appointments
      </div>

      {/* Appointments Table */}
      {formattedAppointments.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Patient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Doctor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {formattedAppointments.map((appointment: any) => {
                  const statusColorClass = getStatusColor(appointment.status)
                  const statusText = getStatusLabel(appointment.status)
                  const typeColorClass = getTypeColor(appointment.type)
                  const typeText = getTypeLabel(appointment.type)

                  return (
                    <tr
                      key={appointment.id || appointment._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/appointments/${appointment.id || appointment._id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">{appointment.formattedDate}</div>
                        <div className="text-sm text-gray-500">{appointment.formattedTime}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${typeColorClass}`}
                        >
                          {typeText}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColorClass}`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {canManageAppointments &&
                          appointment.status !== "cancelled" &&
                          appointment.status !== "completed" && (
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/appointments/edit/${appointment.id || appointment._id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit className="h-5 w-5" />
                                <span className="sr-only">Edit</span>
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelClick(appointment.id || appointment._id || "")
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Cancel</span>
                              </button>
                            </div>
                          )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Server-side Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  pagination.hasPreviousPage ? "text-gray-700 hover:bg-gray-50" : "text-gray-300"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  pagination.hasNextPage ? "text-gray-700 hover:bg-gray-50" : "text-gray-300"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {pagination.totalItems > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      pagination.hasPreviousPage ? "text-gray-400 hover:bg-gray-50" : "text-gray-300"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1),
                    )
                    .map((page, index, array) => {
                      // Add ellipsis
                      if (index > 0 && page > array[index - 1] + 1) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                          >
                            ...
                          </span>
                        )
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === pagination.page
                              ? "z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 hover:bg-gray-50 focus:z-20"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      pagination.hasNextPage ? "text-gray-400 hover:bg-gray-50" : "text-gray-300"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Calendar className="h-12 w-12 text-gray-400" />}
          title="No appointments found"
          description={
            hasActiveFilters ? "Try adjusting your search or filters" : "Get started by scheduling a new appointment"
          }
          action={
            !hasActiveFilters && canManageAppointments ? (
              <Link
                to="/appointments/add"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Appointment
              </Link>
            ) : hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            ) : null
          }
        />
      )}

      {/* Cancel Appointment Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancel Appointment"
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelDialogClose}
        type="danger"
        customContent={
          <div className="mt-4">
            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
              Reason for Cancellation
            </label>
            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
              placeholder="Please provide a reason for cancelling this appointment"
              required
            />
          </div>
        }
      />
    </div>
  )
}

export default AppointmentsPage
