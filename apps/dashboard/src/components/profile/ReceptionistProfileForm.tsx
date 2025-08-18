"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useProfileStore } from "../../store/profile-store"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Loader2, Users, Award, Settings, Plus, Trash2, Phone } from "lucide-react"
import { toast } from "sonner"

const receptionistProfileSchema = z.object({
  // Employment Information
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  hireDate: z.string().min(1, "Hire date is required"),

  // Skills and Languages
  languages: z.array(z.string()).min(1, "At least one language is required"),
  computerSkills: z.array(z.string()).optional(),
  medicalSoftwareExperience: z.array(z.string()).optional(),

  // Emergency Contact
  emergencyName: z.string().min(1, "Emergency contact name is required"),
  emergencyRelationship: z.string().min(1, "Relationship is required"),
  emergencyPhone: z.string().min(1, "Emergency contact phone is required"),
  emergencyEmail: z.string().email().optional().or(z.literal("")),
  emergencyAddress: z.string().optional(),

  // Preferences
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  preferredShift: z.enum(["morning", "afternoon", "evening", "night"]).optional(),
  overtimeAvailability: z.boolean().optional(),
  weekendAvailability: z.boolean().optional(),
  holidayAvailability: z.boolean().optional(),
  defaultLanguage: z.string().optional(),
  timeFormat: z.enum(["12h", "24h"]).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
})

type ReceptionistProfileFormValues = z.infer<typeof receptionistProfileSchema>

const LANGUAGES = ["English", "French", "Kinyarwanda", "Swahili", "Other"]
const COMPUTER_SKILLS = [
  "Microsoft Office",
  "Data Entry",
  "Email Management",
  "Internet Research",
  "Database Management",
  "Scheduling Software",
  "Customer Service Software",
  "Basic Troubleshooting",
]
const MEDICAL_SOFTWARE = [
  "DentRw System",
  "Electronic Health Records (EHR)",
  "Practice Management Software",
  "Appointment Scheduling",
  "Billing Software",
  "Insurance Processing",
  "Patient Portal",
  "Telemedicine Platforms",
]

export const ReceptionistProfileForm = () => {
  const { profile, updateReceptionistProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("employment")
  const [qualifications, setQualifications] = useState([
    { certification: "", institution: "", issueDate: "", certificateNumber: "" },
  ])

  const form = useForm<ReceptionistProfileFormValues>({
    resolver: zodResolver(receptionistProfileSchema),
    defaultValues: {
      employeeId: "",
      department: "",
      position: "",
      hireDate: "",
      languages: [],
      computerSkills: [],
      medicalSoftwareExperience: [],
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      emergencyEmail: "",
      emergencyAddress: "",
      emailNotifications: true,
      smsNotifications: true,
      systemAlerts: true,
      appointmentReminders: true,
      preferredShift: "morning",
      overtimeAvailability: false,
      weekendAvailability: false,
      holidayAvailability: false,
      defaultLanguage: "en",
      timeFormat: "12h",
      theme: "light",
    },
  })

  useEffect(() => {
    if (profile) {
      const formData = {
        employeeId: profile.employeeId || "",
        department: profile.department || "",
        position: profile.position || "",
        hireDate: profile.hireDate ? new Date(profile.hireDate).toISOString().split("T")[0] : "",
        languages: profile.languages || [],
        computerSkills: profile.computerSkills || [],
        medicalSoftwareExperience: profile.medicalSoftwareExperience || [],
        emergencyName: profile.emergencyContact?.name || "",
        emergencyRelationship: profile.emergencyContact?.relationship || "",
        emergencyPhone: profile.emergencyContact?.phoneNumber || "",
        emergencyEmail: profile.emergencyContact?.email || "",
        emergencyAddress: profile.emergencyContact?.address || "",
        emailNotifications: profile.preferences?.notificationSettings?.emailNotifications ?? true,
        smsNotifications: profile.preferences?.notificationSettings?.smsNotifications ?? true,
        systemAlerts: profile.preferences?.notificationSettings?.systemAlerts ?? true,
        appointmentReminders: profile.preferences?.notificationSettings?.appointmentReminders ?? true,
        preferredShift: profile.preferences?.workPreferences?.preferredShift || "morning",
        overtimeAvailability: profile.preferences?.workPreferences?.overtimeAvailability ?? false,
        weekendAvailability: profile.preferences?.workPreferences?.weekendAvailability ?? false,
        holidayAvailability: profile.preferences?.workPreferences?.holidayAvailability ?? false,
        defaultLanguage: profile.preferences?.systemPreferences?.defaultLanguage || "en",
        timeFormat: profile.preferences?.systemPreferences?.timeFormat || "12h",
        theme: profile.preferences?.systemPreferences?.theme || "light",
      }

      form.reset(formData)

      if (profile.qualifications) {
        setQualifications(
          profile.qualifications.length > 0
            ? profile.qualifications.map((qual) => ({
                certification: qual.certification,
                institution: qual.institution,
                issueDate: qual.issueDate ? new Date(qual.issueDate).toISOString().split("T")[0] : "",
                certificateNumber: qual.certificateNumber || "",
              }))
            : [{ certification: "", institution: "", issueDate: "", certificateNumber: "" }],
        )
      }
    }
  }, [profile, form])

  useEffect(() => {
    if (success) {
      toast.success("Receptionist profile updated successfully")
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update receptionist profile")
      clearError()
    }
  }, [error, clearError])

  const onSubmit = async (data: ReceptionistProfileFormValues) => {
    const formattedData = {
      employeeId: data.employeeId,
      department: data.department,
      position: data.position,
      hireDate: data.hireDate,
      languages: data.languages,
      computerSkills: data.computerSkills,
      medicalSoftwareExperience: data.medicalSoftwareExperience,
      qualifications: qualifications.filter((q) => q.certification && q.institution),
      emergencyContact: {
        name: data.emergencyName,
        relationship: data.emergencyRelationship,
        phoneNumber: data.emergencyPhone,
        email: data.emergencyEmail,
        address: data.emergencyAddress,
      },
      preferences: {
        notificationSettings: {
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
          systemAlerts: data.systemAlerts,
          appointmentReminders: data.appointmentReminders,
        },
        workPreferences: {
          preferredShift: data.preferredShift,
          overtimeAvailability: data.overtimeAvailability,
          weekendAvailability: data.weekendAvailability,
          holidayAvailability: data.holidayAvailability,
        },
        systemPreferences: {
          defaultLanguage: data.defaultLanguage,
          timeFormat: data.timeFormat,
          theme: data.theme,
        },
      },
    }

    await updateReceptionistProfile(formattedData)
  }

  const addQualification = () => {
    setQualifications([...qualifications, { certification: "", institution: "", issueDate: "", certificateNumber: "" }])
  }

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Receptionist Profile</CardTitle>
              <CardDescription>Manage your employment and work information</CardDescription>
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

        {/* Profile Status */}
        {profile && (
          <div className="flex gap-2 mt-4">
            <Badge variant={profile.isActive ? "default" : "secondary"}>
              {profile.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{profile.employmentStatus || "Active"}</Badge>
            <Badge variant="outline">{profile.accessLevel || "Basic"}</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="employment" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Employment
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Emergency
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Employment Information Tab */}
              <TabsContent value="employment" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Employment Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Work Statistics */}
                  {profile?.statistics && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Work Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Patients Registered</p>
                          <p className="font-medium">{profile.statistics.totalPatientsRegistered || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Appointments Scheduled</p>
                          <p className="font-medium">{profile.statistics.totalAppointmentsScheduled || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Calls Handled</p>
                          <p className="font-medium">{profile.statistics.totalCallsHandled || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Satisfaction Rating</p>
                          <p className="font-medium">{profile.statistics.patientSatisfactionRating || 0}/5</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Skills and Qualifications Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills and Languages
                  </h3>

                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages Spoken *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {LANGUAGES.map((lang) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <Checkbox
                                id={lang}
                                checked={field.value?.includes(lang)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, lang])
                                  } else {
                                    field.onChange(field.value?.filter((l) => l !== lang))
                                  }
                                }}
                                disabled={!isEditing || loading}
                              />
                              <label htmlFor={lang} className="text-sm font-medium">
                                {lang}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="computerSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Computer Skills</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {COMPUTER_SKILLS.map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={skill}
                                checked={field.value?.includes(skill)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, skill])
                                  } else {
                                    field.onChange(field.value?.filter((s) => s !== skill))
                                  }
                                }}
                                disabled={!isEditing || loading}
                              />
                              <label htmlFor={skill} className="text-sm font-medium">
                                {skill}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalSoftwareExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Software Experience</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {MEDICAL_SOFTWARE.map((software) => (
                            <div key={software} className="flex items-center space-x-2">
                              <Checkbox
                                id={software}
                                checked={field.value?.includes(software)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, software])
                                  } else {
                                    field.onChange(field.value?.filter((s) => s !== software))
                                  }
                                }}
                                disabled={!isEditing || loading}
                              />
                              <label htmlFor={software} className="text-sm font-medium">
                                {software}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Qualifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Professional Qualifications</h3>
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
                          <label className="text-sm font-medium">Certification *</label>
                          <Input
                            value={qual.certification}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].certification = e.target.value
                              setQualifications(newQuals)
                            }}
                            placeholder="e.g., Medical Reception Certificate"
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
                            placeholder="Institution name"
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Issue Date</label>
                          <Input
                            type="date"
                            value={qual.issueDate}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].issueDate = e.target.value
                              setQualifications(newQuals)
                            }}
                            disabled={!isEditing || loading}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Certificate Number</label>
                          <Input
                            value={qual.certificateNumber}
                            onChange={(e) => {
                              const newQuals = [...qualifications]
                              newQuals[index].certificateNumber = e.target.value
                              setQualifications(newQuals)
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

              {/* Emergency Contact Tab */}
              <TabsContent value="emergency" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
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
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+250 XXX XXX XXX" disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="emergencyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Work Preferences
                  </h3>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Settings</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
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
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">SMS Notifications</FormLabel>
                              <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
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
                        name="systemAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">System Alerts</FormLabel>
                              <p className="text-sm text-muted-foreground">Receive system and security alerts</p>
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
                        name="appointmentReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Appointment Reminders</FormLabel>
                              <p className="text-sm text-muted-foreground">Get reminders for upcoming appointments</p>
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
                    <h4 className="font-medium">Work Availability</h4>

                    <FormField
                      control={form.control}
                      name="preferredShift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Shift</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred shift" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning (8:00 AM - 4:00 PM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12:00 PM - 8:00 PM)</SelectItem>
                              <SelectItem value="evening">Evening (4:00 PM - 12:00 AM)</SelectItem>
                              <SelectItem value="night">Night (8:00 PM - 6:00 AM)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="overtimeAvailability"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Overtime Availability</FormLabel>
                              <p className="text-sm text-muted-foreground">Available to work overtime when needed</p>
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
                        name="weekendAvailability"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Weekend Availability</FormLabel>
                              <p className="text-sm text-muted-foreground">Available to work on weekends</p>
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
                        name="holidayAvailability"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Holiday Availability</FormLabel>
                              <p className="text-sm text-muted-foreground">Available to work on holidays</p>
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
