"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Calendar, Clock, Plus, Trash2, Copy, Settings, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface TimeSlot {
  startTime: string
  endTime: string
  maxPatients: number
  appointmentDuration: number
}

interface DaySchedule {
  day: string
  isWorking: boolean
  slots: TimeSlot[]
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

export const DoctorScheduleSettings = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      day: "monday",
      isWorking: true,
      slots: [
        { startTime: "09:00", endTime: "12:00", maxPatients: 1, appointmentDuration: 30 },
        { startTime: "14:00", endTime: "17:00", maxPatients: 1, appointmentDuration: 30 },
      ],
    },
    {
      day: "tuesday",
      isWorking: true,
      slots: [
        { startTime: "09:00", endTime: "12:00", maxPatients: 1, appointmentDuration: 30 },
        { startTime: "14:00", endTime: "17:00", maxPatients: 1, appointmentDuration: 30 },
      ],
    },
    {
      day: "wednesday",
      isWorking: true,
      slots: [
        { startTime: "09:00", endTime: "12:00", maxPatients: 1, appointmentDuration: 30 },
        { startTime: "14:00", endTime: "17:00", maxPatients: 1, appointmentDuration: 30 },
      ],
    },
    {
      day: "thursday",
      isWorking: true,
      slots: [
        { startTime: "09:00", endTime: "12:00", maxPatients: 1, appointmentDuration: 30 },
        { startTime: "14:00", endTime: "17:00", maxPatients: 1, appointmentDuration: 30 },
      ],
    },
    {
      day: "friday",
      isWorking: true,
      slots: [
        { startTime: "09:00", endTime: "12:00", maxPatients: 1, appointmentDuration: 30 },
        { startTime: "14:00", endTime: "17:00", maxPatients: 1, appointmentDuration: 30 },
      ],
    },
    {
      day: "saturday",
      isWorking: false,
      slots: [],
    },
    {
      day: "sunday",
      isWorking: false,
      slots: [],
    },
  ])

  const updateDayWorkingStatus = (dayKey: string, isWorking: boolean) => {
    setSchedule((prev) =>
      prev.map((day) => (day.day === dayKey ? { ...day, isWorking, slots: isWorking ? day.slots : [] } : day)),
    )
  }

  const addTimeSlot = (dayKey: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayKey
          ? {
              ...day,
              slots: [...day.slots, { startTime: "09:00", endTime: "10:00", maxPatients: 1, appointmentDuration: 30 }],
            }
          : day,
      ),
    )
  }

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayKey ? { ...day, slots: day.slots.filter((_, index) => index !== slotIndex) } : day,
      ),
    )
  }

  const updateTimeSlot = (dayKey: string, slotIndex: number, field: keyof TimeSlot, value: string | number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayKey
          ? {
              ...day,
              slots: day.slots.map((slot, index) => (index === slotIndex ? { ...slot, [field]: value } : slot)),
            }
          : day,
      ),
    )
  }

  const copyScheduleToAllDays = (sourceDayKey: string) => {
    const sourceDay = schedule.find((day) => day.day === sourceDayKey)
    if (!sourceDay) return

    setSchedule((prev) =>
      prev.map((day) =>
        day.day !== sourceDayKey ? { ...day, isWorking: sourceDay.isWorking, slots: [...sourceDay.slots] } : day,
      ),
    )
    toast.success(`Schedule copied to all days`)
  }

  const handleSaveSchedule = () => {
    toast.success("Schedule settings saved successfully")
  }

  const getTotalWeeklyHours = () => {
    return schedule.reduce((total, day) => {
      if (!day.isWorking) return total
      return (
        total +
        day.slots.reduce((dayTotal, slot) => {
          const start = new Date(`2000-01-01T${slot.startTime}:00`)
          const end = new Date(`2000-01-01T${slot.endTime}:00`)
          return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }, 0)
      )
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule Overview
          </CardTitle>
          <CardDescription>Configure your working hours and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-primary">{getTotalWeeklyHours().toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Hours/Week</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-primary">{schedule.filter((d) => d.isWorking).length}</div>
              <div className="text-sm text-muted-foreground">Working Days</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-primary">
                {schedule.reduce((total, day) => total + day.slots.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Time Slots</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-primary">30</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule Configuration */}
      {DAYS_OF_WEEK.map((dayInfo) => {
        const daySchedule = schedule.find((s) => s.day === dayInfo.key)
        if (!daySchedule) return null

        return (
          <Card key={dayInfo.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">{dayInfo.label}</CardTitle>
                    <CardDescription>
                      {daySchedule.isWorking
                        ? `${daySchedule.slots.length} time slot${daySchedule.slots.length !== 1 ? "s" : ""}`
                        : "Not working"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={daySchedule.isWorking}
                    onCheckedChange={(checked) => updateDayWorkingStatus(dayInfo.key, checked)}
                  />
                  {daySchedule.isWorking && (
                    <Button variant="outline" size="sm" onClick={() => copyScheduleToAllDays(dayInfo.key)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy to All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {daySchedule.isWorking && (
              <CardContent className="space-y-4">
                {daySchedule.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Time Slot {slotIndex + 1}</h4>
                      {daySchedule.slots.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeTimeSlot(dayInfo.key, slotIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(dayInfo.key, slotIndex, "startTime", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Time</label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(dayInfo.key, slotIndex, "endTime", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (min)</label>
                        <Select
                          value={slot.appointmentDuration.toString()}
                          onValueChange={(value) =>
                            updateTimeSlot(dayInfo.key, slotIndex, "appointmentDuration", Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Patients</label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={slot.maxPatients}
                          onChange={(e) =>
                            updateTimeSlot(dayInfo.key, slotIndex, "maxPatients", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    {/* Slot Statistics */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {(() => {
                            const start = new Date(`2000-01-01T${slot.startTime}:00`)
                            const end = new Date(`2000-01-01T${slot.endTime}:00`)
                            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                            return `${hours.toFixed(1)} hours`
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {(() => {
                            const start = new Date(`2000-01-01T${slot.startTime}:00`)
                            const end = new Date(`2000-01-01T${slot.endTime}:00`)
                            const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                            const possibleAppointments = Math.floor(totalMinutes / slot.appointmentDuration)
                            return `~${possibleAppointments} appointments`
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={() => addTimeSlot(dayInfo.key)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Schedule Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Schedule Validation
          </CardTitle>
          <CardDescription>Review potential issues with your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.filter((d) => d.isWorking).length === 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">No working days configured</span>
              </div>
            )}

            {getTotalWeeklyHours() < 20 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Weekly hours are quite low ({getTotalWeeklyHours().toFixed(1)} hours)</span>
              </div>
            )}

            {getTotalWeeklyHours() > 60 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Weekly hours are very high ({getTotalWeeklyHours().toFixed(1)} hours)</span>
              </div>
            )}

            {schedule.filter((d) => d.isWorking).length > 0 &&
              getTotalWeeklyHours() >= 20 &&
              getTotalWeeklyHours() <= 60 && (
                <div className="flex items-center gap-2 text-green-600">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Schedule looks good!</span>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSchedule}>Save Schedule Settings</Button>
      </div>
    </div>
  )
}
