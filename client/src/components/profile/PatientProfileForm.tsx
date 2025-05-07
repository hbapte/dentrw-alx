/* eslint-disable react-hooks/exhaustive-deps */
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
import { Loader2 } from "lucide-react"
import toast from 'react-hot-toast'

const patientProfileSchema = z.object({
  // Personal Info
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),

  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Emergency Contact
  emergencyName: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  emergencyPhone: z.string().optional(),

  // Medical History
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  medications: z.string().optional(),

  medicalNotes: z.string().optional(),

  // Insurance
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  insuranceCoverageDetails: z.string().optional(),
})

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>

export const PatientProfileForm = () => {
  const { profile, updatePatientProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      dateOfBirth: "",
      gender: "male",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      allergies: "",
      conditions: "",
      medications: "",
      medicalNotes: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceExpiryDate: "",
      insuranceCoverageDetails: "",
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
        gender: profile.gender || "male",
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        postalCode: profile.address?.postalCode || "",
        country: profile.address?.country || "",
        emergencyName: profile.emergencyContact?.name || "",
        emergencyRelationship: profile.emergencyContact?.relationship || "",
        emergencyPhone: profile.emergencyContact?.phoneNumber || "",
        allergies: profile.medicalHistory?.allergies ? profile.medicalHistory.allergies.join(", ") : "",
        conditions: profile.medicalHistory?.conditions ? profile.medicalHistory.conditions.join(", ") : "",
        medications: profile.medicalHistory?.medications ? profile.medicalHistory.medications.join(", ") : "",
        medicalNotes: profile.medicalHistory?.notes || "",
        insuranceProvider: profile.insuranceInfo?.provider || "",
        insurancePolicyNumber: profile.insuranceInfo?.policyNumber || "",
        insuranceExpiryDate: profile.insuranceInfo?.expiryDate
          ? new Date(profile.insuranceInfo.expiryDate).toISOString().split("T")[0]
          : "",
        insuranceCoverageDetails: profile.insuranceInfo?.coverageDetails || "",
      })
    }
  }, [profile, form])

  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully")
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, toast, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update profile")
      clearError()
    }
  }, [error, toast, clearError])

  const onSubmit = async (data: PatientProfileFormValues) => {
    // Transform form data to match API expectations
    const formattedData = {
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      },
      emergencyContact: {
        name: data.emergencyName,
        relationship: data.emergencyRelationship,
        phoneNumber: data.emergencyPhone,
      },
      medicalHistory: {
        allergies: data.allergies ? data.allergies.split(",").map((item) => item.trim()) : [],
        conditions: data.conditions ? data.conditions.split(",").map((item) => item.trim()) : [],
        medications: data.medications ? data.medications.split(",").map((item) => item.trim()) : [],
        notes: data.medicalNotes,
      },
      insuranceInfo: {
        provider: data.insuranceProvider,
        policyNumber: data.insurancePolicyNumber,
        expiryDate: data.insuranceExpiryDate,
        coverageDetails: data.insuranceCoverageDetails,
      },
    }

    await updatePatientProfile(formattedData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Patient Profile</CardTitle>
            <CardDescription>Manage your patient information</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                if (profile) {
                  form.reset({
                    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
                    gender: profile.gender || "male",
                    street: profile.address?.street || "",
                    city: profile.address?.city || "",
                    state: profile.address?.state || "",
                    postalCode: profile.address?.postalCode || "",
                    country: profile.address?.country || "",
                    emergencyName: profile.emergencyContact?.name || "",
                    emergencyRelationship: profile.emergencyContact?.relationship || "",
                    emergencyPhone: profile.emergencyContact?.phoneNumber || "",
                    allergies: profile.medicalHistory?.allergies ? profile.medicalHistory.allergies.join(", ") : "",
                    conditions: profile.medicalHistory?.conditions ? profile.medicalHistory.conditions.join(", ") : "",
                    medications: profile.medicalHistory?.medications
                      ? profile.medicalHistory.medications.join(", ")
                      : "",
                    medicalNotes: profile.medicalHistory?.notes || "",
                    insuranceProvider: profile.insuranceInfo?.provider || "",
                    insurancePolicyNumber: profile.insuranceInfo?.policyNumber || "",
                    insuranceExpiryDate: profile.insuranceInfo?.expiryDate
                      ? new Date(profile.insuranceInfo.expiryDate).toISOString().split("T")[0]
                      : "",
                    insuranceCoverageDetails: profile.insuranceInfo?.coverageDetails || "",
                  })
                }
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="medical">Medical & Insurance</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
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
                      <Select
                        disabled={!isEditing || loading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
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
              </TabsContent>

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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
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

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing || loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium">Medical History</h3>

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
                    name="conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medications"
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
                    name="medicalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Insurance Information</h3>

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

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <FormField
                    control={form.control}
                    name="insuranceCoverageDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coverage Details</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isEditing || loading} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {isEditing && (
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
