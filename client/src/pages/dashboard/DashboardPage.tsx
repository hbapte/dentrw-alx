"use client"

import type React from "react"
import { useEffect } from "react"
import { usePatientStore } from "../../store/patient-store"
import { useDoctorStore } from "../../store/doctor-store"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import { useAppointmentStore } from "../../store/appointment-store"
import PatientDashboardWidget from "../../components/dashboard/PatientDashboardWidget"
import DoctorDashboardWidget from "../../components/dashboard/DoctorDashboardWidget"
import MedicalRecordDashboardWidget from "../../components/dashboard/MedicalRecordDashboardWidget"
import AppointmentDashboardWidget from "../../components/dashboard/AppointmentDashboardWidget"
import PatientStatistics from "../../components/dashboard/PatientStatistics"
import DoctorStatistics from "../../components/dashboard/DoctorStatistics"
import MedicalRecordStatistics from "../../components/dashboard/MedicalRecordStatistics"
import AppointmentStatistics from "../../components/dashboard/AppointmentStatistics"
import AppointmentCalendar from "../../components/appointments/AppointmentCalendar"
import { useAuthStore } from "../../store/auth-store"

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { fetchPatients } = usePatientStore()
  const { fetchDoctors } = useDoctorStore()
  const { fetchRecords } = useMedicalRecordStore()
  const { fetchAppointments } = useAppointmentStore()

  useEffect(() => {
    fetchPatients()
    fetchDoctors()
    fetchRecords()
    fetchAppointments()
  }, [fetchPatients, fetchDoctors, fetchRecords, fetchAppointments])

  const isAdmin = user?.role === "admin"
  const isDoctor = user?.role === "doctor"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Quick access widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PatientDashboardWidget />
        {(isAdmin || isDoctor) && <DoctorDashboardWidget />}
        {(isAdmin || isDoctor) && <MedicalRecordDashboardWidget />}
        <AppointmentDashboardWidget />
      </div>

      {/* Calendar view for appointments */}
      <div className="mt-8">
        <AppointmentCalendar />
      </div>

      {/* Statistics sections */}
      <div className="mt-8 space-y-8">
        {isAdmin && (
          <>
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Patient Statistics</h2>
              <PatientStatistics />
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Doctor Statistics</h2>
              <DoctorStatistics />
            </div>
          </>
        )}

        {(isAdmin || isDoctor) && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Medical Record Statistics</h2>
            <MedicalRecordStatistics />
          </div>
        )}

        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Appointment Statistics</h2>
          <AppointmentStatistics />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
