// client\src\pages\doctors\DoctorsPage.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDoctorStore } from "../../store/doctor-store"
import { useNotificationStore } from "../../store/notification-store"
import { getDoctorFullName } from "../../utils/doctor.utils"
import { Edit, Plus, Trash2, UserPlus, Star, Briefcase } from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import SearchInput from "../../components/ui/SearchInput"
import Pagination from "../../components/ui/Pagination"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import type { Doctor } from "../../types/doctor.types"

const DoctorsPage: React.FC = () => {
  const { doctors, loading, error, fetchDoctors, deleteDoctor, clearError } = useDoctorStore()
  const { showSuccess, showError } = useNotificationStore()
  const navigate = useNavigate()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter((doctor: Doctor) => {
    const searchLower = searchTerm.toLowerCase()
    const doctorName = getDoctorFullName(doctor).toLowerCase()
    const specialization = doctor.specialization?.toLowerCase() || ""

    return (
      doctorName.includes(searchLower) ||
      specialization.includes(searchLower) ||
      doctor.qualifications?.some((q) => q.toLowerCase().includes(searchLower)) ||
      doctor.languages?.some((l) => l.toLowerCase().includes(searchLower))
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleDeleteClick = (id: string) => {
    setDoctorToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (doctorToDelete) {
      try {
        await deleteDoctor(doctorToDelete)
        showSuccess("Doctor deleted successfully")
      } catch {
        showError("Failed to delete doctor")
      } finally {
        setIsDeleteDialogOpen(false)
        setDoctorToDelete(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setDoctorToDelete(null)
  }

  if (loading && doctors.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <Link
          to="/doctors/add"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add Doctor
        </Link>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <SearchInput
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full sm:max-w-xs"
        />
        <div className="text-sm text-gray-500">
          Showing {filteredDoctors.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredDoctors.length)} of {filteredDoctors.length} doctors
        </div>
      </div>

      {filteredDoctors.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Specialization
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Experience
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Fee
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedDoctors.map((doctor) => (
                  <tr
                    key={doctor.id || doctor._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/doctors/${doctor.id || doctor._id}`)}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <Briefcase className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getDoctorFullName(doctor)}</div>
                          <div className="text-sm text-gray-500">
                            {doctor.qualifications?.slice(0, 2).join(", ")}
                            {doctor.qualifications?.length > 2 ? "..." : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{doctor.specialization}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {doctor.experience} {doctor.experience === 1 ? "year" : "years"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-900">
                          {doctor.averageRating ? doctor.averageRating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      ${doctor.consultationFee.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/doctors/edit/${doctor.id || doctor._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(doctor.id || doctor._id || "")
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Briefcase className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding a new doctor"}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/doctors/add"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Doctor
              </Link>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This action cannot be undone and will remove all associated data including appointments and ratings."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  )
}

export default DoctorsPage
