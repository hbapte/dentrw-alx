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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Loader2, Plus, X } from "lucide-react"
import { Badge } from "../ui/badge"
import toast from "react-hot-toast"

const doctorProfileSchema = z.object({
  specialization: z.string().min(1, "Specialization is required"),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  bio: z.string().optional(),
  consultationFee: z.coerce.number().min(0, "Consultation fee must be a positive number"),
  qualifications: z.string().optional(),
  languages: z.string().optional(),
})

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>

export const DoctorProfileForm = () => {
  const { profile, updateDoctorProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // For handling array inputs
  const [qualificationInput, setQualificationInput] = useState("")
  const [qualifications, setQualifications] = useState<string[]>([])
  const [languageInput, setLanguageInput] = useState("")
  const [languages, setLanguages] = useState<string[]>([])

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      specialization: "",
      experience: 0,
      bio: "",
      consultationFee: 0,
      qualifications: "",
      languages: "",
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        specialization: profile.specialization || "",
        experience: profile.experience || 0,
        bio: profile.bio || "",
        consultationFee: profile.consultationFee || 0,
        // These are just for validation, we'll handle the arrays separately
        qualifications: profile.qualifications?.join(", ") || "",
        languages: profile.languages?.join(", ") || "",
      })

      // Set the arrays for UI display
      setQualifications(profile.qualifications || [])
      setLanguages(profile.languages || [])
    }
  }, [profile, form])

  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully", )
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, toast, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred while updating the profile", )
      clearError()
    }
  }, [error, toast, clearError])

  const addQualification = () => {
    if (qualificationInput.trim()) {
      setQualifications([...qualifications, qualificationInput.trim()])
      setQualificationInput("")
    }
  }

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index))
  }

  const addLanguage = () => {
    if (languageInput.trim()) {
      setLanguages([...languages, languageInput.trim()])
      setLanguageInput("")
    }
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: DoctorProfileFormValues) => {
    // Transform form data to match API expectations
    const formattedData = {
      specialization: data.specialization,
      experience: data.experience,
      bio: data.bio,
      consultationFee: data.consultationFee,
      qualifications: qualifications,
      languages: languages,
    }

    await updateDoctorProfile(formattedData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Doctor Profile</CardTitle>
            <CardDescription>Manage your professional information</CardDescription>
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
                    specialization: profile.specialization || "",
                    experience: profile.experience || 0,
                    bio: profile.bio || "",
                    consultationFee: profile.consultationFee || 0,
                    qualifications: profile.qualifications?.join(", ") || "",
                    languages: profile.languages?.join(", ") || "",
                  })
                  setQualifications(profile.qualifications || [])
                  setLanguages(profile.languages || [])
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
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="qualifications">Qualifications & Languages</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
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
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee (RWF)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEditing || loading} className="min-h-[150px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="qualifications" className="space-y-6">
                <div className="space-y-4">
                  <FormLabel>Qualifications</FormLabel>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {qualifications.map((qualification, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {qualification}
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-2"
                            onClick={() => removeQualification(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {qualifications.length === 0 && !isEditing && (
                      <p className="text-sm text-muted-foreground">No qualifications added</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={qualificationInput}
                        onChange={(e) => setQualificationInput(e.target.value)}
                        placeholder="Add qualification"
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addQualification()
                          }
                        }}
                      />
                      <Button type="button" onClick={addQualification} disabled={loading || !qualificationInput.trim()}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <FormLabel>Languages</FormLabel>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {languages.map((language, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {language}
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-2"
                            onClick={() => removeLanguage(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {languages.length === 0 && !isEditing && (
                      <p className="text-sm text-muted-foreground">No languages added</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        placeholder="Add language"
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addLanguage()
                          }
                        }}
                      />
                      <Button type="button" onClick={addLanguage} disabled={loading || !languageInput.trim()}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
                    </div>
                  )}
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
