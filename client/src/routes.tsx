// client\src\routes.tsx
import type React from "react"
import {  Route, Routes } from "react-router-dom"
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
// import ProfilePage from "./pages/profile/ProfilePage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardLayout from "./components/layouts/DashboardLayout"
import { AuthProvider } from "./context/AuthContext"

const AppRouter: React.FC = () => {
  return (

      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Profile */}
              {/* <Route path="/profile" element={<ProfilePage />} /> */}

              {/* Patients */}
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:id" element={<PatientDetailsPage />} />
              <Route path="/patients/add" element={<AddPatientPage />} />
              <Route path="/patients/edit/:id" element={<EditPatientPage />} />

              {/* Doctors - Admin only */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
                <Route path="/doctors/add" element={<AddDoctorPage />} />
                <Route path="/doctors/edit/:id" element={<EditDoctorPage />} />
              </Route>

              {/* Appointments */}
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
              <Route path="/appointments/add" element={<AddAppointmentPage />} />
              <Route path="/appointments/edit/:id" element={<EditAppointmentPage />} />

              {/* Medical Records - Doctors and Admin only */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "doctor"]} />}>
                <Route path="/medical-records" element={<MedicalRecordsPage />} />
                <Route path="/medical-records/:id" element={<MedicalRecordDetailsPage />} />
                <Route path="/medical-records/add" element={<AddMedicalRecordPage />} />
                <Route path="/medical-records/edit/:id" element={<EditMedicalRecordPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
  )
}

export default AppRouter
