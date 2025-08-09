"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Phone, Mail, MapPin, Calendar, Heart, Shield, AlertTriangle, Clock, FileText, Users } from "lucide-react"
import PatientService from "../../../services/patient.service"
import type { Patient } from "../../../types/patient.types"
import {
  calculateAge,
  formatPhoneNumber,
  getRiskBadgeColor,
  getInsuranceBadgeColor,
  getAnxietyBadgeColor,
} from "../../../utils/patient.utils"
import { format } from "date-fns"

interface PatientDetailsDialogProps {
  patientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDetailsDialog({ patientId, open, onOpenChange }: PatientDetailsDialogProps) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && patientId) {
      fetchPatientDetails()
    }
  }, [open, patientId])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const patientData = await PatientService.getPatientById(patientId)
      setPatient(patientData)
    } catch (err) {
      console.error("Failed to fetch patient details:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch patient details")
    } finally {
      setLoading(false)
    }
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

  if (error || !patient) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error || "Patient not found"}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const age = calculateAge(patient.dateOfBirth || patient.user.dateOfBirth || "")
  const riskLevel = patient.clinicalNotes?.riskAssessment || "low"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.user.picture || "/placeholder.svg"} alt={patient.user.names} />
              <AvatarFallback className="text-lg">
                {patient.user.names
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{patient.user.names}</DialogTitle>
              <DialogDescription className="text-base">
                Patient ID: {patient._id} • {age > 0 ? `${age} years old` : "Age not specified"}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={patient.user.active ? "default" : "secondary"}>
                  {patient.user.active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant={patient.user.emailVerified ? "default" : "outline"}>
                  {patient.user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge className={getRiskBadgeColor(riskLevel)}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{patient.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm">{formatPhoneNumber(patient.user.phoneNumber)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Gender:</span>
                    <span className="text-sm">
                      {(patient.gender || patient.user.gender || "Not specified").charAt(0).toUpperCase() +
                        (patient.gender || patient.user.gender || "Not specified").slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm">
                      {patient.dateOfBirth || patient.user.dateOfBirth
                        ? format(new Date(patient.dateOfBirth || patient.user.dateOfBirth!), "PPP")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">National ID:</span>
                    <span className="text-sm">{patient.nationalId || patient.user.nationalId || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Marital Status:</span>
                    <span className="text-sm">
                      {(patient.maritalStatus || patient.user.maritalStatus || "Not specified")
                        .charAt(0)
                        .toUpperCase() +
                        (patient.maritalStatus || patient.user.maritalStatus || "Not specified").slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Street:</span> {patient.address.street || "Not provided"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Sector:</span> {patient.address.sector || "Not provided"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Cell:</span> {patient.address.cell || "Not provided"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Village:</span> {patient.address.village || "Not provided"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">District:</span> {patient.address.district || "Not provided"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Province:</span> {patient.address.province || "Not provided"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Country:</span> {patient.address.country || "Rwanda"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Postal Code:</span> {patient.address.postalCode || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            {patient.emergencyContact.name && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Name:</span> {patient.emergencyContact.name}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Relationship:</span>{" "}
                        {patient.emergencyContact.relationship || "Not specified"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Phone:</span>{" "}
                        {formatPhoneNumber(patient.emergencyContact.phoneNumber || "")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Email:</span> {patient.emergencyContact.email || "Not provided"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Address:</span>{" "}
                        {patient.emergencyContact.address || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Insurance Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={getInsuranceBadgeColor(patient.insuranceInfo.hasInsurance)}>
                    {patient.insuranceInfo.hasInsurance ? "Insured" : "Uninsured"}
                  </Badge>
                  {patient.insuranceInfo.hasInsurance && (
                    <Badge variant="outline">
                      {patient.insuranceInfo.coverageType?.charAt(0).toUpperCase() +
                        patient.insuranceInfo.coverageType?.slice(1) || "Basic"}
                    </Badge>
                  )}
                </div>
                {patient.insuranceInfo.hasInsurance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Provider:</span>{" "}
                        {patient.insuranceInfo.provider || "Not specified"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Policy Number:</span>{" "}
                        {patient.insuranceInfo.policyNumber || "Not provided"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Group Number:</span>{" "}
                        {patient.insuranceInfo.groupNumber || "Not provided"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Coverage Details:</span>{" "}
                        {patient.insuranceInfo.coverageDetails || "Not specified"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Copay Amount:</span>{" "}
                        {patient.insuranceInfo.copayAmount
                          ? `${patient.insuranceInfo.copayAmount.toLocaleString()} RWF`
                          : "Not specified"}
                      </div>
                      {patient.insuranceInfo.expiryDate && (
                        <div className="text-sm">
                          <span className="font-medium">Expiry Date:</span>{" "}
                          {format(new Date(patient.insuranceInfo.expiryDate), "PPP")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical History
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Allergies</h4>
                    {patient.medicalHistory.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No known allergies</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Chronic Conditions</h4>
                    {patient.medicalHistory.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory.chronicConditions.map((condition, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No chronic conditions</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Current Medications</h4>
                    {patient.medicalHistory.currentMedications.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory.currentMedications.map((medication, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No current medications</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Surgical History</h4>
                    {patient.medicalHistory.surgicalHistory.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory.surgicalHistory.map((surgery, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {surgery}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No surgical history</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm">
                    <span className="font-medium">Smoking Status:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {patient.medicalHistory.smokingStatus.charAt(0).toUpperCase() +
                        patient.medicalHistory.smokingStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Alcohol Consumption:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {patient.medicalHistory.alcoholConsumption.charAt(0).toUpperCase() +
                        patient.medicalHistory.alcoholConsumption.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Pregnancy Status:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {patient.medicalHistory.pregnancyStatus.replace("_", " ").charAt(0).toUpperCase() +
                        patient.medicalHistory.pregnancyStatus.replace("_", " ").slice(1)}
                    </Badge>
                  </div>
                </div>
                {patient.medicalHistory.familyMedicalHistory && (
                  <div>
                    <h4 className="font-medium mb-2">Family Medical History</h4>
                    <p className="text-sm">{patient.medicalHistory.familyMedicalHistory}</p>
                  </div>
                )}
                {patient.medicalHistory.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Medical Notes</h4>
                    <p className="text-sm">{patient.medicalHistory.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Dental History */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dental History
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Previous Dentist:</span>{" "}
                      {patient.dentalHistory.previousDentist || "Not specified"}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Visit:</span>{" "}
                      {patient.dentalHistory.lastDentalVisit
                        ? format(new Date(patient.dentalHistory.lastDentalVisit), "PPP")
                        : "No previous visits"}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Reason for Last Visit:</span>{" "}
                      {patient.dentalHistory.reasonForLastVisit || "Not specified"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Pain Level:</span>{" "}
                      <Badge
                        variant={
                          patient.dentalHistory.painLevel > 5
                            ? "destructive"
                            : patient.dentalHistory.painLevel > 2
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {patient.dentalHistory.painLevel}/10
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Anxiety Level:</span>{" "}
                      <Badge className={getAnxietyBadgeColor(patient.preferences.anxietyLevel)}>
                        {patient.preferences.anxietyLevel.charAt(0).toUpperCase() +
                          patient.preferences.anxietyLevel.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {patient.dentalHistory.currentComplaints.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Current Complaints</h4>
                    <div className="flex flex-wrap gap-1">
                      {patient.dentalHistory.currentComplaints.map((complaint, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {complaint}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Hot/Cold Sensitivity:</span>
                    <Badge variant={patient.dentalHistory.sensitivityToHotCold ? "destructive" : "outline"}>
                      {patient.dentalHistory.sensitivityToHotCold ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Bleeding Gums:</span>
                    <Badge variant={patient.dentalHistory.bleedingGums ? "destructive" : "outline"}>
                      {patient.dentalHistory.bleedingGums ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Bad Breath:</span>
                    <Badge variant={patient.dentalHistory.badBreath ? "destructive" : "outline"}>
                      {patient.dentalHistory.badBreath ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Teeth Grinding:</span>
                    <Badge variant={patient.dentalHistory.teethGrinding ? "destructive" : "outline"}>
                      {patient.dentalHistory.teethGrinding ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Jaw Pain:</span>
                    <Badge variant={patient.dentalHistory.jawPain ? "destructive" : "outline"}>
                      {patient.dentalHistory.jawPain ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Preferred Appointment Time:</span>{" "}
                    <Badge variant="outline">
                      {patient.preferences.preferredAppointmentTime.charAt(0).toUpperCase() +
                        patient.preferences.preferredAppointmentTime.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Communication Preference:</span>{" "}
                    <Badge variant="outline">
                      {patient.preferences.communicationPreference.charAt(0).toUpperCase() +
                        patient.preferences.communicationPreference.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Reminders:</span>{" "}
                    <Badge variant={patient.preferences.reminderPreference ? "default" : "outline"}>
                      {patient.preferences.reminderPreference ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {patient.preferences.treatmentPreferences.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Treatment Preferences:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.preferences.treatmentPreferences.map((preference, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {preference}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.preferences.specialNeeds && (
                    <div className="text-sm">
                      <span className="font-medium">Special Needs:</span> {patient.preferences.specialNeeds}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            {patient.clinicalNotes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Clinical Notes
                  </h3>
                  <div className="space-y-3">
                    {patient.clinicalNotes.treatmentPlan && (
                      <div>
                        <h4 className="font-medium mb-1">Treatment Plan</h4>
                        <p className="text-sm">{patient.clinicalNotes.treatmentPlan}</p>
                      </div>
                    )}
                    {patient.clinicalNotes.followUpInstructions && (
                      <div>
                        <h4 className="font-medium mb-1">Follow-up Instructions</h4>
                        <p className="text-sm">{patient.clinicalNotes.followUpInstructions}</p>
                      </div>
                    )}
                    {patient.clinicalNotes.staffNotes && (
                      <div>
                        <h4 className="font-medium mb-1">Staff Notes</h4>
                        <p className="text-sm">{patient.clinicalNotes.staffNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Registration Date:</span> {format(new Date(patient.createdAt), "PPP")}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Last Updated:</span> {format(new Date(patient.updatedAt), "PPP")}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Preferred Language:</span>{" "}
                    {patient.user.preferredLanguage.toUpperCase()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Username:</span> {patient.user.username}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Last Login:</span>{" "}
                    {patient.user.lastLogin ? format(new Date(patient.user.lastLogin), "PPP") : "Never"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Phone Verified:</span>{" "}
                    <Badge variant={patient.user.phoneVerified ? "default" : "outline"}>
                      {patient.user.phoneVerified ? "Yes" : "No"}
                    </Badge>
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
