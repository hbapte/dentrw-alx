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
import { Slider } from "../ui/slider"
import { Loader2, Heart, SmileIcon as Tooth, Shield, Settings } from "lucide-react"
import { toast } from "sonner"

// Rwanda administrative divisions
const RWANDA_PROVINCES = ["Kigali", "Northern", "Southern", "Eastern", "Western"]
const RWANDA_DISTRICTS = {
  Kigali: ["Gasabo", "Kicukiro", "Nyarugenge"],
  Northern: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  Southern: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
  Eastern: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  Western: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
}

const patientProfileSchema = z.object({
  // Personal Info
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  nationalId: z.string().optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  occupation: z.string().optional(),

  // Address
  street: z.string().optional(),
  sector: z.string().optional(),
  cell: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  // Emergency Contact
  emergencyName: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyEmail: z.string().email().optional().or(z.literal("")),
  emergencyAddress: z.string().optional(),

  // Dental History
  previousDentist: z.string().optional(),
  lastDentalVisit: z.string().optional(),
  reasonForLastVisit: z.string().optional(),
  currentComplaints: z.string().optional(),
  painLevel: z.number().min(0).max(10).optional(),
  sensitivityToHotCold: z.boolean().optional(),
  bleedingGums: z.boolean().optional(),
  badBreath: z.boolean().optional(),
  teethGrinding: z.boolean().optional(),
  jawPain: z.boolean().optional(),

  // Medical History
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  surgicalHistory: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  smokingStatus: z.enum(["never", "former", "current"]).optional(),
  alcoholConsumption: z.enum(["never", "occasional", "regular", "heavy"]).optional(),
  pregnancyStatus: z.enum(["not_applicable", "not_pregnant", "pregnant", "breastfeeding"]).optional(),
  medicalNotes: z.string().optional(),

  // Insurance
  hasInsurance: z.boolean().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceGroupNumber: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  coverageType: z.enum(["basic", "comprehensive", "premium"]).optional(),
  coverageDetails: z.string().optional(),
  copayAmount: z.number().optional(),

  // Preferences
  preferredAppointmentTime: z.enum(["morning", "afternoon", "evening"]).optional(),
  communicationPreference: z.enum(["phone", "email", "sms"]).optional(),
  reminderPreference: z.boolean().optional(),
  treatmentPreferences: z.string().optional(),
  anxietyLevel: z.enum(["low", "moderate", "high"]).optional(),
  specialNeeds: z.string().optional(),
})

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>

export const PatientProfileForm = () => {
  const { profile, updatePatientProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [selectedProvince, setSelectedProvince] = useState<string>("")

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      dateOfBirth: "",
      gender: "male",
      nationalId: "",
      maritalStatus: "single",
      occupation: "",
      street: "",
      sector: "",
      cell: "",
      village: "",
      district: "",
      province: "",
      country: "Rwanda",
      postalCode: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      emergencyEmail: "",
      emergencyAddress: "",
      previousDentist: "",
      lastDentalVisit: "",
      reasonForLastVisit: "",
      currentComplaints: "",
      painLevel: 0,
      sensitivityToHotCold: false,
      bleedingGums: false,
      badBreath: false,
      teethGrinding: false,
      jawPain: false,
      allergies: "",
      chronicConditions: "",
      currentMedications: "",
      surgicalHistory: "",
      familyMedicalHistory: "",
      smokingStatus: "never",
      alcoholConsumption: "never",
      pregnancyStatus: "not_applicable",
      medicalNotes: "",
      hasInsurance: false,
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceGroupNumber: "",
      insuranceExpiryDate: "",
      coverageType: "basic",
      coverageDetails: "",
      copayAmount: 0,
      preferredAppointmentTime: "morning",
      communicationPreference: "phone",
      reminderPreference: true,
      treatmentPreferences: "",
      anxietyLevel: "low",
      specialNeeds: "",
    },
  })

  useEffect(() => {
    if (profile) {
      const formData = {
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
        gender: profile.gender || "male",
        nationalId: profile.nationalId || "",
        maritalStatus: profile.maritalStatus || "single",
        occupation: profile.occupation || "",
        street: profile.address?.street || "",
        sector: profile.address?.sector || "",
        cell: profile.address?.cell || "",
        village: profile.address?.village || "",
        district: profile.address?.district || "",
        province: profile.address?.province || "",
        country: profile.address?.country || "Rwanda",
        postalCode: profile.address?.postalCode || "",
        emergencyName: profile.emergencyContact?.name || "",
        emergencyRelationship: profile.emergencyContact?.relationship || "",
        emergencyPhone: profile.emergencyContact?.phoneNumber || "",
        emergencyEmail: profile.emergencyContact?.email || "",
        emergencyAddress: profile.emergencyContact?.address || "",
        previousDentist: profile.dentalHistory?.previousDentist || "",
        lastDentalVisit: profile.dentalHistory?.lastDentalVisit
          ? new Date(profile.dentalHistory.lastDentalVisit).toISOString().split("T")[0]
          : "",
        reasonForLastVisit: profile.dentalHistory?.reasonForLastVisit || "",
        currentComplaints: profile.dentalHistory?.currentComplaints?.join(", ") || "",
        painLevel: profile.dentalHistory?.painLevel || 0,
        sensitivityToHotCold: profile.dentalHistory?.sensitivityToHotCold || false,
        bleedingGums: profile.dentalHistory?.bleedingGums || false,
        badBreath: profile.dentalHistory?.badBreath || false,
        teethGrinding: profile.dentalHistory?.teethGrinding || false,
        jawPain: profile.dentalHistory?.jawPain || false,
        allergies: profile.medicalHistory?.allergies?.join(", ") || "",
        chronicConditions: profile.medicalHistory?.chronicConditions?.join(", ") || "",
        currentMedications: profile.medicalHistory?.currentMedications?.join(", ") || "",
        surgicalHistory: profile.medicalHistory?.surgicalHistory?.join(", ") || "",
        familyMedicalHistory: profile.medicalHistory?.familyMedicalHistory || "",
        smokingStatus: profile.medicalHistory?.smokingStatus || "never",
        alcoholConsumption: profile.medicalHistory?.alcoholConsumption || "never",
        pregnancyStatus: profile.medicalHistory?.pregnancyStatus || "not_applicable",
        medicalNotes: profile.medicalHistory?.notes || "",
        hasInsurance: profile.insuranceInfo?.hasInsurance || false,
        insuranceProvider: profile.insuranceInfo?.provider || "",
        insurancePolicyNumber: profile.insuranceInfo?.policyNumber || "",
        insuranceGroupNumber: profile.insuranceInfo?.groupNumber || "",
        insuranceExpiryDate: profile.insuranceInfo?.expiryDate
          ? new Date(profile.insuranceInfo.expiryDate).toISOString().split("T")[0]
          : "",
        coverageType: profile.insuranceInfo?.coverageType || "basic",
        coverageDetails: profile.insuranceInfo?.coverageDetails || "",
        copayAmount: profile.insuranceInfo?.copayAmount || 0,
        preferredAppointmentTime: profile.preferences?.preferredAppointmentTime || "morning",
        communicationPreference: profile.preferences?.communicationPreference || "phone",
        reminderPreference: profile.preferences?.reminderPreference ?? true,
        treatmentPreferences: profile.preferences?.treatmentPreferences?.join(", ") || "",
        anxietyLevel: profile.preferences?.anxietyLevel || "low",
        specialNeeds: profile.preferences?.specialNeeds || "",
      }

      form.reset(formData)
      setSelectedProvince(profile.address?.province || "")
    }
  }, [profile, form])

  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully")
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update profile")
      clearError()
    }
  }, [error, clearError])

  const onSubmit = async (data: PatientProfileFormValues) => {
    const formattedData = {
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      nationalId: data.nationalId,
      maritalStatus: data.maritalStatus,
      occupation: data.occupation,
      address: {
        street: data.street,
        sector: data.sector,
        cell: data.cell,
        village: data.village,
        district: data.district,
        province: data.province,
        country: data.country,
        postalCode: data.postalCode,
      },
      emergencyContact: {
        name: data.emergencyName,
        relationship: data.emergencyRelationship,
        phoneNumber: data.emergencyPhone,
        email: data.emergencyEmail,
        address: data.emergencyAddress,
      },
      dentalHistory: {
        previousDentist: data.previousDentist,
        lastDentalVisit: data.lastDentalVisit,
        reasonForLastVisit: data.reasonForLastVisit,
        currentComplaints: data.currentComplaints ? data.currentComplaints.split(",").map((item) => item.trim()) : [],
        painLevel: data.painLevel,
        sensitivityToHotCold: data.sensitivityToHotCold,
        bleedingGums: data.bleedingGums,
        badBreath: data.badBreath,
        teethGrinding: data.teethGrinding,
        jawPain: data.jawPain,
      },
      medicalHistory: {
        allergies: data.allergies ? data.allergies.split(",").map((item) => item.trim()) : [],
        chronicConditions: data.chronicConditions ? data.chronicConditions.split(",").map((item) => item.trim()) : [],
        currentMedications: data.currentMedications
          ? data.currentMedications.split(",").map((item) => item.trim())
          : [],
        surgicalHistory: data.surgicalHistory ? data.surgicalHistory.split(",").map((item) => item.trim()) : [],
        familyMedicalHistory: data.familyMedicalHistory,
        smokingStatus: data.smokingStatus,
        alcoholConsumption: data.alcoholConsumption,
        pregnancyStatus: data.pregnancyStatus,
        notes: data.medicalNotes,
      },
      insuranceInfo: {
        hasInsurance: data.hasInsurance,
        provider: data.insuranceProvider,
        policyNumber: data.insurancePolicyNumber,
        groupNumber: data.insuranceGroupNumber,
        expiryDate: data.insuranceExpiryDate,
        coverageType: data.coverageType,
        coverageDetails: data.coverageDetails,
        copayAmount: data.copayAmount,
      },
      preferences: {
        preferredAppointmentTime: data.preferredAppointmentTime,
        communicationPreference: data.communicationPreference,
        reminderPreference: data.reminderPreference,
        treatmentPreferences: data.treatmentPreferences
          ? data.treatmentPreferences.split(",").map((item) => item.trim())
          : [],
        anxietyLevel: data.anxietyLevel,
        specialNeeds: data.specialNeeds,
      },
    }

    await updatePatientProfile(formattedData)
  }

  const resetForm = () => {
    if (profile) {
      // Reset logic similar to useEffect
      const formData = {
        // ... same as in useEffect
      }
      form.reset(formData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tooth className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>DentRw Patient Profile</CardTitle>
              <CardDescription>Complete your dental health information</CardDescription>
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
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="personal" className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-1">
                  Address
                </TabsTrigger>
                <TabsTrigger value="dental" className="flex items-center gap-1">
                  <Tooth className="h-4 w-4" />
                  Dental
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center gap-1">
                  Medical
                </TabsTrigger>
                <TabsTrigger value="insurance" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Insurance
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1234567890123456" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing || loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Contact */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
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
                          <FormLabel>Relationship</FormLabel>
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
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
                </div>
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" className="space-y-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing || loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <Select
                          disabled={!isEditing || loading}
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedProvince(value)
                            form.setValue("district", "") // Reset district when province changes
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RWANDA_PROVINCES.map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select
                          disabled={!isEditing || loading || !selectedProvince}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedProvince &&
                              RWANDA_DISTRICTS[selectedProvince as keyof typeof RWANDA_DISTRICTS]?.map((district) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cell"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cell</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Dental History Tab */}
              <TabsContent value="dental" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Tooth className="h-5 w-5" />
                    Dental History
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="previousDentist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Dentist</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastDentalVisit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Dental Visit</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" disabled={!isEditing || loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reasonForLastVisit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Last Visit</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentComplaints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Dental Complaints (comma separated)</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Pain Level (0-10)</FormLabel>
                        <FormControl>
                          <div className="px-3">
                            <Slider
                              disabled={!isEditing || loading}
                              max={10}
                              min={0}
                              step={1}
                              value={[field.value || 0]}
                              onValueChange={(value: any[]) => field.onChange(value[0])}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>No Pain</span>
                              <span className="font-medium">{field.value || 0}</span>
                              <span>Severe Pain</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dental Symptoms Checkboxes */}
                  <div className="space-y-3">
                    <FormLabel>Current Dental Symptoms</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="sensitivityToHotCold"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Sensitivity to Hot/Cold</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bleedingGums"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Bleeding Gums</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="badBreath"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Bad Breath</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="teethGrinding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Teeth Grinding</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="jawPain"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditing || loading}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Jaw Pain</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferredAppointmentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Appointment Time</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="anxietyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dental Anxiety Level</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Needs or Accommodations</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Medical History Tab */}
              <TabsContent value="medical" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Medical History</h3>

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chronicConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chronic Conditions (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Medications (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surgicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surgical History (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smokingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Smoking Status</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="never">Never</SelectItem>
                              <SelectItem value="former">Former</SelectItem>
                              <SelectItem value="current">Current</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alcoholConsumption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alcohol Consumption</FormLabel>
                          <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="never">Never</SelectItem>
                              <SelectItem value="occasional">Occasional</SelectItem>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="heavy">Heavy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pregnancyStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pregnancy Status</FormLabel>
                        <Select disabled={!isEditing || loading} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_applicable">Not Applicable</SelectItem>
                            <SelectItem value="not_pregnant">Not Pregnant</SelectItem>
                            <SelectItem value="pregnant">Pregnant</SelectItem>
                            <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="familyMedicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Medical History</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Medical Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Insurance Tab */}
              <TabsContent value="insurance" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Insurance Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="hasInsurance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditing || loading}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">I have dental insurance</FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch("hasInsurance") && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="insuranceProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Provider</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing || loading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coverageType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coverage Type</FormLabel>
                              <Select
                                disabled={!isEditing || loading}
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="insurancePolicyNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Policy Number</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing || loading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="insuranceGroupNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Group Number (Optional)</FormLabel>
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
                          name="insuranceExpiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" disabled={!isEditing || loading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="copayAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Copay Amount (RWF)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  disabled={!isEditing || loading}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="coverageDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coverage Details</FormLabel>
                            <FormControl>
                              <Textarea {...field} disabled={!isEditing || loading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
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
                    resetForm()
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
