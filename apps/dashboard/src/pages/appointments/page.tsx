
import AdminAppointmentsPage from "../admin/appointments/page"
import ReceptionistAppointmentsPage from "../receptionist/appointments/page"
import PatientAppointmentsPage from "../patient/appointments/page"
import DoctorAppointmentsPage from "../doctor/appointments/page"
import { useAuthStore } from "@/store/auth-store"

export default function AppointmentsPage() {
  const { user} = useAuthStore()

  const isAdmin = user?.role === "admin"
  const isReceptionist = user?.role === "receptionist"
  const isPatient = user?.role === "patient"
  const isDoctor = user?.role === "doctor"


  return (
    <>
      {isAdmin && <AdminAppointmentsPage />}
      {isReceptionist && <ReceptionistAppointmentsPage />}
      {isPatient && <PatientAppointmentsPage />}
      {isDoctor && <DoctorAppointmentsPage />}
    </>
  )
}
