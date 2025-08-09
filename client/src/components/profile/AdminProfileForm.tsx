/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useProfileStore } from "../../store/profile-store"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Loader2, Shield, Settings, Award, Users, Database, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const adminProfileSchema = z.object({
  // Administrative Information
  adminLevel: z.enum(["super_admin", "system_admin", "clinic_admin", "department_admin"]),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  hireDate: z.string().min(1, "Hire date is required"),

  // Preferences
  systemAlerts: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  userActivityAlerts: z.boolean().optional(),
  systemHealthAlerts: z.boolean().optional(),
  backupAlerts: z.boolean().optional(),
  maintenanceAlerts: z.boolean().optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  timezone: z.string().optional(),
  availableForEmergency: z.boolean().optional(),
  preferredContactMethod: z.enum(["email", "phone", "sms"]).optional(),
  defaultLanguage: z.string().optional(),
  timeFormat: z.enum(["12h", "24h"]).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  dashboardLayout: z.string().optional(),

  // Security Settings
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(300).max(86400).optional(),

  // Backup Settings
  autoBackupEnabled: z.boolean().optional(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  backupRetention: z.number().min(1).max(365).optional(),
})

type AdminProfileFormValues = z.infer<typeof adminProfileSchema>

export const AdminProfileForm = () => {
  const { profile, updateAdminProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("admin")
  const [qualifications, setQualifications] = useState([
    { degree: "", institution: "", year: new Date().getFullYear(), country: "Rwanda" },
  ])
  const [certifications, setCertifications] = useState([
    { name: "", issuingBody: "", issueDate: "", certificateNumber: "" },
  ])
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", role: "", phoneNumber: "", email: "", priority: 1 },
  ])

  const form = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      adminLevel: "system_admin",
      employeeId: "",
      department: "",
      position: "",
      hireDate: "",
      systemAlerts: true,
      securityAlerts: true,
      userActivityAlerts: true,
      systemHealthAlerts: true,
      backupAlerts: true,
      maintenanceAlerts: true,
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
      timezone: "Africa/Kigali",
      availableForEmergency: true,
      preferredContactMethod: "email",
      defaultLanguage: "en",
      timeFormat: "24h",
      theme: "light",
      dashboardLayout: "grid",
      twoFactorEnabled: false,
      sessionTimeout: 3600,
      autoBackupEnabled: true,
      backupFrequency: "daily",
      backupRetention: 30,
    },
  })

  useEffect(() => {
    if (profile) {
      const formData = {
        adminLevel: profile.adminLevel || "system_admin",
        employeeId: profile.employeeId || "",
        department: profile.department || "",
        position: profile.position || "",
        hireDate: profile.hireDate ? new Date(profile.hireDate).toISOString().split("T")[0] : "",
        systemAlerts: profile.preferences?.notificationSettings?.systemAlerts ?? true,
        securityAlerts: profile.preferences?.notificationSettings?.securityAlerts ?? true,
        userActivityAlerts: profile.preferences?.notificationSettings?.userActivityAlerts ?? true,
        systemHealthAlerts: profile.preferences?.notificationSettings?.systemHealthAlerts ?? true,
        backupAlerts: profile.preferences?.notificationSettings?.backupAlerts ?? true,
        maintenanceAlerts: profile.preferences?.notificationSettings?.maintenanceAlerts ?? true,
        workingHoursStart: profile.preferences?.workPreferences?.workingHours?.start || "08:00",
        workingHoursEnd: profile.preferences?.workPreferences?.workingHours?.end || "17:00",
        timezone: profile.preferences?.workPreferences?.timezone || "Africa/Kigali",
        availableForEmergency: profile.preferences?.workPreferences?.availableForEmergency ?? true,
        preferredContactMethod: profile.preferences?.workPreferences?.preferredContactMethod || "email",
        defaultLanguage: profile.preferences?.systemPreferences?.defaultLanguage || "en",
        timeFormat: profile.preferences?.systemPreferences?.timeFormat || "24h",
        theme: profile.preferences?.systemPreferences?.theme || "light",
        dashboardLayout: profile.preferences?.systemPreferences?.dashboardLayout || "grid",
        twoFactorEnabled: profile.securitySettings?.twoFactorEnabled ?? false,
        sessionTimeout: profile.securitySettings?.sessionTimeout || 3600,
        autoBackupEnabled: profile.backupSettings?.autoBackupEnabled ?? true,
        backupFrequency: profile.backupSettings?.backupFrequency || "daily",
        backupRetention: profile.backupSettings?.backupRetention || 30,
      }

      form.reset(formData)

      if (profile.qualifications) {
        setQualifications(
          profile.qualifications.length > 0
            ? profile.qualifications
            : [{ degree: "", institution: "", year: new Date().getFullYear(), country: "Rwanda" }],
        )
      }

      if (profile.certifications) {
        setCertifications(
          profile.certifications.length > 0
            ? profile.certifications.map((cert: { name: any; issuingBody: any; issueDate: string | number | Date; certificateNumber: any }) => ({
                name: cert.name,
                issuingBody: cert.issuingBody,
                issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split("T")[0] : "",
                certificateNumber: cert.certificateNumber || "",
              }))
            : [{ name: "", issuingBody: "", issueDate: "", certificateNumber: "" }],
        )
      }

      if (profile.emergencyContacts) {
        setEmergencyContacts(
          profile.emergencyContacts.length > 0
            ? profile.emergencyContacts
            : [{ name: "", role: "", phoneNumber: "", email: "", priority: 1 }],
        )
      }
    }
  }, [profile, form])

  useEffect(() => {
    if (success) {
      toast.success("Admin profile updated successfully")
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update admin profile")
      clearError()
    }
  }, [error, clearError])

  const onSubmit = async (data: AdminProfileFormValues) => {
    const formattedData = {
      adminLevel: data.adminLevel,
      employeeId: data.employeeId,
      department: data.department,
      position: data.position,
      hireDate: data.hireDate,
      qualifications: qualifications.filter((q) => q.degree && q.institution),
      certifications: certifications
        .filter((c) => c.name && c.issuingBody)
        .map((cert) => ({
          name: cert.name,
          issuingBody: cert.issuingBody,
          issueDate: cert.issueDate,
          certificateNumber: cert.certificateNumber,
        })),
      emergencyContacts: emergencyContacts.filter((c) => c.name && c.phoneNumber),
      preferences: {
        notificationSettings: {
          systemAlerts: data.systemAlerts,
          securityAlerts: data.securityAlerts,
          userActivityAlerts: data.userActivityAlerts,
          systemHealthAlerts: data.systemHealthAlerts,
          backupAlerts: data.backupAlerts,
          maintenanceAlerts: data.maintenanceAlerts,
        },
        workPreferences: {
          workingHours: {
            start: data.workingHoursStart,
            end: data.workingHoursEnd,
          },
          timezone: data.timezone,
          availableForEmergency: data.availableForEmergency,
          preferredContactMethod: data.preferredContactMethod,
        },
        systemPreferences: {
          defaultLanguage: data.defaultLanguage,
          timeFormat: data.timeFormat,
          theme: data.theme,
          dashboardLayout: data.dashboardLayout,
        },
      },
      securitySettings: {
        twoFactorEnabled: data.twoFactorEnabled,
        sessionTimeout: data.sessionTimeout,
      },
      backupSettings: {
        autoBackupEnabled: data.autoBackupEnabled,
        backupFrequency: data.backupFrequency,
        backupRetention: data.backupRetention,
      },
    }

    await updateAdminProfile(formattedData)
  }

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { degree: "", institution: "", year: new Date().getFullYear(), country: "Rwanda" },
    ])
  }

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index))
  }

  const addCertification = () => {
    setCertifications([...certifications, { name: "", issuingBody: "", issueDate: "", certificateNumber: "" }])
  }

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const addEmergencyContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: "", role: "", phoneNumber: "", email: "", priority: emergencyContacts.length + 1 },
    ])
  }

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Administrator Profile</CardTitle>
              <CardDescription>Manage your administrative information and system settings</CardDescription>
            </div>
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  // Reset form logic here
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Admin Status */}
        {profile && (
          <div className="flex gap-2 mt-4">
            <Badge variant="default">{profile.adminLevel?.replace("_", " ").toUpperCase() || "SYSTEM ADMIN"}</Badge>
            <Badge variant={profile.isActive ? "default" : "secondary"}>
              {profile.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{profile.accessLevel?.toUpperCase() || "ADMIN"}</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin Info
                </TabsTrigger>
                <TabsTrigger value="qualifications" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Qualifications
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Emergency
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Admin Information Tab */}
              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Administrative Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adminLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Level *</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select admin level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                              <SelectItem value="system_admin">System Admin</SelectItem>
                              <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                              <SelectItem value="department_admin">Department Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hire Date *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Admin Statistics */}
                  {profile?.statistics && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Administrative Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Users Managed</p>
                          <p className="font-medium">{profile.statistics.totalUsersManaged || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">System Actions</p>
                          <p className="font-medium">{profile.statistics.totalSystemActions || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reports Generated</p>
                          <p className="font-medium">{profile.statistics.totalReportsGenerated || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Issues Resolved</p>
                          <p className="font-medium">{profile.statistics.issuesResolved || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Qualifications Tab */}
              <TabsContent value="qualifications" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Educational Qualifications</h3>
                    {isEditing && (
                      <Button type="button" variant="outline" size="sm" onClick={addQualification}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Qualification
                      </Button>
                    )}
                  </div>

                  {qualifications.map((qual, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Qualification {index + 1}</h4>
                        {isEditing && qualifications.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeQualification(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Degree *</label>
                          <Input
                            value={qual.degree}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].degree = e.target.value
                              setQualifications(newQuals)
                            }}
                            placeholder="e.g., MBA, BSc Computer Science"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Institution *</label>
                          <Input
                            value={qual.institution}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].institution = e.target.value
                              setQualifications(newQuals)
                            }}
                            placeholder="University/College name"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Year of Graduation *</label>
                          <Input
                            type="number"
                            value={qual.year}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].year = Number(e.target.value)
                              setQualifications(newQuals)
                            }}
                            min="1950"
                            max={new Date().getFullYear()}
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Country</label>
                          <Input
                            value={qual.country}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].country = e.target.value
                              setQualifications(newQuals)
                            }}
                            disabled={!isEditing || loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Professional Certifications</h3>
                    {isEditing && (
                      <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Certification
                      </Button>
                    )}
                  </div>

                  {certifications.map((cert, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Certification {index + 1}</h4>
                        {isEditing && certifications.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeCertification(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Certification Name *</label>
                          <Input
                            value={cert.name}
                            onChange={(e) => {
                              const newCerts = [...certifications]
                              newCerts[index].name = e.target.value
                              setCertifications(newCerts)
                            }}
                            placeholder="e.g., PMP, CISSP, ITIL"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Issuing Body *</label>
                          <Input
                            value={cert.issuingBody}
                            onChange={(e) => {
                              const newCerts = [...certifications]
                              newCerts[index].issuingBody = e.target.value
                              setCertifications(newCerts)
                            }}
                            placeholder="Organization/Institution"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Issue Date</label>
                          <Input
                            type="date"
                            value={cert.issueDate}
                            onChange={(e) => {
                              const newCerts = [...certifications]
                              newCerts[index].issueDate = e.target.value
                              setCertifications(newCerts)
                            }}
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Certificate Number</label>
                          <Input
                            value={cert.certificateNumber}
                            onChange={(e) => {
                              const newCerts = [...certifications]
                              newCerts[index].certificateNumber = e.target.value
                              setCertifications(newCerts)
                            }}
                            placeholder="Certificate ID/Number"
                            disabled={!isEditing || loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Security & System Settings
                  </h3>

                  <div className="space-y-4">
                    <h4 className="font-medium">Security Settings</h4>

                    <FormField
                      control={form.control}
                      name="twoFactorEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                            <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="300"
                              max="86400"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Automatically log out after this period of inactivity (300-86400 seconds)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Backup Settings</h4>

                    <FormField
                      control={form.control}
                      name="autoBackupEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Automatic Backups</FormLabel>
                            <p className="text-sm text-muted-foreground">Enable automatic system backups</p>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="backupFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backup Frequency</FormLabel>
                            <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="backupRetention"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backup Retention (days)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                max="365"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Emergency Contacts Tab */}
              <TabsContent value="emergency" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Emergency Contacts
                    </h3>
                    {isEditing && (
                      <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    )}
                  </div>

                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Emergency Contact {index + 1}</h4>
                        {isEditing && emergencyContacts.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeEmergencyContact(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Name *</label>
                          <Input
                            value={contact.name}
                            onChange={(e) => {
                              const newContacts = [...emergencyContacts]
                              newContacts[index].name = e.target.value
                              setEmergencyContacts(newContacts)
                            }}
                            placeholder="Contact name"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Role *</label>
                          <Input
                            value={contact.role}
                            onChange={(e) => {
                              const newContacts = [...emergencyContacts]
                              newContacts[index].role = e.target.value
                              setEmergencyContacts(newContacts)
                            }}
                            placeholder="e.g., IT Manager, Security Officer"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Phone Number *</label>
                          <Input
                            value={contact.phoneNumber}
                            onChange={(e) => {
                              const newContacts = [...emergencyContacts]
                              newContacts[index].phoneNumber = e.target.value
                              setEmergencyContacts(newContacts)
                            }}
                            placeholder="+250 XXX XXX XXX"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Email *</label>
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => {
                              const newContacts = [...emergencyContacts]
                              newContacts[index].email = e.target.value
                              setEmergencyContacts(newContacts)
                            }}
                            placeholder="email@example.com"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Input
                            type="number"
                            value={contact.priority}
                            onChange={(e) => {
                              const newContacts = [...emergencyContacts]
                              newContacts[index].priority = Number(e.target.value)
                              setEmergencyContacts(newContacts)
                            }}
                            min="1"
                            max="10"
                            disabled={!isEditing || loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Preferences
                  </h3>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Settings</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="systemAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">System Alerts</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receive system status and performance alerts
                              </p>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="securityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Security Alerts</FormLabel>
                              <p className="text-sm text-muted-foreground">Receive security-related notifications</p>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="userActivityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">User Activity Alerts</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Get notified about user activities and changes
                              </p>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="backupAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Backup Alerts</FormLabel>
                              <p className="text-sm text-muted-foreground">Receive backup status notifications</p>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Work Preferences</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="workingHoursStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Working Hours Start</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" disabled={!isEditing || loading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workingHoursEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Working Hours End</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" disabled={!isEditing || loading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing || loading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method</FormLabel>
                            <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="availableForEmergency"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Available for Emergency</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Available to handle emergency situations outside working hours
                            </p>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">System Preferences</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="defaultLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Language</FormLabel>
                            <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="rw">Kinyarwanda</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Format</FormLabel>
                            <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="12h">12 Hour</SelectItem>
                                <SelectItem value="24h">24 Hour</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="dashboardLayout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dashboard Layout</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select layout" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="grid">Grid Layout</SelectItem>
                              <SelectItem value="list">List Layout</SelectItem>
                              <SelectItem value="compact">Compact Layout</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    // Reset form logic
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
