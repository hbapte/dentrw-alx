// client\src\routes.tsx
"use client"

import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import TermsPage from "./pages/Terms"
import NotFound from "./pages/404"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import PatientsPage from "./pages/patients/PatientsPage"
import PatientDetailsPage from "./pages/patients/PatientDetailsPage"
import AddPatientPage from "./pages/patients/AddPatientPage"
import EditPatientPage from "./pages/patients/EditPatientPage"
import DoctorsPage from "./pages/doctors/DoctorsPage"
import DoctorDetailsPage from "./pages/doctors/DoctorDetailsPage"
import AddDoctorPage from "./pages/doctors/AddDoctorPage"
import EditDoctorPage from "./pages/doctors/EditDoctorPage"
import AppointmentsPage from "./pages/appointments/AppointmentsPage"
import AppointmentDetailsPage from "./pages/appointments/AppointmentDetailsPage"
import AddAppointmentPage from "./pages/appointments/AddAppointmentPage"
import EditAppointmentPage from "./pages/appointments/EditAppointmentPage"
import MedicalRecordsPage from "./pages/medical-records/MedicalRecordsPage"
import MedicalRecordDetailsPage from "./pages/medical-records/MedicalRecordDetailsPage"
import AddMedicalRecordPage from "./pages/medical-records/AddMedicalRecordPage"
import EditMedicalRecordPage from "./pages/medical-records/EditMedicalRecordPage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import AuthGuard from "./components/auth/AuthGuard"
import DashboardLayout from "./components/layouts/DashboardLayout"
import { useEffect } from "react"
import { useAuthStore } from "./store/auth-store"

import { ProfilePage } from "./pages/profile/ProfilePage"

import PaymentsPage from "./pages/payments/PaymentsPage"
import PaymentDetailsPage from "./pages/payments/PaymentDetailsPage"
import CreatePaymentPage from "./pages/payments/CreatePaymentPage"
import PaymentStatsPage from "./pages/payments/PaymentStatsPage"
import ResendVerificationPage from "./pages/auth/ResendVerificationPage"

const AppRouter = () => {
  const { checkAuth } = useAuthStore()

  // Check authentication status when the app loads
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
    }

    initAuth()
  }, [checkAuth])

  return (
    <Routes>
      {/* Public routes */}
      <Route index element={<HomePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes with dashboard layout */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Patients */}
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/patients/add" element={<AddPatientPage />} />
        <Route path="/patients/edit/:id" element={<EditPatientPage />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
        <Route path="/appointments/add" element={<AddAppointmentPage />} />
        <Route path="/appointments/edit/:id" element={<EditAppointmentPage />} />

        
        {/* Payments */}
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payments/:id" element={<PaymentDetailsPage />} />
        <Route path="/payments/create" element={<CreatePaymentPage />} />
        <Route path="/payments/stats" element={<PaymentStatsPage />} />

        {/* Admin only routes */}
        <Route
          path="/doctors"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <DoctorsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/doctors/:id"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <DoctorDetailsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/doctors/add"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <AddDoctorPage />
            </AuthGuard>
          }
        />
        <Route
          path="/doctors/edit/:id"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <EditDoctorPage />
            </AuthGuard>
          }
        />

        {/* Medical Records - Doctors and Admin only */}
        <Route
          path="/medical-records"
          element={
            <AuthGuard allowedRoles={["admin", "doctor"]}>
              <MedicalRecordsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/medical-records/:id"
          element={
            <AuthGuard allowedRoles={["admin", "doctor"]}>
              <MedicalRecordDetailsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/medical-records/add"
          element={
            <AuthGuard allowedRoles={["admin", "doctor"]}>
              <AddMedicalRecordPage />
            </AuthGuard>
          }
        />
        <Route
          path="/medical-records/edit/:id"
          element={
            <AuthGuard allowedRoles={["admin", "doctor"]}>
              <EditMedicalRecordPage />
            </AuthGuard>
          }
        />


      <Route
          path="/profile"
          element={
            <AuthGuard>
       
                <ProfilePage />
          
            </AuthGuard>
          }
        /> 
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
