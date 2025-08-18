"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useProfileStore } from "../../store/profile-store"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Loader2, User, Mail, Phone, Briefcase } from "lucide-react"
import { toast } from "sonner"
// import { ProfilePictureUpload } from "../profile/ProfilePictureUpload"

const accountSchema = z.object({
  names: z.string().min(2, "Names must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  nationalId: z
    .string()
    .regex(/^[0-9]{16}$/, "National ID must be 16 digits")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  occupation: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountSchema>

export const AccountSettings = () => {
  const { user, updateUserProfile, loading, error, success, clearError, clearSuccess } = useProfileStore()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      names: "",
      username: "",
      phoneNumber: "",
      nationalId: "",
      dateOfBirth: "",
      gender: "male",
      maritalStatus: "single",
      occupation: "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        names: user.names || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        nationalId: user.nationalId || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        gender: user.gender || "male",
        maritalStatus: user.maritalStatus || "single",
        occupation: user.occupation || "",
      })
    }
  }, [user, form])

  useEffect(() => {
    if (success) {
      toast.success("Account updated successfully")
      setIsEditing(false)
      clearSuccess()
    }
  }, [success, clearSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update account")
      clearError()
    }
  }, [error, clearError])

  const onSubmit = async (data: AccountFormValues) => {
    await updateUserProfile(data)
  }

  const resetForm = () => {
    if (user) {
      form.reset({
        names: user.names || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        nationalId: user.nationalId || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        gender: user.gender || "male",
        maritalStatus: user.maritalStatus || "single",
        occupation: user.occupation || "",
      })
    }
  }

  return (
    <div className="space-y-6">

      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Manage your personal account details</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Account
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
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="names"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Names</FormLabel>
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
                        <FormLabel>Username (Optional)</FormLabel>
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
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+250 XXX XXX XXX" disabled={!isEditing || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

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
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Status
          </CardTitle>
          <CardDescription>Your account verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Email Verification</span>
              <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                {user?.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Phone Verification</span>
              <Badge variant={user?.phoneVerified ? "default" : "secondary"}>
                {user?.phoneVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Account Status</span>
              <Badge variant={user?.active ? "default" : "destructive"}>{user?.active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Account Type</span>
              <Badge variant="outline" className="capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
