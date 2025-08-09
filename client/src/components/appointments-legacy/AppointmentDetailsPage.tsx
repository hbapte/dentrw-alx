/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// client\src\pages\appointments\AppointmentDetailsPage.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, Link, 
  // useNavigate
 } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { useNotificationStore } from "../../store/notification-store"
import {
  formatAppointment,
  getStatusColor,
  getStatusLabel,
  // getTypeColor,
  getTypeLabel,
} from "../../utils/appointment.utils"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  UserPlus,
  MessageSquare,
  FileText,
  Mail,
  Phone,
} from "lucide-react"
import Loader from "../ui/Loader"
import ErrorAlert from "../ui/ErrorAlert"
import ConfirmDialog from "../ui/ConfirmDialog"

const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  // const navigate = useNavigate()
  const {
    selectedAppointment,
    loading,
    error,
    fetchAppointmentById,
    cancelAppointment,
    changeAppointmentStatus,
    addAppointmentReminder,
    clearSelectedAppointment,
    clearError,
  } = useAppointmentStore()
  const { showSuccess, showError } = useNotificationStore()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")

  useEffect(() => {
    if (id) {
      fetchAppointmentById(id)
    }

    return () => {
      clearSelectedAppointment()
    }
  }, [id, fetchAppointmentById, clearSelectedAppointment])

  const handleCancel = async () => {
    if (id && cancelReason) {
      try {
        await cancelAppointment(id, cancelReason)
        showSuccess("Appointment cancelled successfully")
        setIsCancelDialogOpen(false)
        setCancelReason("")
      } catch (err) {
        showError("Failed to cancel appointment")
      }
    }
  }

  const handleStatusChange = async () => {
    if (id && newStatus) {
      try {
        await changeAppointmentStatus(id, newStatus as any)
        showSuccess("Appointment status updated successfully")
        setIsStatusDialogOpen(false)
        setNewStatus("")
      } catch (err) {
        
        showError("Failed to update appointment status")
      }
    }
  }

  const handleSendReminder = async (type: "email" | "sms") => {
    if (id) {
      try {
        await addAppointmentReminder(id, type)
        showSuccess(`${type.toUpperCase()} reminder sent successfully`)
      } catch (err) {
        showError(`Failed to send ${type.toUpperCase()} reminder`)
      }
    }
  }

  if (loading && !selectedAppointment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={clearError} />
  }

  if (!selectedAppointment) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Appointment not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The appointment you are looking for does not exist or has been removed.</p>
            </div>
            <div className="mt-4">
              <Link
                to="/appointments"
                className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
              >
                Go back to appointments
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formattedAppointment = formatAppointment(selectedAppointment)
  const statusColorClass = getStatusColor(selectedAppointment.status)
  const statusText = getStatusLabel(selectedAppointment.status)
  // const typeColorClass = getTypeColor(selectedAppointment.type)
  const typeText = getTypeLabel(selectedAppointment.type)

  const canEdit = selectedAppointment.status !== "cancelled" && selectedAppointment.status !== "completed"
  const canChangeStatus = selectedAppointment.status !== "cancelled"
  const canSendReminder =
    selectedAppointment.status !== "cancelled" &&
    selectedAppointment.status !== "completed" &&
    selectedAppointment.status !== "no-show"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/appointments" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <>
              <Link
                to={`/appointments/edit/${id}`}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => setIsCancelDialogOpen(true)}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </>
          )}
          {canChangeStatus && (
            <button
              onClick={() => setIsStatusDialogOpen(true)}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Clock className="mr-2 h-4 w-4" />
              Change Status
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {typeText} - {formattedAppointment.formattedDate}
                </h2>
                <p className="text-sm text-gray-500">{formattedAppointment.formattedTime}</p>
              </div>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColorClass}`}>
              {statusText}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <User className="mr-2 h-5 w-5 text-gray-400" />
                Patient
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {formattedAppointment.patientName !== "No Patient" ? (
                  <Link
                    to={`/patients/${
                      typeof selectedAppointment.patient === "object" && selectedAppointment.patient
                        ? selectedAppointment.patient.id || selectedAppointment.patient._id
                        : selectedAppointment.patient
                    }`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {formattedAppointment.patientName}
                  </Link>
                ) : (
                  "No Patient"
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <UserPlus className="mr-2 h-5 w-5 text-gray-400" />
                Doctor
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <Link
                  to={`/doctors/${
                    typeof selectedAppointment.doctor === "object"
                      ? selectedAppointment.doctor.id || selectedAppointment.doctor._id
                      : selectedAppointment.doctor
                  }`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {formattedAppointment.doctorName}
                </Link>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formattedAppointment.formattedDate}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Clock className="mr-2 h-5 w-5 text-gray-400" />
                Time
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formattedAppointment.formattedTime}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <MessageSquare className="mr-2 h-5 w-5 text-gray-400" />
                Reason
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{selectedAppointment.reason}</dd>
            </div>
            {selectedAppointment.notes && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <FileText className="mr-2 h-5 w-5 text-gray-400" />
                  Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-line">
                  {selectedAppointment.notes}
                </dd>
              </div>
            )}
            {selectedAppointment.payment && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Payment</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Paid
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Reminders Section */}
      {canSendReminder && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Send Reminders</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Send appointment reminders to the patient.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex space-x-4">
              <button
                onClick={() => handleSendReminder("email")}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email Reminder
              </button>
              <button
                onClick={() => handleSendReminder("sms")}
                className="inline-flex items-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Phone className="mr-2 h-4 w-4" />
                Send SMS Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders History */}
      {selectedAppointment.reminders && selectedAppointment.reminders.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Reminder History</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {selectedAppointment.reminders.map((reminder, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {reminder.type === "email" ? (
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {reminder.type === "email" ? "Email Reminder" : "SMS Reminder"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          reminder.status === "sent" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reminder.status === "sent" ? "Sent" : "Failed"}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{new Date(reminder.sentAt).toLocaleString()}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cancel Appointment Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancel Appointment"
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        onConfirm={handleCancel}
        onCancel={() => {
          setIsCancelDialogOpen(false)
          setCancelReason("")
        }}
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

      {/* Change Status Dialog */}
      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        title="Change Appointment Status"
        confirmText="Update Status"
        cancelText="Cancel"
        onConfirm={handleStatusChange}
        onCancel={() => {
          setIsStatusDialogOpen(false)
          setNewStatus("")
        }}
        type="primary"
        customContent={
          <div className="mt-4">
            <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700">
              New Status
            </label>
            <select
              id="newStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        }
      />
    </div>
  )
}

export default AppointmentDetailsPage
