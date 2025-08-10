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
import { StartHour, EndHour, DefaultStartHour, DefaultEndHour } from "@/components/appointment-calendar/constants"

interface AppointmentDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  doctors: Doctor[]
  patients?: Patient[]
}

const appointmentTypes = [
  { value: "consultation", label: "Consultation" },
  { value: "checkup", label: "Check-up" },
  { value: "treatment", label: "Treatment" },
  { value: "follow-up", label: "Follow-up" },
]

const appointmentStatuses = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "confirmed", label: "Confirmed", color: "emerald" },
  { value: "completed", label: "Completed", color: "violet" },
  { value: "cancelled", label: "Cancelled", color: "rose" },
  { value: "no-show", label: "No Show", color: "orange" },
]

export function AppointmentDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  doctors,
//   patients = [],
}: AppointmentDialogProps) {
  const [patientName, setPatientName] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`)
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`)
  const [appointmentType, setAppointmentType] = useState<string>("consultation")
  const [appointmentStatus, setAppointmentStatus] = useState<string>("scheduled")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    if (event) {
      // Parse existing appointment data
      const patientNameFromTitle = event.title.split(" - ")[0] || ""
      setPatientName(patientNameFromTitle)

      setSelectedDoctorId(event.metadata?.doctorId || "")
      setAppointmentDate(new Date(event.start))
      setStartTime(formatTimeForInput(new Date(event.start)))
      setEndTime(formatTimeForInput(new Date(event.end)))
      setAppointmentType(event.metadata?.type || "consultation")
      setAppointmentStatus(event.metadata?.status || "scheduled")
      setReason(event.metadata?.reason || "")
      setNotes(event.metadata?.notes || "")
      setError(null)
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setPatientName("")
    setSelectedDoctorId("")
    setAppointmentDate(new Date())
    setStartTime(`${DefaultStartHour}:00`)
    setEndTime(`${DefaultEndHour}:00`)
    setAppointmentType("consultation")
    setAppointmentStatus("scheduled")
    setReason("")
    setNotes("")
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

  const handleSave = () => {
    if (!patientName.trim()) {
      setError("Patient name is required")
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

    const start = new Date(appointmentDate)
    const end = new Date(appointmentDate)

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

    const statusColor = (appointmentStatuses.find((s) => s.value === appointmentStatus)?.color as EventColor) || "blue"

    onSave({
      id: event?.id || "",
      title: `${patientName} - ${appointmentTypes.find((t) => t.value === appointmentType)?.label}`,
      description: `${reason}${notes ? `\n\nNotes: ${notes}` : ""}`,
      start,
      end,
      allDay: false,
      location: `Dr. ${selectedDoctor?.user.names}`,
      color: statusColor,
      metadata: {
        appointmentId: event?.id || "",
        patientId: event?.metadata?.patientId || "",
        doctorId: selectedDoctorId,
        status: appointmentStatus,
        type: appointmentType,
        reason,
        notes,
      },
    })
  }

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiCalendarLine size={20} />
            {event?.id ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {event?.id ? "Edit the details of this appointment" : "Schedule a new appointment"}
          </DialogDescription>
        </DialogHeader>

        {error && <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">{error}</div>}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name" className="flex items-center gap-2">
                <RiUserLine size={16} />
                Patient Name
              </Label>
              <Input
                id="patient-name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
              />
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
                        <span>Dr. {doctor.user.names}</span>
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
                      {type.label}
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
                        <div className={`w-2 h-2 rounded-full bg-${status.color}-400`} />
                        {status.label}
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
        </div>

        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive bg-transparent"
              size="icon"
              onClick={handleDelete}
              aria-label="Delete appointment"
            >
              <RiDeleteBinLine size={16} />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{event?.id ? "Update" : "Schedule"} Appointment</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
