import { useAuthStore } from "@/store/auth-store"
import AdminPaymentsPage from "../admin/payments/page"
import PatientPaymentsPage from "../patient/payments/page"
import ReceptionistPaymentsPage from "../receptionist/payments/page"
import DoctorPaymentsPage from "../doctor/payments/page"

export default function PaymentsPage() {
  const { user} = useAuthStore()

  const isAdmin = user?.role === "admin"
  const isReceptionist = user?.role === "receptionist"
  const isPatient = user?.role === "patient"
  const isDoctor = user?.role === "doctor" 

  return (
    <div>
      {isAdmin && <AdminPaymentsPage />}
      {isReceptionist && <ReceptionistPaymentsPage />}
      {isPatient && <PatientPaymentsPage />}
      {isDoctor && <DoctorPaymentsPage />}
    </div>
  )
}
