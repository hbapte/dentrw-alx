"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { usePatientStore } from "../../store/patient-store"
import { useNotificationStore } from "../../store/notification-store"
import { formatDate } from "../../utils/date-utils"
import { formatPhoneNumber } from "../../utils/format-utils"
import { getPatientFullName } from "../../utils/patient.utils"
import { Edit, Plus, Trash2, User, UserPlus } from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import SearchInput from "../../components/ui/SearchInput"
import Pagination from "../../components/ui/Pagination"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import type { Patient } from "../../types/patient.types"

const PatientsPage: React.FC = () => {
  const { patients, loading, error, fetchPatients, deletePatient, clearError } = usePatientStore()
  const { showSuccess, showError } = useNotificationStore()
  const navigate = useNavigate()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient: Patient) => {
    const searchLower = searchTerm.toLowerCase()
    const firstName = patient.firstName?.toLowerCase() || ""
    const lastName = patient.lastName?.toLowerCase() || ""
    const email = patient.email?.toLowerCase() || patient.user?.email?.toLowerCase() || ""
    const phone = patient.phone || patient.user?.phoneNumber || ""
    const fullName = getPatientFullName(patient).toLowerCase()

    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchTerm)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleDeleteClick = (id: string) => {
    setPatientToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        await deletePatient(patientToDelete)
        showSuccess("Patient deleted successfully")
      } catch {
        showError("Failed to delete patient")
      } finally {
        setIsDeleteDialogOpen(false)
        setPatientToDelete(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setPatientToDelete(null)
  }

  if (loading && patients.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <Link
          to="/patients/add"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add Patient
        </Link>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <SearchInput
          placeholder="Search patients..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full sm:max-w-xs"
        />
        <div className="text-sm text-gray-500">
          Showing {filteredPatients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date of Birth
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Added
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id || patient._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/patients/${patient.id || patient._id}`)}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getPatientFullName(patient)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{patient.email || patient.user?.email || ""}</div>
                      <div className="text-sm text-gray-500">
                        {formatPhoneNumber(patient.phone || patient.user?.phoneNumber || "")}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(patient.dateOfBirth || "")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/patients/edit/${patient.id || patient._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(patient.id || patient._id || "")
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding a new patient"}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/patients/add"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Patient
              </Link>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone and will remove all associated data including appointments and medical records."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  )
}

export default PatientsPage
