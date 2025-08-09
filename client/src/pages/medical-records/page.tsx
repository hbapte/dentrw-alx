import { useAuthStore } from "@/store/auth-store"
import AdminMedicalRecordsPage from "../admin/medical-records/page"
import ReceptionistMedicalRecordsPage from "../receptionist/medical-records/page"
import PatientMedicalRecordsPage from "../patient/medical-records/page"
import DoctorsMedicalRecordsPage from "../doctor/medical-records/page"

export default function MedicalRecordsPage() {
  const { user} = useAuthStore()

  const isAdmin = user?.role === "admin"
  const isReceptionist = user?.role === "receptionist"
  const isPatient = user?.role === "patient"
  const isDoctor = user?.role === "doctor" 

  return (
    <>
      {isAdmin && <AdminMedicalRecordsPage />}
      {isReceptionist && <ReceptionistMedicalRecordsPage />}
      {isPatient && <PatientMedicalRecordsPage />}
      {isDoctor && <DoctorsMedicalRecordsPage />}
    </>
  )
}