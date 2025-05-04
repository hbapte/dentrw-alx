"use client"

import type React from "react"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import MedicalRecordForm from "../../components/medical-records/MedicalRecordForm"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import { recordToFormData } from "../../utils/medical-record.utils"
import type { MedicalRecordFormData } from "../../types/medical-record.types"

const EditMedicalRecordPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedRecord, loading, error, fetchRecordById, updateRecord, clearSelectedRecord, clearError } =
    useMedicalRecordStore()
  const { showSuccess, showError } = useNotificationStore()

  useEffect(() => {
    if (id) {
      fetchRecordById(id)
    }

    return () => {
      clearSelectedRecord()
    }
  }, [id, fetchRecordById, clearSelectedRecord])

  const handleSubmit = async (data: MedicalRecordFormData) => {
    if (id) {
      try {
        await updateRecord(id, data)
        showSuccess("Medical record updated successfully")
        navigate(`/medical-records/${id}`)
      } catch (error) {
        showError("Failed to update medical record")
      }
    }
  }

  if (loading && !selectedRecord) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={clearError} />
  }

  if (!selectedRecord) {
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
            <h3 className="text-sm font-medium text-yellow-800">Medical record not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The medical record you are trying to edit does not exist or has been removed.</p>
            </div>
            <div className="mt-4">
              <Link
                to="/medical-records"
                className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
              >
                Go back to medical records
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Convert backend model to form data using utility function
  const initialData = recordToFormData(selectedRecord)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/medical-records/${id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Medical Record</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <MedicalRecordForm initialData={initialData} onSubmit={handleSubmit} isEditing />
        </div>
      </div>
    </div>
  )
}

export default EditMedicalRecordPage
