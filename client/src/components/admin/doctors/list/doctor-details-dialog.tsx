"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  Calendar,
  Star,
  Users,
  Clock,
  DollarSign,
  Shield,
  Award,
  Building,
  Globe,
  Stethoscope,
} from "lucide-react"
import type { Doctor } from "@/types/doctor.types"

interface DoctorDetailsDialogProps {
  doctor: Doctor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorDetailsDialog({ doctor, open, onOpenChange }: DoctorDetailsDialogProps) {
  const formatCurrency = (amount: number, currency = "RWF") => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "N/A"
    return phone.replace(/^\+?(\d{3})(\d{3})(\d{4})(\d{2})/, "$1 $2-$3")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.user.picture || "/placeholder.svg"} alt={doctor.user.names} />
              <AvatarFallback>
                {doctor.user.names
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{doctor.user.names}</h2>
              <p className="text-sm text-gray-500">{doctor.specialization.join(", ")}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{doctor.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formatPhoneNumber(doctor.user.phoneNumber)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{doctor.experience} years of experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm">License: {doctor.licenseNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Registration: {doctor.registrationNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Statistics & Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Patients</span>
                <Badge variant="outline">{doctor.statistics.totalPatients}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Appointments</span>
                <Badge variant="outline">{doctor.statistics.totalAppointments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed Treatments</span>
                <Badge variant="outline">{doctor.statistics.completedTreatments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : "N/A"}
                  </span>
                  <span className="text-xs text-gray-500">({doctor.totalReviews} reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Consultation Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Initial Consultation</span>
                <Badge className="bg-green-100 text-green-800">
                  {formatCurrency(doctor.consultationFee.initial, doctor.consultationFee.currency)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Follow-up</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {formatCurrency(doctor.consultationFee.followUp, doctor.consultationFee.currency)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency</span>
                <Badge className="bg-red-100 text-red-800">
                  {formatCurrency(doctor.consultationFee.emergency, doctor.consultationFee.currency)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Languages & Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Languages & Specialties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {doctor.languages.map((language, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Dental Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {doctor.dentalSpecialties.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Working Hours */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctor.workingHours.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{day.day}</span>
                  {day.isWorking ? (
                    <div className="text-sm text-green-600">
                      {day.slots.map((slot, slotIdx) => (
                        <div key={slotIdx}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Qualifications */}
        {doctor.qualifications.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctor.qualifications.map((qualification, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{qualification.degree}</h4>
                      <p className="text-sm text-gray-500">
                        {qualification.institution}, {qualification.country}
                      </p>
                    </div>
                    <Badge variant="outline">{qualification.year}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        {doctor.bio && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{doctor.bio}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
