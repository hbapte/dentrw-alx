"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Eye, Download, Trash2, Shield, Users, Activity, FileText } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { toast } from "sonner"

export const PrivacySettings = () => {
  const [profileVisibility, setProfileVisibility] = useState("private")
  const [shareData, setShareData] = useState(false)
  const [locationTracking, setLocationTracking] = useState(false)
  const [analyticsTracking, setAnalyticsTracking] = useState(true)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [dataRetention, setDataRetention] = useState("5years")

  const handleDownloadData = () => {
    toast.success("Data export request submitted. You'll receive an email when ready.")
  }

  const handleDeleteAccount = () => {
    toast.error("Account deletion initiated. Please check your email for confirmation.")
  }

  return (
    <div className="space-y-6">
      {/* Profile Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Privacy
          </CardTitle>
          <CardDescription>Control who can see your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Profile Visibility</p>
            <Select value={profileVisibility} onValueChange={setProfileVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see</SelectItem>
                <SelectItem value="clinic">Clinic Only - Only clinic staff</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {profileVisibility === "public" && "Your basic profile information will be visible to other patients"}
              {profileVisibility === "clinic" && "Only DentRw clinic staff can see your profile"}
              {profileVisibility === "private" && "Your profile is completely private"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Data Sharing
          </CardTitle>
          <CardDescription>Control how your data is shared and used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Share Anonymous Data</p>
              <p className="text-sm text-muted-foreground">
                Help improve dental care by sharing anonymized treatment data
              </p>
            </div>
            <Switch checked={shareData} onCheckedChange={setShareData} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Marketing Communications</p>
              <p className="text-sm text-muted-foreground">Receive personalized offers and dental health tips</p>
            </div>
            <Switch checked={marketingConsent} onCheckedChange={setMarketingConsent} />
          </div>
        </CardContent>
      </Card>

      {/* Tracking & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tracking & Analytics
          </CardTitle>
          <CardDescription>Manage tracking and analytics preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Location Tracking</p>
              <p className="text-sm text-muted-foreground">Allow location tracking for appointment reminders</p>
            </div>
            <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Usage Analytics</p>
              <p className="text-sm text-muted-foreground">Help us improve the app by sharing usage data</p>
            </div>
            <Switch checked={analyticsTracking} onCheckedChange={setAnalyticsTracking} />
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription>Control how long your data is stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Data Retention Period</p>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="3years">3 Years</SelectItem>
                <SelectItem value="5years">5 Years (Recommended)</SelectItem>
                <SelectItem value="10years">10 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Medical records are typically retained for 5-10 years for legal and health continuity purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>Exercise your rights regarding your personal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Download Your Data</h3>
              </div>
              <p className="text-sm text-muted-foreground">Get a copy of all your personal data in a portable format</p>
              <Button variant="outline" size="sm" onClick={handleDownloadData}>
                Request Data Export
              </Button>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Data Portability</h3>
              </div>
              <p className="text-sm text-muted-foreground">Transfer your data to another healthcare provider</p>
              <Button variant="outline" size="sm">
                Request Transfer
              </Button>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-600" />
              <h3 className="font-medium text-red-800 dark:text-red-200">Delete Account</h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Personal information and profile</li>
                      <li>Medical and dental history</li>
                      <li>Appointment history</li>
                      <li>Treatment records</li>
                      <li>All uploaded documents and images</li>
                    </ul>
                    <br />
                    This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Information</CardTitle>
          <CardDescription>Learn more about how we protect your privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Privacy Policy
            </Button>
            <Button variant="outline" size="sm">
              Terms of Service
            </Button>
            <Button variant="outline" size="sm">
              Cookie Policy
            </Button>
            <Button variant="outline" size="sm">
              Data Processing Agreement
            </Button>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Your privacy matters to us.</strong> We comply with Rwanda's data protection laws and
              international standards to keep your medical information secure and confidential.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
