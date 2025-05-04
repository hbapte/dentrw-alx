"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { usePatientStore } from "../../store/patient-store"
import { useNotificationStore } from "../../store/notification-store"
import { formatDate } from "../../utils/date-utils"
import { formatPhoneNumber } from "../../utils/format-utils"
import { getPatientFullName } from "../../utils/patient.utils"
import { ArrowLeft, Edit, Trash2, User, Calendar, Phone, Mail, MapPin, AlertCircle, Heart, Shield } from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import PatientAppointments from "../../components/patients/PatientAppointments"

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedPatient, loading, error, fetchPatientById, deletePatient, clearSelectedPatient, clearError } =
    usePatientStore()
  const { showSuccess, showError } = useNotificationStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPatientById(id)
    }

    return () => {
      clearSelectedPatient()
    }
  }, [id, fetchPatientById, clearSelectedPatient])

  const handleDelete = async () => {
    if (id) {
      try {
        await deletePatient(id)
        showSuccess("Patient deleted successfully")
        navigate("/patients")
      } catch {
        showError("Failed to delete patient")
      } finally {
        setIsDeleteDialogOpen(false)
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
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Patient not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The patient you are looking for does not exist or has been removed.</p>
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

  const patientName = getPatientFullName(selectedPatient)
  const email = selectedPatient.email || selectedPatient.user?.email || ""
  const phone = selectedPatient.phone || selectedPatient.user?.phoneNumber || ""

  // Extract address data
  const address = selectedPatient.address || {}
  const formattedAddress = address.street
    ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`
    : "No address provided"

  // Define type for medical history
  interface MedicalHistory {
    allergies?: string[]
    conditions?: string[]
    medications?: string[]
    notes?: string
  }

  // Extract medical history
  const medicalHistory: MedicalHistory = selectedPatient.medicalHistory || {}

  // Define type for emergency contact
  interface EmergencyContact {
    name?: string
    relationship?: string
    phoneNumber?: string
  }

  // Extract emergency contact
  const emergencyContact: EmergencyContact = selectedPatient.emergencyContact || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patients" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/patients/edit/${id}`}
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
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{patientName}</h2>
              <p className="text-sm text-gray-500">Patient ID: {selectedPatient._id || selectedPatient.id}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                Date of Birth
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : "Not provided"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Mail className="mr-2 h-5 w-5 text-gray-400" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{email || "Not provided"}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Phone className="mr-2 h-5 w-5 text-gray-400" />
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {phone ? formatPhoneNumber(phone) : "Not provided"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formattedAddress}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <AlertCircle className="mr-2 h-5 w-5 text-gray-400" />
                Gender
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedPatient.gender
                  ? selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1)
                  : "Not specified"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Emergency Contact */}
      {emergencyContact && emergencyContact.name && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Emergency Contact</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{emergencyContact.name}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{emergencyContact.relationship}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {emergencyContact.phoneNumber ? formatPhoneNumber(emergencyContact.phoneNumber) : "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Medical History */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Medical History</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <AlertCircle className="mr-2 h-5 w-5 text-gray-400" />
                Allergies
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {medicalHistory.allergies && medicalHistory.allergies.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {medicalHistory.allergies.map((allergy, index) => (
                      <li key={index}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  "No known allergies"
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Heart className="mr-2 h-5 w-5 text-gray-400" />
                Medical Conditions
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {medicalHistory.conditions && medicalHistory.conditions.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {medicalHistory.conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  "No known conditions"
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Shield className="mr-2 h-5 w-5 text-gray-400" />
                Medications
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {medicalHistory.medications && medicalHistory.medications.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {medicalHistory.medications.map((medication, index) => (
                      <li key={index}>{medication}</li>
                    ))}
                  </ul>
                ) : (
                  "No current medications"
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {medicalHistory.notes || "No additional notes"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Insurance Information */}
      {selectedPatient.insuranceInfo && selectedPatient.insuranceInfo.provider && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Insurance Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {selectedPatient.insuranceInfo.provider}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {selectedPatient.insuranceInfo.policyNumber}
                </dd>
              </div>
              {selectedPatient.insuranceInfo.groupNumber && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Group Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {selectedPatient.insuranceInfo.groupNumber}
                  </dd>
                </div>
              )}
              {selectedPatient.insuranceInfo.expiryDate && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formatDate(selectedPatient.insuranceInfo.expiryDate)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Patient Appointments */}
      {selectedPatient && (
        <div className="mt-6">
          <PatientAppointments patientId={selectedPatient.id || selectedPatient._id?.toString() || ""} />
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone and will remove all associated data including appointments and medical records."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        type="danger"
      />
    </div>
  )
}

export default PatientDetailsPage
