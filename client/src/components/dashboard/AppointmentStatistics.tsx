"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import api from "../../services/api"
import Loader from "../ui/Loader"
import {
  formatAppointment,
  getStatusColor,
  getStatusLabel,
  getTypeColor,
  getTypeLabel,
} from "../../utils/appointment.utils"
import type { AppointmentStatistics as AppointmentStatsType } from "../../types/appointment.types"

const STATUS_COLORS = ["#3b82f6", "#10b981", "#6366f1", "#ef4444", "#f59e0b"]
const TYPE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f97316"]

const AppointmentStatistics: React.FC = () => {
  const [stats, setStats] = useState<AppointmentStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentStats = async () => {
      try {
        setLoading(true)
        const response = await api.get("/appointments/stats")
        setStats(response.data.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch appointment statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="medium" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading appointment statistics</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Prepare data for status distribution chart
  const statusData = Object.entries(stats.appointmentsByStatus || {}).map(([name, value]) => ({
    name: getStatusLabel(name as any),
    value,
  }))

  // Prepare data for type distribution chart
  const typeData = Object.entries(stats.appointmentsByType || {}).map(([name, value]) => ({
    name: getTypeLabel(name as any),
    value,
  }))

  return (
    <div className="space-y-6">
      {/* Appointment Count Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalAppointments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/appointments" className="font-medium text-indigo-700 hover:text-indigo-900">
                View all appointments
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Today's Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.appointmentsToday}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">This Week</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.appointmentsThisWeek}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Status Distribution Chart */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Appointments by Status</h3>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Type Distribution Chart */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Appointments by Type</h3>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          <Link
            to="/appointments/add"
            className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
          >
            <Calendar className="mr-1 h-4 w-4" />
            New
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
            stats.upcomingAppointments.slice(0, 5).map((appointment) => {
              const formattedAppointment = formatAppointment(appointment)
              const statusColorClass = getStatusColor(appointment.status)
              const statusText = getStatusLabel(appointment.status)
              const typeColorClass = getTypeColor(appointment.type)
              const typeText = getTypeLabel(appointment.type)

              return (
                <Link key={appointment._id} to={`/appointments/${appointment._id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center px-6 py-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {formattedAppointment.patientName} - {typeText}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {formattedAppointment.formattedDate} at {formattedAppointment.formattedTime}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColorClass}`}
                      >
                        {statusText}
                      </span>
                      <p className="mt-1 text-sm text-gray-500">Dr. {formattedAppointment.doctorName.split(" ")[1]}</p>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">No upcoming appointments</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentStatistics
