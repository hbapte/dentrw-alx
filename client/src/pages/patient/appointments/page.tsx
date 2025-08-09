"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { PatientBookingCalendarComponent } from "@/components/patient/booking/booking-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import type { DentalAppointment } from "@/types/dental-appointment.types"
import PatientAppointmentService from "@/services/patient-appointment.service"
import { CalendarProvider } from "@/components/appointment-calendar/patient/calendar-context"
import { CalendarDndProvider } from "@/components/appointment-calendar/patient"

export default function PatientAppointmentsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const patientId = user?.patientId
  const [appointments, setAppointments] = useState<DentalAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [upcomingAppointments, setUpcomingAppointments] = useState<DentalAppointment[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to view your appointments")
      return
    }

    loadPatientAppointments()
  }, [user, isAuthenticated])

  const loadPatientAppointments = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const appointmentsData = await PatientAppointmentService.getPatientAppointments(user.id)
      setAppointments(appointmentsData)

      // Filter upcoming appointments
      const now = new Date()
      const upcoming = appointmentsData
        .filter((apt) => new Date(apt.date) >= now && apt.status !== "cancelled")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)

      setUpcomingAppointments(upcoming)
    } catch (error) {
      console.error("Failed to load appointments:", error)
      toast.error("Failed to load your appointments")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: DentalAppointment["status"]) => {
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

  const getTypeLabel = (type: DentalAppointment["type"]) => {
    switch (type) {
      case "consultation":
        return "Consultation"
      case "checkup":
        return "Check-up"
      case "treatment":
        return "Treatment"
      case "follow-up":
        return "Follow-up"
      default:
        return type
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your appointments</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <CalendarProvider>
      <CalendarDndProvider>
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground">Welcome back, {user.names}! Manage your dental appointments here.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
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

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.doctor.user.names}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.doctor.specialization.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{format(new Date(appointment.date), "MMM d, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Badge variant="secondary">{getTypeLabel(appointment.type)}</Badge>
                    </div>
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
            View and manage your appointments. Click on any appointment to edit or cancel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PatientBookingCalendarComponent         
            appointments={appointments}
            onAppointmentsChange={setAppointments}
          />
        </CardContent>
      </Card>
    </div>
    </CalendarDndProvider>
    </CalendarProvider>
  )
}
