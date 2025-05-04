"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { usePatientStore } from "../../store/patient-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import PatientForm from "../../components/patients/PatientForm"
import type { PatientFormData } from "../../types/patient.types"

const AddPatientPage: React.FC = () => {
  const navigate = useNavigate()
  const { createPatient } = usePatientStore()
  const { showSuccess, showError } = useNotificationStore()

  const handleSubmit = async (data: PatientFormData) => {
    try {
      await createPatient(data)
      showSuccess("Patient created successfully")
      navigate("/patients")
    } catch  {
      showError("Failed to create patient")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/patients" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <PatientForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default AddPatientPage
