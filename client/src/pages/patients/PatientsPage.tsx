/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { usePatientStore } from "@/store/patient-store"
import { useNotificationStore } from "@/store/notification-store"
import { useAuthStore } from "@/store/auth-store"
import { formatDate, formatPhoneNumber } from "@/utils/format-utils"
import { getPatientFullName } from "@/utils/patient.utils"
import { Edit, Plus, Trash2, User, UserPlus, SlidersHorizontal } from "lucide-react"
import Loader from "@/components/ui/Loader"
import ErrorAlert from "@/components/ui/ErrorAlert"
import SearchInput from "@/components/ui/SearchInput"
import Pagination from "@/components/ui/Paginationn"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

const PatientsPage = () => {
  const { patients, loading, error, pagination, filters, setFilters, fetchPatients, deletePatient, clearError } =
    usePatientStore()

  const { showSuccess, showError } = useNotificationStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Local state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Load patients on mount and when filters change
  useEffect(() => {
    fetchPatients(pagination.page, pagination.pageSize)
  }, [
    fetchPatients,
    pagination.page,
    pagination.pageSize,
    filters.search,
    filters.gender,
    filters.sortBy,
    filters.sortOrder,
  ])

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
    // Reset to first page when search changes
    if (pagination.page !== 1) {
      fetchPatients(1, pagination.pageSize)
    }
  }

  const handlePageChange = (page: number) => {
    fetchPatients(page, pagination.pageSize)
  }

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

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setIsFilterDialogOpen(false)
    fetchPatients(1, pagination.pageSize) // Reset to first page with new filters
  }

  // Check if user has admin or doctor role
  const canManagePatients = user?.role === "admin" || user?.role === "doctor"

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
        {canManagePatients && (
          <Link
            to="/patients/add"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Add Patient
          </Link>
        )}
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2 w-full sm:max-w-md">
          <SearchInput
            placeholder="Search patients..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full"
          />
          <button
            onClick={() => setIsFilterDialogOpen(true)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filters
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {pagination.totalItems > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0} to{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} patients
        </div>
      </div>

      {patients.length > 0 ? (
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
                {patients.map((patient) => (
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
                          <div className="text-sm text-gray-500">
                            {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : ""}
                          </div>
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
                      {canManagePatients && (
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
          />
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.gender
              ? "Try adjusting your search or filter terms"
              : "Get started by adding a new patient"}
          </p>
          {!filters.search && !filters.gender && canManagePatients && (
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

      {/* Delete Confirmation Dialog */}
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

      {/* Filter Dialog */}
      {isFilterDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Filter Patients</h3>
                    <div className="mt-4 space-y-4">
                      {/* Gender Filter */}
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <select
                          id="gender"
                          value={filters.gender || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              gender: e.target.value ? (e.target.value as "male" | "female" | "other") : undefined,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">All Genders</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Sort Options */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                            Sort By
                          </label>
                          <select
                            id="sortBy"
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="createdAt">Date Added</option>
                            <option value="firstName">First Name</option>
                            <option value="lastName">Last Name</option>
                            <option value="dateOfBirth">Date of Birth</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                            Order
                          </label>
                          <select
                            id="sortOrder"
                            value={filters.sortOrder}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                sortOrder: e.target.value as "asc" | "desc",
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleApplyFilters(filters)}
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setFilters({
                      search: "",
                      gender: undefined,
                      sortBy: "createdAt",
                      sortOrder: "desc",
                    })
                    setIsFilterDialogOpen(false)
                    fetchPatients(1, pagination.pageSize)
                  }}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsFilterDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientsPage
