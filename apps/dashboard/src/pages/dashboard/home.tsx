"use client"

import type React from "react"
import { useEffect } from "react"
import { usePatientStore } from "../../store/patient-store"
import { useDoctorStore } from "../../store/doctor-store"
import { useMedicalRecordStore } from "../../store/medical-record-store"
import { useAppointmentStore } from "../../store/appointment-store"
import { usePaymentStore } from "../../store/payment-store"
import PatientDashboardWidget from "../../components/dashboard/PatientDashboardWidget"
import DoctorDashboardWidget from "../../components/dashboard/DoctorDashboardWidget"
import MedicalRecordDashboardWidget from "../../components/dashboard/MedicalRecordDashboardWidget"
import AppointmentDashboardWidget from "../../components/dashboard/AppointmentDashboardWidget"
import PaymentDashboardWidget from "../../components/dashboard/PaymentDashboardWidget"
import PatientStatistics from "../../components/dashboard/PatientStatistics"
import DoctorStatistics from "../../components/dashboard/DoctorStatistics"
import MedicalRecordStatistics from "../../components/dashboard/MedicalRecordStatistics"
import AppointmentStatistics from "../../components/dashboard/AppointmentStatistics"
import PaymentStatistics from "../../components/dashboard/PaymentStatistics"
import AppointmentCalendar from "../../components/appointment-calendar/AppointmentCalendar"
import { useAuthStore } from "../../store/auth-store"
import PageHeader from "../../components/ui/page-header"

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { fetchPatients } = usePatientStore()
  const { fetchDoctors } = useDoctorStore()
  const { fetchRecords } = useMedicalRecordStore()
  const { fetchAppointments } = useAppointmentStore()
  const { fetchPayments } = usePaymentStore()

  useEffect(() => {
    fetchPatients()
    fetchDoctors()
    fetchRecords()
    fetchAppointments()
    fetchPayments()
  }, [fetchPatients, fetchDoctors, fetchRecords, fetchAppointments, fetchPayments])

  const isAdmin = user?.role === "admin"
  const isDoctor = user?.role === "doctor"
  const isPatient = user?.role === "patient"

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.names || "User"}!`}
        description="Here's an overview of your dental practice"
      />

      {/* Quick access widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {/* Show different widgets based on user role */}
        {(isAdmin || isDoctor) && <PatientDashboardWidget />}
        {isAdmin && <DoctorDashboardWidget />}
        {(isAdmin || isDoctor) && <MedicalRecordDashboardWidget />}
        <AppointmentDashboardWidget />
        <PaymentDashboardWidget />

        {/* For patients, show a larger calendar */}
        {isPatient && (
          <div className="md:col-span-2">
            <AppointmentCalendar />
          </div>
        )}
      </div>

      {/* Calendar view for appointments (for admin and doctor) */}
      {!isPatient && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Upcoming Appointments</h2>
          <AppointmentCalendar />
        </div>
      )}

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

        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Payment Statistics</h2>
          <PaymentStatistics />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
