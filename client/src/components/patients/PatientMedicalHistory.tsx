/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import {
  formatMedicalRecord,
  getMedicalRecordStatus,
  getStatusColor,
  getStatusLabel,
} from "../../utils/medical-record.utils"
import { FileText, Plus, Calendar } from "lucide-react"
import Loader from "../ui/Loader"
import ErrorAlert from "../ui/ErrorAlert"

interface PatientMedicalHistoryProps {
  patientId: string
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patientId }) => {
  const { patientHistory, loading, error, fetchPatientHistory, clearError } = useMedicalRecordStore()

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory(patientId)
    }
  }, [patientId, fetchPatientHistory])

  if (loading && patientHistory.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader size="medium" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={clearError} />
  }

  const formattedRecords = patientHistory.map((record) => formatMedicalRecord(record))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
        <Link
          to={`/medical-records/add?patientId=${patientId}`}
          className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Record
        </Link>
      </div>

      {formattedRecords.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
          <ul className="divide-y divide-gray-200">
            {formattedRecords.map((record: any) => {
              const status = getMedicalRecordStatus(record)
              const statusColorClass = getStatusColor(status)
              const statusText = getStatusLabel(status)

              return (
                <li key={record.id || record._id}>
                  <Link to={`/medical-records/${record.id || record._id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                          <p className="truncate text-sm font-medium text-indigo-600">{record.diagnosis}</p>
                        </div>
                        <div className="ml-2 flex flex-shrink-0">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColorClass}`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">Doctor: {record.doctorName}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          <p>{record.formattedDate}</p>
                        </div>
                      </div>
                      {record.followUpRequired && record.formattedFollowUpDate && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Follow-up: {record.formattedFollowUpDate}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
          <p className="mt-1 text-sm text-gray-500">This patient doesn't have any medical records yet.</p>
          <div className="mt-3">
            <Link
              to={`/medical-records/add?patientId=${patientId}`}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Medical Record
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientMedicalHistory
