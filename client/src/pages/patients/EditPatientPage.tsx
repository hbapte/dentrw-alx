"use client"

import type React from "react"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { usePatientStore } from "../../store/patient-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import PatientForm from "../../components/patients/PatientForm"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import { patientToFormData } from "../../utils/patient.utils"
import type { PatientFormData } from "../../types/patient.types"

const EditPatientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedPatient, loading, error, fetchPatientById, updatePatient, clearSelectedPatient, clearError } =
    usePatientStore()
  const { showSuccess, showError } = useNotificationStore()

  useEffect(() => {
    if (id) {
      fetchPatientById(id)
    }

    return () => {
      clearSelectedPatient()
    }
  }, [id, fetchPatientById, clearSelectedPatient])

  const handleSubmit = async (data: PatientFormData) => {
    if (id) {
      try {
        await updatePatient(id, data)
        showSuccess("Patient updated successfully")
        navigate(`/patients/${id}`)
      } catch {
        showError("Failed to update patient")
      }
    }
  }

  if (loading && !selectedPatient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={clearError} />
  }

  if (!selectedPatient) {
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
            <h3 className="text-sm font-medium text-yellow-800">Patient not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The patient you are trying to edit does not exist or has been removed.</p>
            </div>
            <div className="mt-4">
              <Link
                to="/patients"
                className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
              >
                Go back to patients
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Convert backend model to form data using utility function
  const initialData = patientToFormData(selectedPatient)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/patients/${id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <PatientForm initialData={initialData} onSubmit={handleSubmit} isEditing />
        </div>
      </div>
    </div>
  )
}

export default EditPatientPage
