/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Loader2, GraduationCap, Award, DollarSign, Stethoscope, Calendar, Settings, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const doctorProfileSchema = z.object({
  // Professional Information
  specialization: z.array(z.string()).min(1, "At least one specialization is required"),
  subSpecializations: z.array(z.string()).optional(),
  experience: z.number().min(0, "Experience cannot be negative"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiryDate: z.string().optional(),
  registrationNumber: z.string().min(1, "Registration number is required"),

  // Personal Details
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  languages: z.array(z.string()).min(1, "At least one language is required"),

  // Consultation Fees
  initialFee: z.number().min(0, "Fee cannot be negative"),
  followUpFee: z.number().min(0, "Fee cannot be negative"),
  emergencyFee: z.number().min(0, "Fee cannot be negative"),

  // Dental Specialties
  dentalSpecialties: z.array(z.string()).min(1, "At least one dental specialty is required"),
  procedures: z.array(z.string()).optional(),

  // Preferences
  appointmentReminders: z.boolean().optional(),
  patientCommunication: z.enum(["email", "sms", "both"]).optional(),
  workloadAlerts: z.boolean().optional(),
  emergencyAvailability: z.boolean().optional(),
  telemedicineEnabled: z.boolean().optional(),
  autoConfirmAppointments: z.boolean().optional(),

  // Scheduling
  bookingAdvanceLimit: z.number().min(1, "Must be at least 1 day").max(365, "Cannot exceed 365 days"),
  cancellationPolicy: z.string().optional(),
})

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>

const SPECIALIZATIONS = [
  "General Dentistry",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Oral Surgery",
  "Prosthodontics",
  "Pediatric Dentistry",
  "Oral Pathology",
  "Oral Radiology",
  "Cosmetic Dentistry",
  "Implantology",
  "Oral Medicine",
]

const DENTAL_SPECIALTIES = [
  "Teeth Cleaning",
  "Fillings",
  "Root Canal",
  "Crowns & Bridges",
  "Dental Implants",
  "Teeth Whitening",
  "Orthodontic Braces",
  "Invisalign",
  "Oral Surgery",
  "Gum Treatment",
  "Pediatric Care",
  "Emergency Care",
  "Cosmetic Dentistry",
  "Dentures",
  "TMJ Treatment",
]

const LANGUAGES = ["English", "French", "Kinyarwanda", "Swahili", "Other"]

export const DoctorProfileForm = () => {
  const { profile, updateDoctorProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("professional")
  const [qualifications, setQualifications] = useState([
    { degree: "", institution: "", year: new Date().getFullYear(), country: "Rwanda" },
  ])
  const [certifications, setCertifications] = useState([
    { name: "", issuingBody: "", issueDate: "", certificateNumber: "" },
  ])

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      specialization: [],
      subSpecializations: [],
      experience: 0,
      licenseNumber: "",
      licenseExpiryDate: "",
      registrationNumber: "",
      bio: "",
      languages: [],
      initialFee: 0,
      followUpFee: 0,
      emergencyFee: 0,
      dentalSpecialties: [],
      procedures: [],
      appointmentReminders: true,
      patientCommunication: "both",
      workloadAlerts: true,
      emergencyAvailability: false,
      telemedicineEnabled: false,
      autoConfirmAppointments: false,
      bookingAdvanceLimit: 30,
      cancellationPolicy: "",
    },
  })

  useEffect(() => {
    if (profile) {
      const formData = {
        specialization: profile.specialization || [],
        subSpecializations: profile.subSpecializations || [],
        experience: profile.experience || 0,
        licenseNumber: profile.licenseNumber || "",
        licenseExpiryDate: profile.licenseExpiryDate
          ? new Date(profile.licenseExpiryDate).toISOString().split("T")[0]
          : "",
        registrationNumber: profile.registrationNumber || "",
        bio: profile.bio || "",
        languages: profile.languages || [],
        initialFee: profile.consultationFee?.initial || 0,
        followUpFee: profile.consultationFee?.followUp || 0,
        emergencyFee: profile.consultationFee?.emergency || 0,
        dentalSpecialties: profile.dentalSpecialties || [],
        procedures: profile.procedures || [],
        appointmentReminders: profile.preferences?.appointmentReminders ?? true,
        patientCommunication: profile.preferences?.patientCommunication || "both",
        workloadAlerts: profile.preferences?.workloadAlerts ?? true,
        emergencyAvailability: profile.preferences?.emergencyAvailability ?? false,
        telemedicineEnabled: profile.preferences?.telemedicineEnabled ?? false,
        autoConfirmAppointments: profile.preferences?.autoConfirmAppointments ?? false,
        bookingAdvanceLimit: profile.bookingAdvanceLimit || 30,
        cancellationPolicy: profile.cancellationPolicy || "",
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
    }
  }, [profile, form])

  useEffect(() => {
    if (success) {
      toast.success("Doctor profile updated successfully")
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update doctor profile")
      clearError()
    }
  }, [error, clearError])

  const onSubmit = async (data: DoctorProfileFormValues) => {
    const formattedData = {
      specialization: data.specialization,
      subSpecializations: data.subSpecializations,
      experience: data.experience,
      licenseNumber: data.licenseNumber,
      licenseExpiryDate: data.licenseExpiryDate,
      registrationNumber: data.registrationNumber,
      bio: data.bio,
      languages: data.languages,
      consultationFee: {
        initial: data.initialFee,
        followUp: data.followUpFee,
        emergency: data.emergencyFee,
        currency: "RWF",
      },
      dentalSpecialties: data.dentalSpecialties,
      procedures: data.procedures,
      qualifications: qualifications.filter((q) => q.degree && q.institution),
      certifications: certifications
        .filter((c) => c.name && c.issuingBody)
        .map((cert) => ({
          name: cert.name,
          issuingBody: cert.issuingBody,
          issueDate: cert.issueDate,
          certificateNumber: cert.certificateNumber,
        })),
      preferences: {
        appointmentReminders: data.appointmentReminders,
        patientCommunication: data.patientCommunication,
        workloadAlerts: data.workloadAlerts,
        emergencyAvailability: data.emergencyAvailability,
        telemedicineEnabled: data.telemedicineEnabled,
        autoConfirmAppointments: data.autoConfirmAppointments,
      },
      bookingAdvanceLimit: data.bookingAdvanceLimit,
      cancellationPolicy: data.cancellationPolicy,
    }

    await updateDoctorProfile(formattedData)
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Doctor Profile</CardTitle>
              <CardDescription>Manage your professional dental practice information</CardDescription>
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

        {/* Profile Completeness */}
        {profile && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm font-medium">{profile.profileCompleteness || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${profile.profileCompleteness || 0}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="professional" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Professional
                </TabsTrigger>
                <TabsTrigger value="qualifications" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Qualifications
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="scheduling" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Scheduling
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Professional Information Tab */}
              <TabsContent value="professional" className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Specializations *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {SPECIALIZATIONS.map((spec) => (
                            <div key={spec} className="flex items-center space-x-2">
                              <Checkbox
                                id={spec}
                                checked={field.value?.includes(spec)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, spec])
                                  } else {
                                    field.onChange(field.value?.filter((s) => s !== spec))
                                  }
                                }}
                                disabled={!isEditing || loading}
                              />
                              <label
                                htmlFor={spec}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {spec}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="languages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Languages Spoken *</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical License Number *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rwanda Medical Council Registration *</FormLabel>
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
                    name="licenseExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell patients about your experience, approach to dental care, and what makes your practice special..."
                            className="min-h-[120px]"
                            disabled={!isEditing || loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            placeholder="e.g., DDS, BDS, DMD"
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
                            placeholder="e.g., Implantology Certificate"
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

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Dental Services Offered
                  </h3>

                  <FormField
                    control={form.control}
                    name="dentalSpecialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services You Provide *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {DENTAL_SPECIALTIES.map((specialty) => (
                            <div key={specialty} className="flex items-center space-x-2">
                              <Checkbox
                                id={specialty}
                                checked={field.value?.includes(specialty)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, specialty])
                                  } else {
                                    field.onChange(field.value?.filter((s) => s !== specialty))
                                  }
                                }}
                                disabled={!isEditing || loading}
                              />
                              <label htmlFor={specialty} className="text-sm font-medium">
                                {specialty}
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Consultation Fees (RWF)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="initialFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Consultation *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="followUpFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Visit *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              disabled={!isEditing || loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Visit *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
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
              </TabsContent>

              {/* Scheduling Tab */}
              <TabsContent value="scheduling" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Settings
                  </h3>

                  <FormField
                    control={form.control}
                    name="bookingAdvanceLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Advance Limit (Days) *</FormLabel>
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
                        <p className="text-sm text-muted-foreground">
                          How many days in advance can patients book appointments?
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Policy</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your cancellation and rescheduling policy..."
                            disabled={!isEditing || loading}
                          />
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
                    Practice Preferences
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="appointmentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Appointment Reminders</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Send automatic reminders to patients before appointments
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
                      name="patientCommunication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Patient Communication</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select communication method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email Only</SelectItem>
                              <SelectItem value="sms">SMS Only</SelectItem>
                              <SelectItem value="both">Both Email & SMS</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workloadAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Workload Alerts</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Get notified when your schedule is getting full
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
                      name="emergencyAvailability"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Emergency Availability</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Available for emergency dental cases outside regular hours
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
                      name="telemedicineEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Telemedicine Consultations</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Offer virtual consultations for initial assessments
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
                      name="autoConfirmAppointments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-confirm Appointments</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Automatically confirm appointments without manual review
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
