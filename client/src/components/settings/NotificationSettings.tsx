"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Bell, Mail, Smartphone, Calendar, Heart, Shield, MessageSquare, Clock, Volume2 } from "lucide-react"
import { toast } from "sonner"

export const NotificationSettings = () => {
  // Email notifications
  const [emailAppointments, setEmailAppointments] = useState(true)
  const [emailReminders, setEmailReminders] = useState(true)
  const [emailTreatments, setEmailTreatments] = useState(true)
  const [emailMarketing, setEmailMarketing] = useState(false)
  const [emailSecurity, setEmailSecurity] = useState(true)

  // Push notifications
  const [pushAppointments, setPushAppointments] = useState(true)
  const [pushReminders, setPushReminders] = useState(true)
  const [pushTreatments, setPushTreatments] = useState(false)
  const [pushMarketing, setPushMarketing] = useState(false)

  // SMS notifications
  const [smsAppointments, setSmsAppointments] = useState(true)
  const [smsReminders, setSmsReminders] = useState(false)
  const [smsEmergency, setSmsEmergency] = useState(true)

  // General settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [quietHours, setQuietHours] = useState(true)
  const [reminderTiming, setReminderTiming] = useState("24h")

  const handleSaveSettings = () => {
    // Implement save logic here
    toast.success("Notification settings saved successfully")
  }

  const handleTestNotification = () => {
    toast.success("Test notification sent!")
  }

  return (
    <div className="space-y-6">
      {/* Master Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Control how and when you receive notifications from DentRw</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>

          {notificationsEnabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">No notifications between 10 PM - 7 AM</p>
                </div>
                <Switch checked={quietHours} onCheckedChange={setQuietHours} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Appointment Reminder Timing</p>
                <Select value={reminderTiming} onValueChange={setReminderTiming}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour before</SelectItem>
                    <SelectItem value="2h">2 hours before</SelectItem>
                    <SelectItem value="24h">24 hours before</SelectItem>
                    <SelectItem value="48h">48 hours before</SelectItem>
                    <SelectItem value="1w">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {notificationsEnabled && (
        <>
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Choose what email notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Appointment Confirmations</p>
                    <p className="text-sm text-muted-foreground">When appointments are booked or changed</p>
                  </div>
                </div>
                <Switch checked={emailAppointments} onCheckedChange={setEmailAppointments} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">Reminders before your appointments</p>
                  </div>
                </div>
                <Switch checked={emailReminders} onCheckedChange={setEmailReminders} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Treatment Updates</p>
                    <p className="text-sm text-muted-foreground">Updates about your dental treatments</p>
                  </div>
                </div>
                <Switch checked={emailTreatments} onCheckedChange={setEmailTreatments} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">Important security notifications</p>
                  </div>
                </div>
                <Switch checked={emailSecurity} onCheckedChange={setEmailSecurity} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Marketing & Tips</p>
                    <p className="text-sm text-muted-foreground">Dental health tips and clinic updates</p>
                  </div>
                </div>
                <Switch checked={emailMarketing} onCheckedChange={setEmailMarketing} />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>Instant notifications on your device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Appointment Updates</p>
                    <p className="text-sm text-muted-foreground">Real-time appointment notifications</p>
                  </div>
                </div>
                <Switch checked={pushAppointments} onCheckedChange={setPushAppointments} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Reminders</p>
                    <p className="text-sm text-muted-foreground">Push reminders for appointments</p>
                  </div>
                </div>
                <Switch checked={pushReminders} onCheckedChange={setPushReminders} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Treatment Notifications</p>
                    <p className="text-sm text-muted-foreground">Updates about ongoing treatments</p>
                  </div>
                </div>
                <Switch checked={pushTreatments} onCheckedChange={setPushTreatments} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Promotional</p>
                    <p className="text-sm text-muted-foreground">Special offers and health tips</p>
                  </div>
                </div>
                <Switch checked={pushMarketing} onCheckedChange={setPushMarketing} />
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
              <CardDescription>Text message notifications to your phone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> SMS notifications may incur charges from your mobile provider.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Appointment Confirmations</p>
                    <p className="text-sm text-muted-foreground">SMS for appointment bookings</p>
                  </div>
                </div>
                <Switch checked={smsAppointments} onCheckedChange={setSmsAppointments} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">SMS reminders before appointments</p>
                  </div>
                </div>
                <Switch checked={smsReminders} onCheckedChange={setSmsReminders} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Emergency Alerts</p>
                    <p className="text-sm text-muted-foreground">Critical health and security alerts</p>
                  </div>
                </div>
                <Switch checked={smsEmergency} onCheckedChange={setSmsEmergency} />
              </div>
            </CardContent>
          </Card>

          {/* Notification Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Test Notifications
              </CardTitle>
              <CardDescription>Test your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestNotification}>
                  Send Test Email
                </Button>
                <Button variant="outline" onClick={handleTestNotification}>
                  Send Test Push
                </Button>
                <Button variant="outline" onClick={handleTestNotification}>
                  Send Test SMS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
          </div>
        </>
      )}
    </div>
  )
}
