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
import { Calendar, Clock, Users, Bell } from "lucide-react"

export const ReceptionistAppointmentSettings = () => {
  const [appointmentSettings, setAppointmentSettings] = useState({
    booking: {
      allowOnlineBooking: true,
      requireApproval: false,
      advanceBookingDays: "30",
      minNoticeHours: "2",
      maxAppointmentsPerDay: "50",
      allowDoubleBooking: false,
    },
    scheduling: {
      defaultDuration: "30",
      bufferTime: "15",
      workingHours: {
        start: "08:00",
        end: "18:00",
      },
      lunchBreak: {
        enabled: true,
        start: "12:00",
        end: "13:00",
      },
      weekendBooking: false,
    },
    reminders: {
      enabled: true,
      emailReminder: true,
      smsReminder: false,
      reminderTiming: ["24", "2"],
      customMessage: "",
    },
    cancellation: {
      allowOnlineCancellation: true,
      cancellationDeadline: "24",
      requireReason: true,
      autoWaitlist: true,
    },
    waitlist: {
      enabled: true,
      autoNotify: true,
      maxWaitlistSize: "20",
      priorityBooking: true,
    },
  })

  const handleSettingChange = (parent: string, key: string, value: any) => {
    setAppointmentSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof appointmentSettings],
        [key]: value,
      },
    }))
  }

  const handleNestedSettingChange = (parent: string, nested: string, key: string, value: any) => {
    setAppointmentSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof appointmentSettings],
        [nested]: {
          ...((prev[parent as keyof typeof appointmentSettings] as Record<string, any>)[nested]),
          [key]: value,
        },
      },
    }))
  }

  const handleReminderTimingChange = (index: number, value: string) => {
    const newTiming = [...appointmentSettings.reminders.reminderTiming]
    newTiming[index] = value
    handleSettingChange("reminders", "reminderTiming", newTiming)
  }

  return (
    <div className="space-y-6">
      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Settings
          </CardTitle>
          <CardDescription>Configure appointment booking rules and restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Online Booking</Label>
                <p className="text-sm text-muted-foreground">Patients can book appointments online</p>
              </div>
              <Switch
                checked={appointmentSettings.booking.allowOnlineBooking}
                onCheckedChange={(checked) => handleSettingChange("booking", "allowOnlineBooking", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-sm text-muted-foreground">Online bookings need staff approval</p>
              </div>
              <Switch
                checked={appointmentSettings.booking.requireApproval}
                onCheckedChange={(checked) => handleSettingChange("booking", "requireApproval", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Double Booking</Label>
                <p className="text-sm text-muted-foreground">Allow multiple appointments at same time</p>
              </div>
              <Switch
                checked={appointmentSettings.booking.allowDoubleBooking}
                onCheckedChange={(checked) => handleSettingChange("booking", "allowDoubleBooking", checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
              <Input
                id="advanceBooking"
                type="number"
                value={appointmentSettings.booking.advanceBookingDays}
                onChange={(e) => handleSettingChange("booking", "advanceBookingDays", e.target.value)}
                min="1"
                max="365"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minNotice">Minimum Notice (hours)</Label>
              <Input
                id="minNotice"
                type="number"
                value={appointmentSettings.booking.minNoticeHours}
                onChange={(e) => handleSettingChange("booking", "minNoticeHours", e.target.value)}
                min="1"
                max="72"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPerDay">Max Appointments/Day</Label>
              <Input
                id="maxPerDay"
                type="number"
                value={appointmentSettings.booking.maxAppointmentsPerDay}
                onChange={(e) => handleSettingChange("booking", "maxAppointmentsPerDay", e.target.value)}
                min="1"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduling Settings
          </CardTitle>
          <CardDescription>Configure default scheduling parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
              <Select
                value={appointmentSettings.scheduling.defaultDuration}
                onValueChange={(value) => handleSettingChange("scheduling", "defaultDuration", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
              <Select
                value={appointmentSettings.scheduling.bufferTime}
                onValueChange={(value) => handleSettingChange("scheduling", "bufferTime", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Working Hours</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStart">Start Time</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={appointmentSettings.scheduling.workingHours.start}
                  onChange={(e) => handleNestedSettingChange("scheduling", "workingHours", "start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workEnd">End Time</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={appointmentSettings.scheduling.workingHours.end}
                  onChange={(e) => handleNestedSettingChange("scheduling", "workingHours", "end", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lunch Break</Label>
                <p className="text-sm text-muted-foreground">Block time for lunch break</p>
              </div>
              <Switch
                checked={appointmentSettings.scheduling.lunchBreak.enabled}
                onCheckedChange={(checked) => handleNestedSettingChange("scheduling", "lunchBreak", "enabled", checked)}
              />
            </div>
            {appointmentSettings.scheduling.lunchBreak.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunchStart">Lunch Start</Label>
                  <Input
                    id="lunchStart"
                    type="time"
                    value={appointmentSettings.scheduling.lunchBreak.start}
                    onChange={(e) => handleNestedSettingChange("scheduling", "lunchBreak", "start", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunchEnd">Lunch End</Label>
                  <Input
                    id="lunchEnd"
                    type="time"
                    value={appointmentSettings.scheduling.lunchBreak.end}
                    onChange={(e) => handleNestedSettingChange("scheduling", "lunchBreak", "end", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekend Booking</Label>
              <p className="text-sm text-muted-foreground">Allow appointments on weekends</p>
            </div>
            <Switch
              checked={appointmentSettings.scheduling.weekendBooking}
              onCheckedChange={(checked) => handleSettingChange("scheduling", "weekendBooking", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminder Settings
          </CardTitle>
          <CardDescription>Configure appointment reminder notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">Send appointment reminders to patients</p>
            </div>
            <Switch
              checked={appointmentSettings.reminders.enabled}
              onCheckedChange={(checked) => handleSettingChange("reminders", "enabled", checked)}
            />
          </div>

          {appointmentSettings.reminders.enabled && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders via email</p>
                  </div>
                  <Switch
                    checked={appointmentSettings.reminders.emailReminder}
                    onCheckedChange={(checked) => handleSettingChange("reminders", "emailReminder", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders via SMS</p>
                  </div>
                  <Switch
                    checked={appointmentSettings.reminders.smsReminder}
                    onCheckedChange={(checked) => handleSettingChange("reminders", "smsReminder", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reminder Timing</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder1">First Reminder (hours before)</Label>
                    <Select
                      value={appointmentSettings.reminders.reminderTiming[0]}
                      onValueChange={(value) => handleReminderTimingChange(0, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder2">Second Reminder (hours before)</Label>
                    <Select
                      value={appointmentSettings.reminders.reminderTiming[1]}
                      onValueChange={(value) => handleReminderTimingChange(1, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waitlist Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Settings
          </CardTitle>
          <CardDescription>Configure waitlist management and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Waitlist</Label>
              <p className="text-sm text-muted-foreground">Allow patients to join waitlist for cancelled slots</p>
            </div>
            <Switch
              checked={appointmentSettings.waitlist.enabled}
              onCheckedChange={(checked) => handleSettingChange("waitlist", "enabled", checked)}
            />
          </div>

          {appointmentSettings.waitlist.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Notify</Label>
                  <p className="text-sm text-muted-foreground">Automatically notify waitlist when slots open</p>
                </div>
                <Switch
                  checked={appointmentSettings.waitlist.autoNotify}
                  onCheckedChange={(checked) => handleSettingChange("waitlist", "autoNotify", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Priority Booking</Label>
                  <p className="text-sm text-muted-foreground">Give waitlist patients priority for new slots</p>
                </div>
                <Switch
                  checked={appointmentSettings.waitlist.priorityBooking}
                  onCheckedChange={(checked) => handleSettingChange("waitlist", "priorityBooking", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWaitlist">Maximum Waitlist Size</Label>
                <Input
                  id="maxWaitlist"
                  type="number"
                  value={appointmentSettings.waitlist.maxWaitlistSize}
                  onChange={(e) => handleSettingChange("waitlist", "maxWaitlistSize", e.target.value)}
                  min="5"
                  max="100"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Appointment Settings</Button>
      </div>
    </div>
  )
}
