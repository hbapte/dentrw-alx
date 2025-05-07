"use client"

import { useEffect } from "react"
import { useProfileStore } from "../../store/profile-store"
// import { useAuthStore } from "../../store/auth-store"
import { ProfileHeader } from "../../components/profile/ProfileHeader"
import { BasicInfoForm } from "../../components/profile/BasicInfoForm"
import { PasswordForm } from "../../components/profile/PasswordForm"
import { PatientProfileForm } from "../../components/profile/PatientProfileForm"
import { DoctorProfileForm } from "../../components/profile/DoctorProfileForm"
import { Loader2 } from "lucide-react"

export const ProfilePage = () => {
  const { getUserProfile, user, profile, loading } = useProfileStore()
//   const { user: authUser } = useAuthStore()

  useEffect(() => {
    getUserProfile()
  }, [getUserProfile])

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {user && <ProfileHeader user={user} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          {user && <BasicInfoForm />}

          {/* Render role-specific profile forms */}
          {user?.role === "patient" && profile && <PatientProfileForm />}
          {user?.role === "doctor" && profile && <DoctorProfileForm />}
        </div>

        <div>{user && <PasswordForm />}</div>
      </div>
    </div>
  )
}
