/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Search, Plus, Edit, Trash2, Shield, Mail } from "lucide-react"

export const AdminUserSettings = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [users] = useState([
    {
      id: "1",
      name: "Dr. John Smith",
      email: "john.smith@dentrw.com",
      role: "doctor",
      status: "active",
      lastLogin: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Doe",
      email: "jane.doe@dentrw.com",
      role: "patient",
      status: "active",
      lastLogin: "2024-01-14",
    },
    {
      id: "3",
      name: "Sarah Wilson",
      email: "sarah.wilson@dentrw.com",
      role: "receptionist",
      status: "active",
      lastLogin: "2024-01-15",
    },
    {
      id: "4",
      name: "Mike Johnson",
      email: "mike.johnson@dentrw.com",
      role: "admin",
      status: "inactive",
      lastLogin: "2024-01-10",
    },
  ])

  const [userSettings, setUserSettings] = useState({
    allowSelfRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "patient",
    autoDeactivateInactive: false,
    inactivityPeriod: "90",
    maxUsersPerRole: {
      patient: "1000",
      doctor: "50",
      receptionist: "20",
      admin: "5",
    },
  })

  const handleUserSettingChange = (key: string, value: any) => {
    setUserSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setUserSettings((prev) => ({
      ...prev,
      [parent]: {
        ...((prev[parent as keyof typeof userSettings] as object) || {}),
        [key]: value,
      },
    }))
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

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

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      {/* User Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management Settings
          </CardTitle>
          <CardDescription>Configure user registration and account management policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Self Registration</Label>
                <p className="text-sm text-muted-foreground">Allow users to create their own accounts</p>
              </div>
              <Switch
                checked={userSettings.allowSelfRegistration}
                onCheckedChange={(checked) => handleUserSettingChange("allowSelfRegistration", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the system
                </p>
              </div>
              <Switch
                checked={userSettings.requireEmailVerification}
                onCheckedChange={(checked) => handleUserSettingChange("requireEmailVerification", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-deactivate Inactive Users</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically deactivate users after period of inactivity
                </p>
              </div>
              <Switch
                checked={userSettings.autoDeactivateInactive}
                onCheckedChange={(checked) => handleUserSettingChange("autoDeactivateInactive", checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultRole">Default User Role</Label>
              <Select
                value={userSettings.defaultUserRole}
                onValueChange={(value) => handleUserSettingChange("defaultUserRole", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {userSettings.autoDeactivateInactive && (
              <div className="space-y-2">
                <Label htmlFor="inactivityPeriod">Inactivity Period (days)</Label>
                <Input
                  id="inactivityPeriod"
                  type="number"
                  value={userSettings.inactivityPeriod}
                  onChange={(e) => handleUserSettingChange("inactivityPeriod", e.target.value)}
                  min="30"
                  max="365"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Maximum Users Per Role</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPatients">Patients</Label>
                <Input
                  id="maxPatients"
                  type="number"
                  value={userSettings.maxUsersPerRole.patient}
                  onChange={(e) => handleNestedSettingChange("maxUsersPerRole", "patient", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDoctors">Doctors</Label>
                <Input
                  id="maxDoctors"
                  type="number"
                  value={userSettings.maxUsersPerRole.doctor}
                  onChange={(e) => handleNestedSettingChange("maxUsersPerRole", "doctor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxReceptionists">Receptionists</Label>
                <Input
                  id="maxReceptionists"
                  type="number"
                  value={userSettings.maxUsersPerRole.receptionist}
                  onChange={(e) => handleNestedSettingChange("maxUsersPerRole", "receptionist", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdmins">Admins</Label>
                <Input
                  id="maxAdmins"
                  type="number"
                  value={userSettings.maxUsersPerRole.admin}
                  onChange={(e) => handleNestedSettingChange("maxUsersPerRole", "admin", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Directory
          </CardTitle>
          <CardDescription>Manage existing users and their permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patients</SelectItem>
                <SelectItem value="doctor">Doctors</SelectItem>
                <SelectItem value="receptionist">Receptionists</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* User List */}
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">Last login: {user.lastLogin}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save User Settings</Button>
      </div>
    </div>
  )
}
