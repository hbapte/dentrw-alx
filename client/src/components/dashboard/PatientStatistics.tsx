/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Users, UserPlus } from "lucide-react"
import PatientService from "../../services/patient.service"
import Loader from "../ui/Loader"
import type { PatientStatistics as PatientStatsType } from "../../types/patient.types"
import { formatDate } from "@/utils/format-utils"
import { getPatientFullName } from "../../utils/patient.utils"

const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#6b7280"]

const PatientStatistics = () => {
  const [stats, setStats] = useState<PatientStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        setLoading(true)
        const data = await PatientService.getPatientStats()
        setStats(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || "Failed to fetch patient statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientStats()
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
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading patient statistics</h3>
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

  // Prepare data for gender distribution chart
  const genderData = [
    { name: "Male", value: stats.genderDistribution.male },
    { name: "Female", value: stats.genderDistribution.female },
    { name: "Other", value: stats.genderDistribution.other },
    { name: "Unspecified", value: stats.genderDistribution.unspecified },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Patient Count Card */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">Total Patients</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.totalPatients}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link to="/patients" className="font-medium text-blue-700 hover:text-blue-900">
              View all patients
            </Link>
          </div>
        </div>
      </div>

      {/* Gender Distribution Chart */}
      {genderData.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Patient Gender Distribution</h3>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Patients */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Patients</h2>
          <Link
            to="/patients/add"
            className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200"
          >
            <UserPlus className="mr-1 h-4 w-4" />
            New
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentPatients && stats.recentPatients.length > 0 ? (
            stats.recentPatients.slice(0, 5).map((patient) => (
              <Link key={patient._id} to={`/patients/${patient._id}`} className="block hover:bg-gray-50">
                <div className="flex items-center px-6 py-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{getPatientFullName(patient)}</p>
                    <p className="truncate text-sm text-gray-500">{patient.user?.email || "No email"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{formatDate(patient.createdAt)}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">No patients yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientStatistics
