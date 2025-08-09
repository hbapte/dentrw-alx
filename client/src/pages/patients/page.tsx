import { useAuthStore } from "@/store/auth-store"
import AdminPatientsPage from "../admin/patient/page"


export default function PatientsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"
  // const isReceptionist = user?.role === "receptionist"
  // const isDoctor = user?.role === "doctor"

  return( 
  <>
  {isAdmin && <AdminPatientsPage  />}
  {/* {isReceptionist && <AdminPatientsPageComponent  />}
  {isDoctor && <AdminPatientsPageComponent  />} */}
  </>

  )
}
