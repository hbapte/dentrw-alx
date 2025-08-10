"use client"
import { useEffect } from "react"
import { useProfileStore } from "../../store/profile-store"
import { ProfileHeader } from "../../components/profile/ProfileHeader"
import { BasicInfoForm } from "../../components/profile/BasicInfoForm"
import { PatientProfileForm } from "../../components/profile/PatientProfileForm"
import { DoctorProfileForm } from "../../components/profile/DoctorProfileForm"
import { AdminProfileForm } from "../../components/profile/AdminProfileForm"
import { ReceptionistProfileForm } from "../../components/profile/ReceptionistProfileForm"
import { Loader2, Phone, Shield, Stethoscope, UserIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export const ProfilePage = () => {
  const { getUserProfile, user, profile, loading, error } = useProfileStore()

  useEffect(() => {
    getUserProfile()
  }, [getUserProfile])

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  
  if (error) {
    return (
      <div className="container mx-auto  max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto  max-w-4xl">
        <Alert>
          <AlertDescription>No user data found. Please log in again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return <Stethoscope className="h-5 w-5" />
      case "admin":
        return <Shield className="h-5 w-5" />
      case "receptionist":
        return <Phone className="h-5 w-5" />
      default:
        return <UserIcon className="h-5 w-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-blue-100 text-blue-800"
      case "admin":
        return "bg-red-100 text-red-800"
      case "receptionist":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto max-w-6xl">
        {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">{getRoleIcon(user.role)}</div>
          <div>
            <h1 className="text-3xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Badge className={getRoleColor(user.role)}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
          <Badge variant="outline">{user.isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>

      {/* Profile Header */}
      {user && <ProfileHeader user={user} />}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Main Profile Forms */}
        <div className="lg:col-span-2 space-y-6">
          {user && <BasicInfoForm />}

          {/* Role-specific profile forms */}
          {user?.role === "patient" && <PatientProfileForm />}
          {user?.role === "doctor" && profile && <DoctorProfileForm />}
          {user?.role === "admin" && <AdminProfileForm />}
          {user?.role === "receptionist" && <ReceptionistProfileForm />}
        </div>

        {/* Right Column - Security & Quick Info */}
        <div className="space-y-6 ">

        

          {/* Profile Completion for Patients */}
          {user?.role === "patient" && profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
                <CardDescription>Complete your profile for better care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Calculate completion percentage */}
                  {(() => {
                    const fields = [
                      profile.dateOfBirth,
                      profile.gender,
                      profile.address?.street,
                      profile.emergencyContact?.name,
                      profile.dentalHistory?.lastDentalVisit,
                      profile.medicalHistory?.allergies?.length > 0,
                      profile.insuranceInfo?.hasInsurance !== undefined,
                    ]
                    const completed = fields.filter(Boolean).length
                    const percentage = Math.round((completed / fields.length) * 100)

                    return (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Completion</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {percentage < 100
                            ? "Complete your profile to help us provide better dental care."
                            : "Your profile is complete! Thank you."}
                        </p>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Completion for Admin */}
          {user?.role === "admin" && profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Profile Status</CardTitle>
                <CardDescription>Your administrative profile overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const fields = [
                      profile.department,
                      profile.position,
                      profile.employeeId,
                      profile.workContact?.officePhone,
                      profile.responsibilities && Object.values(profile.responsibilities).some(Boolean),
                      profile.systemAccess?.accessLevel,
                    ]
                    const completed = fields.filter(Boolean).length
                    const percentage = Math.round((completed / fields.length) * 100)

                    return (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Profile Setup</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {percentage < 100
                            ? "Complete your admin profile for full system access."
                            : "Your admin profile is complete!"}
                        </p>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Completion for Receptionist */}
          {user?.role === "receptionist" && profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receptionist Profile Status</CardTitle>
                <CardDescription>Your work profile overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const fields = [
                      profile.department,
                      profile.position,
                      profile.employeeId,
                      profile.shift,
                      profile.workContact?.deskPhone,
                      profile.responsibilities && Object.values(profile.responsibilities).some(Boolean),
                      profile.skills?.computerSkills?.length > 0,
                    ]
                    const completed = fields.filter(Boolean).length
                    const percentage = Math.round((completed / fields.length) * 100)

                    return (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Profile Setup</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {percentage < 100
                            ? "Complete your profile to optimize your work experience."
                            : "Your receptionist profile is complete!"}
                        </p>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}


            {/* Quick Profile Summary */}
          {user && (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Profile Summary</CardTitle>
                <CardDescription>Your account overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <span className="text-sm font-medium capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email Status</span>
                  <span className={`text-sm font-medium ${user.emailVerified ? "text-green-600" : "text-orange-600"}`}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Phone Status</span>
                  <span className={`text-sm font-medium ${user.phoneVerified ? "text-green-600" : "text-orange-600"}`}>
                    {user.phoneVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <span className="text-sm font-medium">
                    {user.preferredLanguage === "en"
                      ? "English"
                      : user.preferredLanguage === "fr"
                        ? "French"
                        : user.preferredLanguage === "rw"
                          ? "Kinyarwanda"
                          : "Not set"}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="text-sm font-medium">{new Date(user.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
