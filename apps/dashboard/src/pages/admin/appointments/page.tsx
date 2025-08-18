"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User, Stethoscope, UserCheck } from "lucide-react"
import { format } from "date-fns"
import type { Appointment } from "@/types/appointment.types"
import AppointmentService from "@/services/appointment.service"
import { AdminAppointmentCalendarComponent } from "@/components/admin/appointments/appointment-calendar"

export default function AdminAppointmentsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.")
      return
    }

    loadAllAppointments()
  }, [user, isAuthenticated])

  const loadAllAppointments = async () => {
    try {
      setLoading(true)
      const appointmentsResponse = await AppointmentService.getAllAppointments({ limit: 1000 })
      console.log("All appointments loaded:", appointmentsResponse)
      setAppointments(appointmentsResponse.appointments)

      // Filter today's appointments
      const today = new Date()
      const todayStr = format(today, "yyyy-MM-dd")
      const todayAppts = appointmentsResponse.appointments.filter(
        (apt) => format(new Date(apt.date), "yyyy-MM-dd") === todayStr && apt.status !== "cancelled",
      )
      console.log("Today's appointments:", todayAppts)
      setTodayAppointments(todayAppts)
    } catch (error) {
      console.error("Failed to load appointments:", error)
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "completed":
        return "bg-violet-50 text-violet-700 border-violet-200"
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200"
      case "no-show":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Appointment Management</h1>
        <p className="text-muted-foreground">
          Welcome, {user?.names}! Manage all clinic appointments from this dashboard.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayAppointments.filter((apt) => apt.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((apt) => apt.status === "completed").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Appointments
            </CardTitle>
            <CardDescription>Appointments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {typeof appointment.patient === "object" && appointment.patient !== null && "user" in appointment.patient
                            ? (appointment.patient as { user: { names: string } }).user.names
                            : typeof appointment.patient === "string"
                              ? appointment.patient
                              : "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="h-3 w-3" />
                        <span>
                          {typeof appointment.doctor === "object" && appointment.doctor !== null && "user" in appointment.doctor
                            ? (appointment.doctor as { user: { names: string } }).user.names
                            : typeof appointment.doctor === "string"
                              ? appointment.doctor
                              : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                      <div className="text-sm text-muted-foreground">{appointment.type}</div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription>
            View and manage all clinic appointments. Click on any appointment to edit or cancel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AdminAppointmentCalendarComponent />
        </CardContent>
      </Card>
    </div>
  )
}
