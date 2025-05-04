/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, Plus, Clock } from "lucide-react"
import api from "../../services/api"
import Loader from "../ui/Loader"
import ErrorAlert from "../ui/ErrorAlert"
import { getStatusColor, getStatusLabel, getTypeColor, getTypeLabel } from "../../utils/appointment.utils"

interface PatientAppointmentsProps {
  patientId: string
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patientId }) => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/appointments?patientId=${patientId}`)
        setAppointments(response.data.data.appointments || [])
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch patient appointments")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatientAppointments()
    }
  }, [patientId])

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader size="medium" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={() => setError(null)} />
  }

  // Sort appointments by date (newest first)
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
        <Link
          to={`/appointments/add?patientId=${patientId}`}
          className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        >
          <Plus className="mr-1 h-4 w-4" />
          Schedule
        </Link>
      </div>

      {sortedAppointments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
          <ul className="divide-y divide-gray-200">
            {sortedAppointments.map((appointment) => {
              const statusColorClass = getStatusColor(appointment.status)
              const statusText = getStatusLabel(appointment.status)
              const typeColorClass = getTypeColor(appointment.type)
              const typeText = getTypeLabel(appointment.type)
              const appointmentDate = new Date(appointment.date)
              const formattedDate = appointmentDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })

              return (
                <li key={appointment._id}>
                  <Link to={`/appointments/${appointment._id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                          <p className="truncate text-sm font-medium text-indigo-600">{formattedDate}</p>
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
                          <p className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${typeColorClass}`}
                            >
                              {typeText}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {appointment.doctor && appointment.doctor.user
                              ? `Dr. ${appointment.doctor.user.names.split(" ")[1]}`
                              : "Unknown Doctor"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <Calendar className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-500">This patient doesn't have any appointments yet.</p>
          <div className="mt-3">
            <Link
              to={`/appointments/add?patientId=${patientId}`}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Schedule Appointment
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientAppointments
