// client\src\pages\medical-records\MedicalRecordDetailsPage.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import { useNotificationStore } from "../../store/notification-store"
import {
  formatMedicalRecord,
  getMedicalRecordStatus,
  getStatusColor,
  getStatusLabel,
} from "../../utils/medical-record.utils"
import { ArrowLeft, Edit, Trash2, FileText, Stethoscope, Clipboard, Calendar, User, UserPlus } from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import PrescriptionForm from "../../components/medical-records/PrescriptionForm"
import AttachmentUploader from "../../components/medical-records/AttachmentUploader"

const MedicalRecordDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    selectedRecord,
    loading,
    error,
    fetchRecordById,
    deleteRecord,
    addAttachment,
    removeAttachment,
    clearSelectedRecord,
    clearError,
  } = useMedicalRecordStore()
  const { showSuccess, showError } = useNotificationStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchRecordById(id)
    }

    return () => {
      clearSelectedRecord()
    }
  }, [id, fetchRecordById, clearSelectedRecord])

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteRecord(id)
        showSuccess("Medical record deleted successfully")
        navigate("/medical-records")
      } catch (err) {
        console.error(err)
        showError("Failed to delete medical record")
      } finally {
        setIsDeleteDialogOpen(false)
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    if (id) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("name", file.name)
        formData.append("fileType", file.type)

        await addAttachment(id, formData)
        showSuccess("Attachment uploaded successfully")
      } catch (err) {
        console.error(err)
        showError("Failed to upload attachment")
      }
    }
  }

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (id) {
      try {
        await removeAttachment(id, attachmentId)
        showSuccess("Attachment removed successfully")
      } catch (err) {
        console.error(err)
        showError("Failed to remove attachment")
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
              <p>The medical record you are looking for does not exist or has been removed.</p>
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

  const formattedRecord = formatMedicalRecord(selectedRecord)
  const status = getMedicalRecordStatus(selectedRecord)
  const statusColorClass = getStatusColor(status)
  const statusText = getStatusLabel(status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/medical-records" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Medical Record Details</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/medical-records/edit/${id}`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formattedRecord.diagnosis}</h2>
              <p className="text-sm text-gray-500">Created on {formattedRecord.formattedDate}</p>
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
                <Link
                  to={`/patients/${typeof selectedRecord.patient === "object" ? selectedRecord.patient.id || selectedRecord.patient._id : selectedRecord.patient}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {formattedRecord.patientName}
                </Link>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <UserPlus className="mr-2 h-5 w-5 text-gray-400" />
                Doctor
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <Link
                  to={`/doctors/${typeof selectedRecord.doctor === "object" ? selectedRecord.doctor.id || selectedRecord.doctor._id : selectedRecord.doctor}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {formattedRecord.doctorName}
                </Link>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Stethoscope className="mr-2 h-5 w-5 text-gray-400" />
                Diagnosis
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{selectedRecord.diagnosis}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Clipboard className="mr-2 h-5 w-5 text-gray-400" />
                Treatment
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-line">
                {selectedRecord.treatment}
              </dd>
            </div>
            {selectedRecord.notes && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <FileText className="mr-2 h-5 w-5 text-gray-400" />
                  Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-line">
                  {selectedRecord.notes}
                </dd>
              </div>
            )}
            {selectedRecord.followUpRequired && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                  Follow-up Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {formattedRecord.formattedFollowUpDate || "Not specified"}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Prescriptions */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <PrescriptionForm prescriptions={selectedRecord.prescription} onChange={() => {}} readOnly />
        </div>
      </div>

      {/* Attachments */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <AttachmentUploader
            attachments={selectedRecord.attachments}
            onUpload={handleFileUpload}
            onRemove={handleRemoveAttachment}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Medical Record"
        message="Are you sure you want to delete this medical record? This action cannot be undone and will remove all associated data including prescriptions and attachments."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        type="danger"
      />
    </div>
  )
}

export default MedicalRecordDetailsPage
