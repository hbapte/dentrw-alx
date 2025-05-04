"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import { useNotificationStore } from "../../store/notification-store"
import {
  formatMedicalRecord,
  getMedicalRecordStatus,
  getStatusColor,
  getStatusLabel,
} from "../../utils/medical-record.utils"
import { Edit, Plus, Trash2, FileText, Filter } from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import SearchInput from "../../components/ui/SearchInput"
import Pagination from "../../components/ui/Pagination"
import ConfirmDialog from "../../components/ui/ConfirmDialog"

const MedicalRecordsPage: React.FC = () => {
  const { records, loading, error, fetchRecords, deleteRecord, clearError } = useMedicalRecordStore()
  const { showSuccess, showError } = useNotificationStore()
  const navigate = useNavigate()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const itemsPerPage = 10

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Filter records based on search term and status
  const filteredRecords = records
    .map((record) => formatMedicalRecord(record))
    .filter((record: any) => {
      const searchLower = searchTerm.toLowerCase()
      const patientName = record.patientName.toLowerCase()
      const doctorName = record.doctorName.toLowerCase()
      const diagnosis = record.diagnosis.toLowerCase()

      const matchesSearch =
        patientName.includes(searchLower) || doctorName.includes(searchLower) || diagnosis.includes(searchLower)

      if (statusFilter === "all") {
        return matchesSearch
      }

      const recordStatus = getMedicalRecordStatus(record)
      return matchesSearch && recordStatus === statusFilter
    })

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      try {
        await deleteRecord(recordToDelete)
        showSuccess("Medical record deleted successfully")
      } catch (err) {
        showError("Failed to delete medical record")
      } finally {
        setIsDeleteDialogOpen(false)
        setRecordToDelete(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setRecordToDelete(null)
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <Link
          to="/medical-records/add"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Record
        </Link>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <SearchInput
            placeholder="Search records..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:max-w-xs"
          />
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Records</option>
              <option value="completed">Completed</option>
              <option value="follow-up-required">Follow-up Required</option>
              <option value="follow-up-due-soon">Follow-up Due Soon</option>
              <option value="follow-up-overdue">Follow-up Overdue</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
        </div>
      </div>

      {filteredRecords.length > 0 ? (
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
                    Diagnosis
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date
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
                {paginatedRecords.map((record: any) => {
                  const status = getMedicalRecordStatus(record)
                  const statusColorClass = getStatusColor(status)
                  const statusText = getStatusLabel(status)

                  return (
                    <tr
                      key={record.id || record._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/medical-records/${record.id || record._id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">{record.doctorName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{record.diagnosis}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{record.formattedDate}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColorClass}`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/medical-records/edit/${record.id || record._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-5 w-5" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(record.id || record._id || "")
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Delete</span>
                          </button>
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
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Get started by adding a new medical record"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <div className="mt-6">
              <Link
                to="/medical-records/add"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Medical Record
              </Link>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Medical Record"
        message="Are you sure you want to delete this medical record? This action cannot be undone and will remove all associated data including prescriptions and attachments."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  )
}

export default MedicalRecordsPage
