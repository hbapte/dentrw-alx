/* eslint-disable react-hooks/exhaustive-deps */
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
import { Loader2 } from "lucide-react"
import toast from 'react-hot-toast'

const basicInfoSchema = z.object({
  names: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  preferredLanguage: z.enum(["en", "fr", "rw"]),
})

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>

export const BasicInfoForm = () => {
  const { user, updateUserProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      names: "",
      username: "",
      phoneNumber: "",
      preferredLanguage: "en",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        names: user.names || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        preferredLanguage: user.preferredLanguage || "en",
      })
    }
  }, [user, form])

  useEffect(() => {
    if (success) {
      toast.success('Profile updated successfully')
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

  const onSubmit = async (data: BasicInfoFormValues) => {
    await updateUserProfile(data)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
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
                form.reset({
                  names: user?.names || "",
                  username: user?.username || "",
                  phoneNumber: user?.phoneNumber || "",
                  preferredLanguage: user?.preferredLanguage || "en",
                })
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
            <FormField
              control={form.control}
              name="names"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing || loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing || loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing || loading} placeholder="+250700000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select
                    disabled={!isEditing || loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
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
