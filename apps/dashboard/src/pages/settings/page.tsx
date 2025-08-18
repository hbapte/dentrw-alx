"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Smartphone,
  Key,
  Database,
  HelpCircle,
  SmileIcon as Tooth,
  Stethoscope,
  Calendar,
  Users,
  BarChart3,
  Monitor,
} from "lucide-react"
import { useProfileStore } from "../../store/profile-store"

// Import setting components
import { AccountSettings } from "../../components/settings/AccountSettings"
import { SecuritySettings } from "../../components/settings/SecuritySettings"
import { NotificationSettings } from "../../components/settings/NotificationSettings"
import { PrivacySettings } from "../../components/settings/PrivacySettings"
import { AppearanceSettings } from "../../components/settings/AppearanceSettings"
import { LanguageSettings } from "../../components/settings/LanguageSettings"
import { DeviceSettings } from "../../components/settings/DeviceSettings"
import { DataSettings } from "../../components/settings/DataSettings"
import { SupportSettings } from "../../components/settings/SupportSettings"
import { DoctorSettings } from "../../components/settings/DoctorSettings"
import { DoctorScheduleSettings } from "../../components/settings/DoctorScheduleSettings"
import { AdminSystemSettings } from "../../components/settings/AdminSystemSettings"
import { AdminUserSettings } from "../../components/settings/AdminUserSettings"
import { AdminReportsSettings } from "../../components/settings/AdminReportsSettings"
import { ReceptionistDeskSettings } from "../../components/settings/ReceptionistDeskSettings"
import { ReceptionistAppointmentSettings } from "../../components/settings/ReceptionistAppointmentSettings"

export const SettingsPage = () => {
  const { user } = useProfileStore()
  const [activeTab, setActiveTab] = useState("account")

  const settingsSections = [
    {
      id: "account",
      label: "Account",
      icon: User,
      description: "Manage your account information",
      component: AccountSettings,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password and security settings",
      component: SecuritySettings,
      badge: "Important",
    },
    // Doctor-specific settings
    ...(user?.role === "doctor"
      ? [
          {
            id: "practice",
            label: "Practice Settings",
            icon: Stethoscope,
            description: "Configure your dental practice",
            component: DoctorSettings,
          },
          {
            id: "schedule",
            label: "Schedule",
            icon: Calendar,
            description: "Manage your working hours",
            component: DoctorScheduleSettings,
          },
        ]
      : []),
    // Admin-specific settings
    ...(user?.role === "admin"
      ? [
          {
            id: "system",
            label: "System Management",
            icon: Settings,
            description: "System configuration and management",
            component: AdminSystemSettings,
          },
          {
            id: "users",
            label: "User Management",
            icon: Users,
            description: "Manage system users and permissions",
            component: AdminUserSettings,
          },
          {
            id: "reports",
            label: "Reports & Analytics",
            icon: BarChart3,
            description: "Generate and view system reports",
            component: AdminReportsSettings,
          },
        ]
      : []),
    // Receptionist-specific settings
    ...(user?.role === "receptionist"
      ? [
          {
            id: "desk",
            label: "Desk Settings",
            icon: Monitor,
            description: "Configure your workstation",
            component: ReceptionistDeskSettings,
          },
          {
            id: "appointments",
            label: "Appointment Management",
            icon: Calendar,
            description: "Appointment booking preferences",
            component: ReceptionistAppointmentSettings,
          },
        ]
      : []),
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Manage your notification preferences",
      component: NotificationSettings,
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Key,
      description: "Control your privacy settings",
      component: PrivacySettings,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Customize the app appearance",
      component: AppearanceSettings,
    },
    {
      id: "language",
      label: "Language",
      icon: Globe,
      description: "Language and region settings",
      component: LanguageSettings,
    },
    {
      id: "devices",
      label: "Devices",
      icon: Smartphone,
      description: "Manage connected devices",
      component: DeviceSettings,
    },
    {
      id: "data",
      label: "Data & Storage",
      icon: Database,
      description: "Manage your data and storage",
      component: DataSettings,
    },
    {
      id: "support",
      label: "Help & Support",
      icon: HelpCircle,
      description: "Get help and support",
      component: SupportSettings,
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">DentRw Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences
              {user?.role && (
                <span className="ml-2 text-primary font-medium">
                  ({user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1 ">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tooth className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>Choose a category to configure</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                        activeTab === section.id ? "bg-muted border-r-2 border-primary" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{section.label}</span>
                          {section.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {section.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {settingsSections.map((section) => {
              const Component = section.component
              return (
                <div key={section.id} className={activeTab === section.id ? "block" : "hidden"}>
                  <Component />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
