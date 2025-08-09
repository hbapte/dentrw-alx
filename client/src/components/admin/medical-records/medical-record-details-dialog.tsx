"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { User, Phone, Mail, Calendar, Clock, FileText, Pill, Download, Stethoscope, AlertTriangle } from "lucide-react"
import MedicalRecordService from "@/services/medical-record.service"
import type { MedicalRecord } from "@/types/medical-record.types"
import {
  getAppointmentTypeBadgeColor,
  getFollowUpBadgeColor,
} from "@/utils/medical-record.utils"
import { format } from "date-fns"
import { formatDuration, formatPhoneNumber } from "@/utils/format-utils"

interface MedicalRecordDetailsDialogProps {
  recordId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MedicalRecordDetailsDialog({ recordId, open, onOpenChange }: MedicalRecordDetailsDialogProps) {
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && recordId) {
      fetchRecordDetails()
    }
  }, [open, recordId])

  const fetchRecordDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const recordData = await MedicalRecordService.getRecordById(recordId)
      setRecord(recordData)
    } catch (err) {
      console.error("Failed to fetch medical record details:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch medical record details")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadAttachment = (attachment: any) => {
    window.open(attachment.url, "_blank")
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !record) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error || "Medical record not found"}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <DialogTitle className="text-2xl">Medical Record</DialogTitle>
              <DialogDescription className="text-base">
                Record ID: {record._id} • Created {format(new Date(record.createdAt), "PPP")}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getAppointmentTypeBadgeColor(record.appointment.type)}>
                  {record.appointment.type.charAt(0).toUpperCase() + record.appointment.type.slice(1)}
                </Badge>
                <Badge className={getFollowUpBadgeColor(record.followUpRequired)}>
                  {record.followUpRequired ? "Follow-up Required" : "Complete"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </h3>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={record.patient.user.picture || "/placeholder.svg"}
                    alt={record.patient.user.names}
                  />
                  <AvatarFallback className="text-lg">
                    {record.patient.user.names
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold">{record.patient.user.names}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{record.patient.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhoneNumber(record.patient.user.phoneNumber)}</span>
                    </div>
                    {record.patient.gender && (
                      <div className="text-sm">
                        <span className="font-medium">Gender:</span>{" "}
                        {record.patient.gender.charAt(0).toUpperCase() + record.patient.gender.slice(1)}
                      </div>
                    )}
                    {record.patient.occupation && (
                      <div className="text-sm">
                        <span className="font-medium">Occupation:</span> {record.patient.occupation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Doctor Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </h3>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={record.doctor.user.picture || "/placeholder.svg"} alt={record.doctor.user.names} />
                  <AvatarFallback className="text-lg">
                    {record.doctor.user.names
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold">{record.doctor.user.names}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{record.doctor.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhoneNumber(record.doctor.user.phoneNumber)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Specialization:</span> {record.doctor.specialization.join(", ")}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Experience:</span> {record.doctor.experience} years
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Appointment Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{format(new Date(record.appointment.date), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Time:</span>
                    <span>
                      {record.appointment.startTime} - {record.appointment.endTime}
                    </span>
                    <Badge variant="outline">
                      {formatDuration(record.appointment.startTime, record.appointment.endTime)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <Badge className={getAppointmentTypeBadgeColor(record.appointment.type)}>
                      {record.appointment.type.charAt(0).toUpperCase() + record.appointment.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant="default" className="ml-2">
                      {record.appointment.status.charAt(0).toUpperCase() + record.appointment.status.slice(1)}
                    </Badge>
                  </div>
                  {record.appointment.reason && (
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="text-sm mt-1">{record.appointment.reason}</p>
                    </div>
                  )}
                  {record.appointment.notes && (
                    <div>
                      <span className="font-medium">Appointment Notes:</span>
                      <p className="text-sm mt-1">{record.appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Diagnosis</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{record.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Treatment</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{record.treatment}</p>
                </div>
                {record.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Notes</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Prescriptions */}
            {record.prescription.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Prescriptions ({record.prescription.length})
                  </h3>
                  <div className="space-y-3">
                    {record.prescription.map((prescription, index) => (
                      <div key={prescription._id || index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">Medication:</span>
                              <span className="ml-2 text-lg">{prescription.medication}</span>
                            </div>
                            <div>
                              <span className="font-medium">Dosage:</span>
                              <span className="ml-2">{prescription.dosage}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">Frequency:</span>
                              <span className="ml-2">{prescription.frequency}</span>
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>
                              <span className="ml-2">{prescription.duration}</span>
                            </div>
                          </div>
                        </div>
                        {prescription.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="font-medium">Notes:</span>
                            <p className="text-sm mt-1">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Follow-up Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Follow-up Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Follow-up Required:</span>
                  <Badge className={getFollowUpBadgeColor(record.followUpRequired)}>
                    {record.followUpRequired ? "Yes" : "No"}
                  </Badge>
                </div>
                {record.followUpRequired && record.followUpDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Follow-up Date:</span>
                    <span>{format(new Date(record.followUpDate), "PPP")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {record.attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Attachments ({record.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {record.attachments.map((attachment) => (
                      <div key={attachment._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{attachment.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(1)} KB • {attachment.mimeType}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadAttachment(attachment)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Record Metadata */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Created:</span> {format(new Date(record.createdAt), "PPP 'at' p")}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Last Updated:</span>{" "}
                    {format(new Date(record.updatedAt), "PPP 'at' p")}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Record ID:</span> {record._id}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Appointment ID:</span> {record.appointment._id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
