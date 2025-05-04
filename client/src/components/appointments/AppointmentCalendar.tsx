"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppointmentStore } from "../../store/appointment-store"
import { formatAppointment, getStatusColor } from "../../utils/appointment.utils"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Loader from "../ui/Loader"
import ErrorAlert from "../ui/ErrorAlert"

const AppointmentCalendar: React.FC = () => {
  const { appointments, loading, error, fetchAppointments, clearError } = useAppointmentStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    // Generate calendar days for the current month
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get the first day of the month
    const firstDay = new Date(year, month, 1)

    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Calculate the number of days to show from the previous month
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    // Calculate the start date (may be from the previous month)
    const startDate = new Date(year, month, 1 - daysFromPrevMonth)

    // Calculate the number of days to show in total (42 = 6 weeks)
    const totalDays = 42

    // Generate the array of dates
    const days: Date[] = []
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }

    setCalendarDays(days)

    // Set today as the selected date if it's in the current month
    const today = new Date()
    if (today.getMonth() === month && today.getFullYear() === year) {
      setSelectedDate(today)
    } else {
      setSelectedDate(firstDay)
    }
  }, [currentDate])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isSelectedDate = (date: Date) => {
    return (
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      )
    })
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={clearError} />
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
        <Link
          to="/appointments/add"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="col-span-2 overflow-hidden rounded-lg bg-white shadow">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Today
                </button>
                <button
                  onClick={goToNextMonth}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1">
              {/* Week days */}
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                const dateAppointments = getAppointmentsForDate(date)
                return (
                  <div
                    key={index}
                    className={`relative min-h-[80px] cursor-pointer rounded-md p-1 ${
                      isCurrentMonth(date)
                        ? isSelectedDate(date)
                          ? "bg-indigo-50 ring-2 ring-indigo-500"
                          : "hover:bg-gray-50"
                        : "text-gray-400"
                    } ${isToday(date) ? "font-bold" : ""}`}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${isToday(date) ? "rounded-full bg-indigo-600 px-1.5 text-white" : ""}`}
                      >
                        {date.getDate()}
                      </span>
                      {dateAppointments.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                          {dateAppointments.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dateAppointments.slice(0, 2).map((appointment) => {
                        const formattedAppointment = formatAppointment(appointment)
                        return (
                          <div
                            key={appointment.id || appointment._id}
                            className={`truncate rounded-sm px-1 py-0.5 text-xs ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.startTime} - {formattedAppointment.patientName.split(" ")[0]}
                          </div>
                        )
                      })}
                      {dateAppointments.length > 2 && (
                        <div className="truncate text-xs text-gray-500">+{dateAppointments.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected date appointments */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-4">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDate
                  ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                  : "Select a date"}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {selectedDateAppointments.length > 0 ? (
              selectedDateAppointments.map((appointment) => {
                const formattedAppointment = formatAppointment(appointment)
                return (
                  <Link
                    key={appointment.id || appointment._id}
                    to={`/appointments/${appointment.id || appointment._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{formattedAppointment.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Dr. {formattedAppointment.doctorName.split(" ")[1]}</p>
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500">No appointments for this date</p>
                <Link
                  to={`/appointments/add?date=${selectedDate ? selectedDate.toISOString().split("T")[0] : ""}`}
                  className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCalendar
