// client\src\components\event-calendar\event-dialog.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { RiCalendarLine, RiDeleteBinLine, RiUserLine, RiStethoscopeLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"

import type { CalendarEvent, EventColor } from "@/components/appointment-calendar/event-calendar"
import type { Doctor, Patient } from "@/types/dental-appointment.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StartHour, EndHour, DefaultStartHour, DefaultEndHour } from "@/components/appointment-calendar/constants"
import { useAuthStore } from "../../../store/auth-store"

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  doctors?: Doctor[]
  patients?: Patient[]
  isDentalMode?: boolean
  isPatientView?: boolean
  currentUser?: any // Add this line
}

const appointmentTypes = [
  { value: "consultation", label: "Consultation", description: "Initial consultation or assessment" },
  { value: "checkup", label: "Check-up", description: "Routine dental examination" },
  { value: "treatment", label: "Treatment", description: "Active dental treatment" },
  { value: "follow-up", label: "Follow-up", description: "Post-treatment follow-up visit" },
]

const appointmentStatuses = [
  { value: "scheduled", label: "Scheduled", color: "blue", description: "Appointment is scheduled" },
  { value: "confirmed", label: "Confirmed", color: "emerald", description: "Patient has confirmed attendance" },
  { value: "completed", label: "Completed", color: "violet", description: "Appointment completed successfully" },
  { value: "cancelled", label: "Cancelled", color: "rose", description: "Appointment was cancelled" },
  { value: "no-show", label: "No Show", color: "orange", description: "Patient did not attend" },
]

// Generic event color options for non-dental mode
const colorOptions: Array<{
  value: EventColor
  label: string
  bgClass: string
  borderClass: string
}> = [
  {
    value: "blue",
    label: "Blue",
    bgClass: "bg-blue-400 data-[state=checked]:bg-blue-400",
    borderClass: "border-blue-400 data-[state=checked]:border-blue-400",
  },
  {
    value: "violet",
    label: "Violet",
    bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
    borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
  },
  {
    value: "rose",
    label: "Rose",
    bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
    borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
  },
  {
    value: "emerald",
    label: "Emerald",
    bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
    borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
  },
  {
    value: "orange",
    label: "Orange",
    bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
    borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
  },
]

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  doctors = [],
  patients = [],
  isDentalMode = false,
  isPatientView = false, // Add default value
  currentUser, // Add this line
}: EventDialogProps) {
  // Generic event fields
  const { user } = useAuthStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [color, setColor] = useState<EventColor>("blue")
  const [allDay, setAllDay] = useState(false)

  // Dental appointment specific fields
  const [patientName, setPatientName] = useState(currentUser?.names || user?.names || "")
  const [selectedPatientId, setSelectedPatientId] = useState(currentUser?.id || user?.id || "")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [appointmentType, setAppointmentType] = useState<string>("consultation")
  const [appointmentStatus, setAppointmentStatus] = useState<string>("scheduled")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  // Common fields
  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`)
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`)
  const [error, setError] = useState<string | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    if (event) {
      if (isDentalMode) {
        // Parse appointment data
        const patientNameFromTitle = event.title.split(" - ")[0] || ""
        setPatientName(patientNameFromTitle)
        setSelectedDoctorId(event.metadata?.doctorId || "")
        setSelectedPatientId(event.metadata?.patientId || "")
        setAppointmentType(event.metadata?.type || "consultation")
        setAppointmentStatus(event.metadata?.status || "scheduled")
        setReason(event.metadata?.reason || "")
        setNotes(event.metadata?.notes || "")
        setLocation(event.location || "")
      } else {
        // Parse generic event data
        setTitle(event.title || "")
        setDescription(event.description || "")
        setLocation(event.location || "")
        setColor((event.color as EventColor) || "blue")
        setAllDay(event.allDay || false)
      }

      // Common fields
      const start = new Date(event.start)
      setAppointmentDate(start)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(new Date(event.end)))
      setError(null)
    } else {
      resetForm()
    }
  }, [event, isDentalMode])

  const resetForm = () => {
    // Generic fields
    setTitle("")
    setDescription("")
    setLocation("")
    setColor("blue")
    setAllDay(false)

    // Dental fields
    setPatientName(currentUser?.names || user?.names || "")
    setSelectedPatientId(currentUser?.id || user?.id || "")
    setSelectedDoctorId("")
    setAppointmentType("consultation")
    setAppointmentStatus("scheduled")
    setReason("")
    setNotes("")

    // Common fields
    setAppointmentDate(new Date())
    setStartTime(`${DefaultStartHour}:00`)
    setEndTime(`${DefaultEndHour}:00`)
    setError(null)
  }

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        const date = new Date(2000, 0, 1, hour, minute)
        const label = format(date, "h:mm a")
        options.push({ value, label })
      }
    }
    return options
  }, [])

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId)
  const selectedPatient = patients.find((p) => p._id === selectedPatientId)

  const handleSave = () => {
    if (isDentalMode) {
      // Dental appointment validation
      if (!isPatientView && !patientName.trim() && !selectedPatientId) {
        setError("Patient name or selection is required")
        return
      }

      if (!selectedDoctorId) {
        setError("Please select a doctor")
        return
      }

      if (!reason.trim()) {
        setError("Reason for appointment is required")
        return
      }
    } else {
      // Generic event validation
      if (!title.trim()) {
        setError("Event title is required")
        return
      }
    }

    const start = new Date(appointmentDate)
    const end = new Date(appointmentDate)

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number)
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number)

      if (startHours < StartHour || startHours > EndHour || endHours < StartHour || endHours > EndHour) {
        setError(`Selected time must be between ${StartHour}:00 and ${EndHour}:00`)
        return
      }

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)

      if (isBefore(end, start)) {
        setError("End time cannot be before start time")
        return
      }
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    if (isDentalMode) {
      // Create appointment event
      const statusColor =
        (appointmentStatuses.find((s) => s.value === appointmentStatus)?.color as EventColor) || "blue"

      const appointmentTitle = isPatientView
        ? `${appointmentTypes.find((t) => t.value === appointmentType)?.label}`
        : selectedPatient
          ? `${selectedPatient.names} - ${appointmentTypes.find((t) => t.value === appointmentType)?.label}`
          : `${patientName} - ${appointmentTypes.find((t) => t.value === appointmentType)?.label}`

      onSave({
        id: event?.id || "",
        title: appointmentTitle,
        description: `${reason}${notes ? `\n\nNotes: ${notes}` : ""}`,
        start,
        end,
        allDay: false,
        location: selectedDoctor ? `${selectedDoctor.user.names}` : location,
        color: statusColor,
        metadata: {
          appointmentId: event?.id || "",
          patientId: isPatientView ? currentUser?.id || user?.id || "" : selectedPatientId || "",
          doctorId: selectedDoctorId,
          status: appointmentStatus,
          type: appointmentType,
          reason,
          notes,
        },
      })
    } else {
      // Create generic event
      onSave({
        id: event?.id || "",
        title: title.trim() || "(no title)",
        description,
        start,
        end,
        allDay,
        location,
        color,
      })
    }
  }

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id)
    }
  }

  const dialogTitle = isDentalMode
    ? event?.id
      ? "Edit Appointment"
      : "New Appointment"
    : event?.id
      ? "Edit Event"
      : "Create Event"

  const dialogDescription = isDentalMode
    ? event?.id
      ? "Edit the details of this appointment"
      : "Schedule a new appointment"
    : event?.id
      ? "Edit the details of this event"
      : "Add a new event to your calendar"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto", isDentalMode ? "sm:max-w-[600px]" : "sm:max-w-[425px]")}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDentalMode ? <RiCalendarLine size={20} /> : <RiCalendarLine size={20} />}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">{dialogDescription}</DialogDescription>
        </DialogHeader>

        {error && <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">{error}</div>}

        <div className="grid gap-4 py-4">
          {isDentalMode ? (
            // Dental appointment fields
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient" className="flex items-center gap-2">
                    <RiUserLine size={16} />
                    Patient
                  </Label>
                  {isPatientView ? (
                    <Input id="patient" value={currentUser?.names || user?.names || ""} disabled className="bg-muted" />
                  ) : patients.length > 0 ? (
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger id="patient">
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            <div className="flex flex-col">
                              <span>{patient.names}</span>
                              {patient.email && <span className="text-xs text-muted-foreground">{patient.email}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="patient"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor" className="flex items-center gap-2">
                    <RiStethoscopeLine size={16} />
                    Doctor
                  </Label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger id="doctor">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          <div className="flex flex-col">
                            <span>{doctor.user.names}</span>
                            <span className="text-xs text-muted-foreground">{doctor.specialization.join(", ")}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Date</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="appointment-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-between px-3 font-normal",
                          !appointmentDate && "text-muted-foreground",
                        )}
                      >
                        <span>{appointmentDate ? format(appointmentDate, "PPP") : "Pick date"}</span>
                        <RiCalendarLine size={16} className="text-muted-foreground/80" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <Calendar
                        mode="single"
                        selected={appointmentDate}
                        onSelect={(date) => {
                          if (date) {
                            setAppointmentDate(date)
                            setError(null)
                            setDatePickerOpen(false)
                          }
                        }}
                        disabled={{ before: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-type">Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger id="appointment-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col">
                            <span>{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment-status">Status</Label>
                  <Select value={appointmentStatus} onValueChange={setAppointmentStatus}>
                    <SelectTrigger id="appointment-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`bg-${status.color}-50 text-${status.color}-700 border-${status.color}-200`}
                            >
                              {status.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Routine cleaning, Tooth pain, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes about the appointment..."
                />
              </div>
            </>
          ) : (
            // Generic event fields
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Event description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="event-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-between px-3 font-normal",
                          !appointmentDate && "text-muted-foreground",
                        )}
                      >
                        <span>{appointmentDate ? format(appointmentDate, "PPP") : "Pick date"}</span>
                        <RiCalendarLine size={16} className="text-muted-foreground/80" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <Calendar
                        mode="single"
                        selected={appointmentDate}
                        onSelect={(date) => {
                          if (date) {
                            setAppointmentDate(date)
                            setError(null)
                            setDatePickerOpen(false)
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location"
                  />
                </div>
              </div>

              {!allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger id="start-time">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger id="end-time">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="all-day">All day event</Label>
              </div>

              <fieldset className="space-y-4">
                <legend className="text-foreground text-sm leading-none font-medium">Color</legend>
                <div className="flex gap-1.5">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setColor(colorOption.value)}
                      className={cn(
                        "size-6 rounded-full border-2 transition-all",
                        colorOption.bgClass,
                        color === colorOption.value ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110",
                      )}
                      aria-label={colorOption.label}
                    />
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>

        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive bg-transparent"
              size="icon"
              onClick={handleDelete}
              aria-label={isDentalMode ? "Cancel appointment" : "Delete event"}
            >
              <RiDeleteBinLine size={16} />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isDentalMode
                ? event?.id
                  ? "Update Appointment"
                  : "Schedule Appointment"
                : event?.id
                  ? "Update Event"
                  : "Create Event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
