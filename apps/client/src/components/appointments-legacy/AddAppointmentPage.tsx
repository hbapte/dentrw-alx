"use client"

import type React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import AppointmentForm from "../appointment-calendar/AppointmentForm"
import type { AppointmentFormData } from "../../types/appointment.types"

const AddAppointmentPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { createAppointment } = useAppointmentStore()
  const { showSuccess, showError } = useNotificationStore()

  // Extract query parameters if they exist
  const queryParams = new URLSearchParams(location.search)
  const patientId = queryParams.get("patientId") || undefined
  const doctorId = queryParams.get("doctorId") || undefined

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      await createAppointment(data)
      showSuccess("Appointment scheduled successfully")
      navigate("/appointments")
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      showError("Failed to schedule appointment")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/appointments" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Schedule New Appointment</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <AppointmentForm onSubmit={handleSubmit} patientId={patientId} doctorId={doctorId} />
        </div>
      </div>
    </div>
  )
}

export default AddAppointmentPage
