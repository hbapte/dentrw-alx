"use client"

import type React from "react"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import AppointmentForm from "../../components/appointments/AppointmentForm"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import { appointmentToFormData } from "../../utils/appointment.utils"
import type { AppointmentFormData } from "../../types/appointment.types"

const EditAppointmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    selectedAppointment,
    loading,
    error,
    fetchAppointmentById,
    updateAppointment,
    clearSelectedAppointment,
    clearError,
  } = useAppointmentStore()
  const { showSuccess, showError } = useNotificationStore()

  useEffect(() => {
    if (id) {
      fetchAppointmentById(id)
    }

    return () => {
      clearSelectedAppointment()
    }
  }, [id, fetchAppointmentById, clearSelectedAppointment])

  const handleSubmit = async (data: AppointmentFormData) => {
    if (id) {
      try {
        await updateAppointment(id, data)
        showSuccess("Appointment updated successfully")
        navigate(`/appointments/${id}`)
      } catch (error) {
        showError("Failed to update appointment")
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
              <p>The appointment you are trying to edit does not exist or has been removed.</p>
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

  // Convert backend model to form data using utility function
  const initialData = appointmentToFormData(selectedAppointment)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/appointments/${id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Appointment</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <AppointmentForm initialData={initialData} onSubmit={handleSubmit} isEditing />
        </div>
      </div>
    </div>
  )
}

export default EditAppointmentPage
