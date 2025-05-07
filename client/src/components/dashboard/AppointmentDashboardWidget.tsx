/* eslint-disable @typescript-eslint/no-explicit-any */
// client\src\components\dashboard\AppointmentDashboardWidget.tsx
import type React from "react"
import { Link } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { formatAppointment, getStatusColor, getStatusLabel, isAppointmentToday } from "../../utils/appointment.utils"
import { Calendar, Plus } from "lucide-react"

const AppointmentDashboardWidget: React.FC = () => {
  const { appointments } = useAppointmentStore()

  // Get today's appointments
  const todayAppointments = appointments
    .filter(isAppointmentToday)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5)
    .map((appointment) => formatAppointment(appointment))

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-medium text-gray-900">Today's Appointments</h2>
        </div>
        <Link
          to="/appointments/add"
          className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
        >
          <Plus className="mr-1 h-4 w-4" />
          New
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {todayAppointments.length > 0 ? (
          todayAppointments.map((appointment: any) => {
            const statusColorClass = getStatusColor(appointment.status)
            const statusText = getStatusLabel(appointment.status)

            return (
              <Link
                key={appointment.id || appointment._id}
                to={`/appointments/${appointment.id || appointment._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="flex items-center px-6 py-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="truncate text-sm text-gray-500">{appointment.formattedTime}</p>
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
          <div className="px-6 py-4 text-center text-gray-500">No appointments scheduled for today</div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <Link to="/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all appointments
        </Link>
      </div>
    </div>
  )
}

export default AppointmentDashboardWidget
