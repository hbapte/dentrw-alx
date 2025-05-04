import type React from "react"
import { Link } from "react-router-dom"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import {
  formatMedicalRecord,
  getMedicalRecordStatus,
  getStatusColor,
  getStatusLabel,
} from "../../utils/medical-record.utils"
import { FileText, Plus } from "lucide-react"

const MedicalRecordDashboardWidget: React.FC = () => {
  const { records } = useMedicalRecordStore()

  // Get the 5 most recently added records
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((record) => formatMedicalRecord(record))

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-medium text-gray-900">Medical Records</h2>
        </div>
        <Link
          to="/medical-records/add"
          className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        >
          <Plus className="mr-1 h-4 w-4" />
          New
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {recentRecords.length > 0 ? (
          recentRecords.map((record: any) => {
            const status = getMedicalRecordStatus(record)
            const statusColorClass = getStatusColor(status)
            const statusText = getStatusLabel(status)

            return (
              <Link
                key={record.id || record._id}
                to={`/medical-records/${record.id || record._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="flex items-center px-6 py-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{record.diagnosis}</p>
                    <p className="truncate text-sm text-gray-500">Patient: {record.patientName}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColorClass}`}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">No medical records yet</div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <Link to="/medical-records" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all medical records
        </Link>
      </div>
    </div>
  )
}

export default MedicalRecordDashboardWidget
