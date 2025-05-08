"use client"

import type React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import MedicalRecordForm from "../../components/medical-records/MedicalRecordForm"
import type { MedicalRecordFormData } from "../../types/medical-record.types"

const AddMedicalRecordPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { createRecord } = useMedicalRecordStore()
  const { showSuccess, showError } = useNotificationStore()

  // Extract query parameters if they exist
  const queryParams = new URLSearchParams(location.search)
  const patientId = queryParams.get("patientId") || undefined
  const doctorId = queryParams.get("doctorId") || undefined
  const appointmentId = queryParams.get("appointmentId") || undefined

  const handleSubmit = async (data: MedicalRecordFormData) => {
    try {
      await createRecord(data)
      showSuccess("Medical record created successfully")
      navigate("/medical-records")
    } catch (error) {
      console.error(error)
      showError("Failed to create medical record")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/medical-records" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Medical Record</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <MedicalRecordForm
            onSubmit={handleSubmit}
            patientId={patientId}
            doctorId={doctorId}
            appointmentId={appointmentId}
          />
        </div>
      </div>
    </div>
  )
}

export default AddMedicalRecordPage
