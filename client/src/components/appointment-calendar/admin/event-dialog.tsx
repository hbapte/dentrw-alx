/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useMemo, useState } from "react"
import { RiCalendarLine, RiDeleteBinLine, RiUserLine, RiStethoscopeLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"

import type { CalendarEvent, EventColor } from "@/components/appointment-calendar/admin"
import type { Patient } from "@/types/patient.types"
import type { Doctor } from "@/types/doctor.types"
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
import { StartHour, EndHour, DefaultStartHour, DefaultEndHour, appointmentStatuses, appointmentTypes } from "@/components/appointment-calendar/constants"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  patients?: Patient[]
  doctors?: Doctor[]
  isAdminView?: boolean
  currentUser?: any
}


export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  patients = [],
  doctors = [],
}: EventDialogProps) {
  // Appointment specific fields
  const [selectedPatientId, setSelectedPatientId] = useState("")
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
      // Parse appointment data
      setSelectedPatientId(event.metadata?.patientId || "")
      setSelectedDoctorId(event.metadata?.doctorId || "")
      setAppointmentType(event.metadata?.type || "consultation")
      setAppointmentStatus(event.metadata?.status || "scheduled")
      setReason(event.metadata?.reason || "")
      setNotes(event.metadata?.notes || "")

      // Common fields
      const start = new Date(event.start)
      setAppointmentDate(start)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(new Date(event.end)))
      setError(null)
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setSelectedPatientId("")
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

  const selectedPatient = patients.find((p) => p._id === selectedPatientId)
  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId)

  const handleSave = () => {
    // Validation
    if (!selectedPatientId) {
      setError("Please select a patient")
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

    // Create appointment event
    const statusColor = (appointmentStatuses.find((s) => s.value === appointmentStatus)?.color as EventColor) || "blue"

    const appointmentTitle =
      selectedPatient && selectedDoctor
        ? `${selectedPatient.user?.names} - ${selectedDoctor.user?.names}`
        : `Appointment - ${appointmentTypes.find((t) => t.value === appointmentType)?.label}`

    onSave({
      id: event?.id || "",
      title: appointmentTitle,
      description: `${reason}${notes ? `\n\nNotes: ${notes}` : ""}`,
      start,
      end,
      allDay: false,
      location: selectedDoctor ? `${selectedDoctor.user?.names}` : "",
      color: statusColor,
      metadata: {
        appointmentId: event?.id || "",
        patientId: selectedPatientId,
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

  const dialogTitle = event?.id ? "Edit Appointment" : "New Appointment"
  const dialogDescription = event?.id ? "Edit the details of this appointment" : "Schedule a new appointment"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-[700px]")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiCalendarLine size={20} />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">{dialogDescription}</DialogDescription>
        </DialogHeader>

        {error && <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">{error}</div>}

      <ScrollArea className="h-[70vh] px-4">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient" className="flex items-center gap-2">
                <RiUserLine size={16} />
                Patient
              </Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id ?? ""}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={patient.user?.picture || "/placeholder.svg"} alt={patient.user?.names} />
                          <AvatarFallback className="text-xs">
                            {patient.user?.names
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{patient.user?.names}</span>
                          {patient.user?.email && (
                            <span className="text-xs text-muted-foreground">{patient.user.email}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectItem key={doctor._id} value={doctor._id ?? ""}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={doctor.user?.picture || "/placeholder.svg"} alt={doctor.user?.names} />
                          <AvatarFallback className="text-xs">
                            {" "}
                            {doctor.user?.names
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{doctor.user?.names}</span>
                          <span className="text-xs text-muted-foreground">{doctor.specialization.join(", ")}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show selected patient and doctor info */}
          {(selectedPatient || selectedDoctor) && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {selectedPatient && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Selected Patient</Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedPatient?.user?.picture || "/placeholder.svg"}
                        alt={selectedPatient?.user?.names}
                      />
                      <AvatarFallback className="text-xs">
                        {selectedPatient?.user?.names
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPatient?.user?.names}</p>
                      <p className="text-sm text-muted-foreground">{selectedPatient?.user?.email}</p>
                      {selectedPatient?.user?.phoneNumber && (
                        <p className="text-sm text-muted-foreground">{selectedPatient?.user?.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedDoctor && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Selected Doctor</Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedDoctor?.user?.picture || "/placeholder.svg"}
                        alt={selectedDoctor?.user?.names}
                      />
                      <AvatarFallback className="text-xs">
                        {" "}
                        {selectedDoctor?.user?.names
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedDoctor?.user?.names}</p>
                      <p className="text-sm text-muted-foreground">{selectedDoctor?.specialization?.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">{selectedDoctor?.experience} years experience</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
        </div>
      </ScrollArea>

        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive bg-transparent"
              size="icon"
              onClick={handleDelete}
              aria-label="Cancel appointment"
            >
              <RiDeleteBinLine size={16} />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{event?.id ? "Update Appointment" : "Schedule Appointment"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
