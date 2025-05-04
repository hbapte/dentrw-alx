"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { useNotificationStore } from "../../store/notification-store"
import {
  formatAppointment,
  getStatusColor,
  getStatusLabel,
  getTypeColor,
  getTypeLabel,
} from "../../utils/appointment.utils"
import { Edit, Plus, Trash2, Calendar, Filter, Clock } from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import SearchInput from "../../components/ui/SearchInput"
import Pagination from "../../components/ui/Pagination"
import ConfirmDialog from "../../components/ui/ConfirmDialog"

const AppointmentsPage: React.FC = () => {
  const { appointments, loading, error, fetchAppointments, cancelAppointment, clearError } = useAppointmentStore()
  const { showSuccess, showError } = useNotificationStore()
  const navigate = useNavigate()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const itemsPerPage = 10

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Filter appointments based on search term, status, type, and date
  const filteredAppointments = appointments
    .map((appointment) => formatAppointment(appointment))
    .filter((appointment: any) => {
      const searchLower = searchTerm.toLowerCase()
      const patientName = appointment.patientName.toLowerCase()
      const doctorName = appointment.doctorName.toLowerCase()
      const reason = appointment.reason.toLowerCase()

      const matchesSearch =
        patientName.includes(searchLower) || doctorName.includes(searchLower) || reason.includes(searchLower)

      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
      const matchesType = typeFilter === "all" || appointment.type === typeFilter

      // Date filtering
      let matchesDate = true
      if (dateFilter) {
        const appointmentDate = new Date(appointment.date).toISOString().split("T")[0]
        matchesDate = appointmentDate === dateFilter
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate
    })

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, dateFilter])

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

  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <Link
          to="/appointments/add"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Appointment
        </Link>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <SearchInput
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter("")} className="text-xs text-gray-500 hover:text-gray-700">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredAppointments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
        {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length}{" "}
        appointments
      </div>

      {filteredAppointments.length > 0 ? (
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
                {paginatedAppointments.map((appointment: any) => {
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
                        <div className="flex items-center justify-end space-x-2">
                          {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                            <>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter
              ? "Try adjusting your search or filters"
              : "Get started by scheduling a new appointment"}
          </p>
          {!searchTerm && statusFilter === "all" && typeFilter === "all" && !dateFilter && (
            <div className="mt-6">
              <Link
                to="/appointments/add"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Appointment
              </Link>
            </div>
          )}
        </div>
      )}

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
