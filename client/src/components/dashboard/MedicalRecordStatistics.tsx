// client\src\components\dashboard\MedicalRecordStatistics.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FileText, AlertCircle, Calendar } from "lucide-react"
import api from "../../services/api"
import Loader from "../ui/Loader"
import {
  formatMedicalRecord,
  getMedicalRecordStatus,
  getStatusColor,
  getStatusLabel,
} from "../../utils/medical-record.utils"

const MedicalRecordStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedicalRecordStats = async () => {
      try {
        setLoading(true)
        const response = await api.get("/medical-records/stats")
        setStats(response.data.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch medical record statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchMedicalRecordStats()
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
            <h3 className="text-sm font-medium text-red-800">Error loading medical record statistics</h3>
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

  // Prepare data for diagnosis distribution chart
  const diagnosisData = Object.entries(stats.diagnosisDistribution || {}).map(([name, value]) => ({
    name,
    count: value,
  }))

  return (
    <div className="space-y-6">
      {/* Records Count Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Records</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalRecords}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/medical-records" className="font-medium text-indigo-700 hover:text-indigo-900">
                View all records
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Records This Month</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.recordsThisMonth}</div>
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
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Follow-ups Required</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.followUpRequired}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/medical-records?status=follow-up-required"
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                View follow-ups
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Distribution Chart */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Diagnosis Distribution</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={diagnosisData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Medical Records</h2>
          <Link
            to="/medical-records/add"
            className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
          >
            <FileText className="mr-1 h-4 w-4" />
            New
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentRecords && stats.recentRecords.length > 0 ? (
            stats.recentRecords.slice(0, 5).map((record: any) => {
              const formattedRecord = formatMedicalRecord(record)
              const status = getMedicalRecordStatus(record)
              const statusColorClass = getStatusColor(status)
              const statusText = getStatusLabel(status)

              return (
                <Link key={record._id} to={`/medical-records/${record._id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center px-6 py-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{formattedRecord.diagnosis}</p>
                      <p className="truncate text-sm text-gray-500">
                        Patient: {formattedRecord.patientName} | Doctor: {formattedRecord.doctorName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColorClass}`}
                      >
                        {statusText}
                      </span>
                      <p className="mt-1 text-sm text-gray-500">{formattedRecord.formattedDate}</p>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">No medical records yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalRecordStatistics
