// client\src\components\dashboard\DoctorDashboardWidget.tsx
import type React from "react"
import { Link } from "react-router-dom"
import { useDoctorStore } from "../../store/doctor-store"
import { getDoctorFullName } from "../../utils/doctor.utils"
import { Briefcase, UserPlus, Star } from "lucide-react"

const DoctorDashboardWidget: React.FC = () => {
  const { doctors } = useDoctorStore()

  // Get the 5 most recently added doctors
  const recentDoctors = [...doctors]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-medium text-gray-900">Doctors</h2>
        </div>
        <Link
          to="/doctors/add"
          className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        >
          <UserPlus className="mr-1 h-4 w-4" />
          New
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {recentDoctors.length > 0 ? (
          recentDoctors.map((doctor) => (
            <Link
              key={doctor.id || doctor._id}
              to={`/doctors/${doctor.id || doctor._id}`}
              className="block hover:bg-gray-50"
            >
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

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <Link to="/doctors" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all doctors
        </Link>
      </div>
    </div>
  )
}

export default DoctorDashboardWidget
