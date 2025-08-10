/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Phone, Monitor, Volume2, Bell, Palette } from "lucide-react"

export const ReceptionistDeskSettings = () => {
  const [deskSettings, setDeskSettings] = useState({
    deskNumber: "DESK-001",
    phoneExtension: "101",
    displaySettings: {
      theme: "light",
      fontSize: "medium",
      showPatientPhotos: true,
      compactView: false,
    },
    notifications: {
      soundEnabled: true,
      volume: "50",
      newAppointmentAlert: true,
      cancellationAlert: true,
      reminderAlert: true,
      urgentCallAlert: true,
    },
    quickActions: {
      showCheckIn: true,
      showSchedule: true,
      showPayments: true,
      showWaitlist: true,
    },
    autoRefresh: {
      enabled: true,
      interval: "30",
    },
    workstation: {
      multiMonitor: false,
      primaryMonitor: "1",
      keyboardShortcuts: true,
    },
  })

  const handleSettingChange = (key: string, value: any) => {
    setDeskSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setDeskSettings((prev) => ({
      ...prev,
      [parent]: {
        ...((prev[parent as keyof typeof deskSettings] as Record<string, any>)),
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Desk Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Desk Configuration
          </CardTitle>
          <CardDescription>Configure your workstation and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deskNumber">Desk Number</Label>
              <Input
                id="deskNumber"
                value={deskSettings.deskNumber}
                onChange={(e) => handleSettingChange("deskNumber", e.target.value)}
                placeholder="Enter desk number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneExtension">Phone Extension</Label>
              <Input
                id="phoneExtension"
                value={deskSettings.phoneExtension}
                onChange={(e) => handleSettingChange("phoneExtension", e.target.value)}
                placeholder="Enter phone extension"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>Customize your interface appearance and layout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={deskSettings.displaySettings.theme}
                onValueChange={(value) => handleNestedSettingChange("displaySettings", "theme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select
                value={deskSettings.displaySettings.fontSize}
                onValueChange={(value) => handleNestedSettingChange("displaySettings", "fontSize", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Patient Photos</Label>
                <p className="text-sm text-muted-foreground">Display patient profile pictures in lists</p>
              </div>
              <Switch
                checked={deskSettings.displaySettings.showPatientPhotos}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange("displaySettings", "showPatientPhotos", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">Use compact layout to show more information</p>
              </div>
              <Switch
                checked={deskSettings.displaySettings.compactView}
                onCheckedChange={(checked) => handleNestedSettingChange("displaySettings", "compactView", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure alerts and sound notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">Enable audio alerts for notifications</p>
            </div>
            <Switch
              checked={deskSettings.notifications.soundEnabled}
              onCheckedChange={(checked) => handleNestedSettingChange("notifications", "soundEnabled", checked)}
            />
          </div>

          {deskSettings.notifications.soundEnabled && (
            <div className="space-y-2">
              <Label htmlFor="volume">Volume Level</Label>
              <div className="flex items-center gap-4">
                <Volume2 className="h-4 w-4" />
                <Input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={deskSettings.notifications.volume}
                  onChange={(e) => handleNestedSettingChange("notifications", "volume", e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm w-12">{deskSettings.notifications.volume}%</span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Alert Types</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Appointment Alert</Label>
                  <p className="text-sm text-muted-foreground">Alert when new appointments are booked</p>
                </div>
                <Switch
                  checked={deskSettings.notifications.newAppointmentAlert}
                  onCheckedChange={(checked) =>
                    handleNestedSettingChange("notifications", "newAppointmentAlert", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cancellation Alert</Label>
                  <p className="text-sm text-muted-foreground">Alert when appointments are cancelled</p>
                </div>
                <Switch
                  checked={deskSettings.notifications.cancellationAlert}
                  onCheckedChange={(checked) =>
                    handleNestedSettingChange("notifications", "cancellationAlert", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminder Alert</Label>
                  <p className="text-sm text-muted-foreground">Alert for appointment reminders</p>
                </div>
                <Switch
                  checked={deskSettings.notifications.reminderAlert}
                  onCheckedChange={(checked) => handleNestedSettingChange("notifications", "reminderAlert", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Urgent Call Alert</Label>
                  <p className="text-sm text-muted-foreground">Alert for urgent or emergency calls</p>
                </div>
                <Switch
                  checked={deskSettings.notifications.urgentCallAlert}
                  onCheckedChange={(checked) => handleNestedSettingChange("notifications", "urgentCallAlert", checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Customize your quick action buttons and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Check-in Button</Label>
                <p className="text-sm text-muted-foreground">Display quick check-in action</p>
              </div>
              <Switch
                checked={deskSettings.quickActions.showCheckIn}
                onCheckedChange={(checked) => handleNestedSettingChange("quickActions", "showCheckIn", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Schedule Button</Label>
                <p className="text-sm text-muted-foreground">Display quick schedule access</p>
              </div>
              <Switch
                checked={deskSettings.quickActions.showSchedule}
                onCheckedChange={(checked) => handleNestedSettingChange("quickActions", "showSchedule", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Payments Button</Label>
                <p className="text-sm text-muted-foreground">Display quick payment processing</p>
              </div>
              <Switch
                checked={deskSettings.quickActions.showPayments}
                onCheckedChange={(checked) => handleNestedSettingChange("quickActions", "showPayments", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Waitlist Button</Label>
                <p className="text-sm text-muted-foreground">Display waitlist management</p>
              </div>
              <Switch
                checked={deskSettings.quickActions.showWaitlist}
                onCheckedChange={(checked) => handleNestedSettingChange("quickActions", "showWaitlist", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system behavior and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">Automatically refresh data periodically</p>
            </div>
            <Switch
              checked={deskSettings.autoRefresh.enabled}
              onCheckedChange={(checked) => handleNestedSettingChange("autoRefresh", "enabled", checked)}
            />
          </div>

          {deskSettings.autoRefresh.enabled && (
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
              <Select
                value={deskSettings.autoRefresh.interval}
                onValueChange={(value) => handleNestedSettingChange("autoRefresh", "interval", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Keyboard Shortcuts</Label>
              <p className="text-sm text-muted-foreground">Enable keyboard shortcuts for quick actions</p>
            </div>
            <Switch
              checked={deskSettings.workstation.keyboardShortcuts}
              onCheckedChange={(checked) => handleNestedSettingChange("workstation", "keyboardShortcuts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Desk Settings</Button>
      </div>
    </div>
  )
}
