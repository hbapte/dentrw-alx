"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Briefcase, UserPlus, Star } from "lucide-react"
import api from "../../services/api"
import Loader from "../ui/Loader"
import type { DoctorStatistics as DoctorStatsType } from "../../types/doctor.types"
import { getDoctorFullName } from "../../utils/doctor.utils"

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const DoctorStatistics: React.FC = () => {
  const [stats, setStats] = useState<DoctorStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        setLoading(true)
        const response = await api.get("/doctors/stats")
        setStats(response.data.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch doctor statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorStats()
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
            <h3 className="text-sm font-medium text-red-800">Error loading doctor statistics</h3>
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

  // Prepare data for specialization distribution chart
  const specializationData = Object.entries(stats.specializationDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="space-y-6">
      {/* Doctor Count Card */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Briefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">Total Doctors</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.totalDoctors}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link to="/doctors" className="font-medium text-indigo-700 hover:text-indigo-900">
              View all doctors
            </Link>
          </div>
        </div>
      </div>

      {/* Average Rating Card */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">Average Rating</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Specialization Distribution Chart */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Specialization Distribution</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specializationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {specializationData.map((entry, index) => (
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

      {/* Recent Doctors */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Doctors</h2>
          <Link
            to="/doctors/add"
            className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
          >
            <UserPlus className="mr-1 h-4 w-4" />
            New
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentDoctors && stats.recentDoctors.length > 0 ? (
            stats.recentDoctors.slice(0, 5).map((doctor) => (
              <Link key={doctor._id} to={`/doctors/${doctor._id}`} className="block hover:bg-gray-50">
                <div className="flex items-center px-6 py-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <Briefcase className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{getDoctorFullName(doctor)}</p>
                    <p className="truncate text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-500">
                      {doctor.averageRating ? doctor.averageRating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">No doctors yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorStatistics
