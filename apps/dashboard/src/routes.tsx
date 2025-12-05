// apps\dashboard\src\routes.tsx
"use client"
import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import { useAuthStore } from "./store/auth-store"

// PUBLIC
import HomePage from "./pages/HomePage"
import TermsPage from "./pages/Terms"
import NotFound from "./pages/404"

// AUTH
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import ResendVerificationPage from "./pages/auth/ResendVerificationPage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import AuthGuard from "./components/auth/AuthGuard"


// DASHBOARD HOME
import DashboardPage from "./pages/dashboard/home"

// PATIENTS
import PatientsPage from "./pages/patients/page"
// import PatientPage from "./pages/patients/PatientsPage"
import PatientDetailsPage from "./pages/patients/PatientDetailsPage"
import AddPatientPage from "./pages/patients/AddPatientPage"
import EditPatientPage from "./pages/patients/EditPatientPage"

// DOCTORS
import DoctorsPage from "./pages/doctors/page"
// import DoctorsPage from "./pages/doctors/DoctorsPage"
import AddDoctorPage from "./pages/doctors/AddDoctorPage"
import EditDoctorPage from "./pages/doctors/EditDoctorPage"
import DoctorDetailsPage from "./pages/doctors/DoctorDetailsPage"
// import NewDoctorsPage from "./pages/doctors/new/page"

// APPOINTMENTS
import AppointmentsPage from "./pages/appointments/page"
// import AppointmentsPage from "./pages/appointments/AppointmentsPage"
import AppointmentDetailsPage from "./components/appointments-legacy/AppointmentDetailsPage"
import AddAppointmentPage from "./components/appointments-legacy/AddAppointmentPage"
import EditAppointmentPage from "./components/appointments-legacy/EditAppointmentPage"
// import { DentalCalendarApp } from "./components/dental-calendar"

// MEDICAL RECORDS
import MedicalRecordsPage from "./pages/medical-records/page"
// import MedicalRecordsPage from "./pages/medical-records/MedicalRecordsPage"
import MedicalRecordDetailsPage from "./pages/medical-records/MedicalRecordDetailsPage"
import AddMedicalRecordPage from "./pages/medical-records/AddMedicalRecordPage"
import EditMedicalRecordPage from "./pages/medical-records/EditMedicalRecordPage"

// LAYOUTS
import DashboardLayout from "./components/layouts/dashboard-layout"

// PAYMENTS
import PaymentsPage from "./pages/payments/page"
// import PaymentsPage from "./pages/payments/PaymentsPage"
import PaymentStatsPage from "./pages/payments/PaymentStatsPage"
import PaymentDetailsPage from "./pages/payments/PaymentDetailsPage"
import CreatePaymentPage from "./pages/payments/CreatePaymentPage"

// PROFILE
import { ProfilePage } from "./pages/profile/page"

// SETTINGS
import { SettingsPage } from "./pages/settings/page"



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
      <Route path="/" element={<AuthGuard> <DashboardLayout /> </AuthGuard>} >

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ============================ ADMIN ONLY ROUTES ===========================  */}

        {/* ============================ RECEPTIONISTS ONLY ROUTES ===========================  */}

        {/* ============================ RECEPTIONISTS & ADMIN ROUTES ===========================  */}

        {/* ============================ DOCTORS ONLY ROUTES ===========================  */}

        {/* ============================ DOCTORS & ADMIN ROUTES ===========================  */}
        {/* Medical Records */}
        <Route path="/medical-records" element={<AuthGuard allowedRoles={["admin", "doctor"]}> <MedicalRecordsPage /> </AuthGuard>} />
        <Route path="/medical-records/:id" element={<AuthGuard allowedRoles={["admin", "doctor"]}> <MedicalRecordDetailsPage /> </AuthGuard>} />
        <Route path="/medical-records/add" element={<AuthGuard allowedRoles={["admin", "doctor"]}> <AddMedicalRecordPage /> </AuthGuard>} />
        <Route path="/medical-records/edit/:id" element={<AuthGuard allowedRoles={["admin", "doctor"]}> <EditMedicalRecordPage /> </AuthGuard>} />


        {/* ============================ DOCTORS & ADMIN & RECEPTIONISTS ROUTES ===========================  */}
        {/* DOCTORS */}
        <Route path="/doctors" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}><DoctorsPage /></AuthGuard>} />
        <Route path="/doctors/:id" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}><DoctorDetailsPage /></AuthGuard>} />
        <Route path="/doctors/add" element={<AuthGuard allowedRoles={["admin"]}> <AddDoctorPage /> </AuthGuard>} />
        <Route path="/doctors/edit/:id" element={<AuthGuard allowedRoles={["admin"]}> <EditDoctorPage /> </AuthGuard>} />


        {/* <Route path="/patients" element={<PatientsPage />} /> */}
        <Route path="/patients" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <PatientsPage /> </AuthGuard>} />
        <Route path="/patients/:id" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <PatientDetailsPage /> </AuthGuard>} />
        <Route path="/patients/add" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <AddPatientPage /> </AuthGuard>} />
        <Route path="/patients/edit/:id" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <EditPatientPage /> </AuthGuard>} />
      
        {/* ============================ PATIENTS ONLY ROUTES ===========================  */}


        {/* ============================ ADMIN & RECEPTIONISTS & DOCTORS & PATIENTS  ROUTES ===========================  */}
        {/* Appointments */}
        <Route path="/appointments" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <AppointmentsPage /> </AuthGuard>} />
        <Route path="/appointments/:id" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <AppointmentDetailsPage /> </AuthGuard>} />
        <Route path="/appointments/add" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <AddAppointmentPage /> </AuthGuard>} />
        <Route path="/appointments/edit/:id" element={<AuthGuard allowedRoles={["admin", "receptionist", "doctor"]}> <EditAppointmentPage /> </AuthGuard>} />


        {/* Payments */}
        {/* <Route path="/payments" element={<PaymentsPage />} /> */}
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payments/:id" element={<PaymentDetailsPage />} />
        <Route path="/payments/create" element={<CreatePaymentPage />} />
        <Route path="/payments/stats" element={<PaymentStatsPage />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>


      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
