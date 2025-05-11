"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { usePatientStore } from "../../store/patient-store"
import { formatDate } from "../../utils/date-utils"
import { getPatientFullName } from "../../utils/patient.utils"
import { Users, UserPlus, User } from "lucide-react"
import Loader from "../ui/Loader"
import PatientService from "../../services/patient.service"
import type { Patient } from "../../types/patient.types"

const PatientDashboardWidget = () => {
  const { patients, 
    // loading
   } = usePatientStore()
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [widgetLoading, setWidgetLoading] = useState(true)

  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        setWidgetLoading(true)
        // Try to get from stats endpoint first for better performance
        const stats = await PatientService.getPatientStats()
        if (stats.recentPatients && stats.recentPatients.length > 0) {
          setRecentPatients(stats.recentPatients.slice(0, 5))
        } else if (patients.length > 0) {
          // Fallback to using the patients from store
          const sorted = [...patients]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
          setRecentPatients(sorted)
        } else {
          // If no patients in store, fetch them
          const result = await PatientService.getAllPatients({
            page: 1,
            limit: 5,
            sortBy: "createdAt",
            sortOrder: "desc",
          })
          setRecentPatients(result.patients)
        }
      } catch (error) {
        console.error("Failed to fetch recent patients:", error)
      } finally {
        setWidgetLoading(false)
      }
    }

    fetchRecentPatients()
  }, [patients])

  if (widgetLoading) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Patients</h2>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <Loader size="medium" />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-medium text-gray-900">Patients</h2>
        </div>
        <Link
          to="/patients/add"
          className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200"
        >
          <UserPlus className="mr-1 h-4 w-4" />
          New
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {recentPatients.length > 0 ? (
          recentPatients.map((patient) => (
            <Link
              key={patient.id || patient._id}
              to={`/patients/${patient.id || patient._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="flex items-center px-6 py-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{getPatientFullName(patient)}</p>
                  <p className="truncate text-sm text-gray-500">{patient.email || patient.user?.email || ""}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Added {formatDate(patient.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">No patients yet</div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <Link to="/patients" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all patients
        </Link>
      </div>
    </div>
  )
}

export default PatientDashboardWidget
