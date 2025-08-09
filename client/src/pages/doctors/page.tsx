import { useAuthStore } from "@/store/auth-store"
import AdminDoctorsPage from "../admin/doctors/page"
import DoctorDoctorsPage from "../doctor/page"
import ReceptionistDoctorsPage from "../receptionist/doctors/page"

export default function DoctorsPage() {
  const { user} = useAuthStore()

  const isAdmin = user?.role === "admin"
  const isReceptionist = user?.role === "receptionist"
//   const isPatient = user?.role === "patient"
  const isDoctor = user?.role === "doctor"

  return (
    <>
      {isAdmin && <AdminDoctorsPage />}
      {isReceptionist && <ReceptionistDoctorsPage />}
      {/* {isPatient && <PatientDoctorsPage />} */}
      {isDoctor && <DoctorDoctorsPage />}
    </>
  )
}
