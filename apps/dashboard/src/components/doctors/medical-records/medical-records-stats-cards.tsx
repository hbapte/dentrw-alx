"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Calendar, Clock, TrendingUp, Users, Stethoscope, Pill, AlertTriangle } from "lucide-react"
import type { MedicalRecord } from "../../../types/medical-record.types"

interface MedicalRecordsStatsCardsProps {
  records: MedicalRecord[]
  loading: boolean
}

export function MedicalRecordsStatsCards({ records, loading }: MedicalRecordsStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate statistics
  const totalRecords = records.length
  const followUpRequired = records.filter((record) => record.followUpRequired).length
  const recordsThisMonth = records.filter((record) => {
    const recordDate = new Date(record.createdAt)
    const now = new Date()
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
  }).length

  const emergencyRecords = records.filter((record) => record.appointment.type === "emergency").length

  // Calculate unique patients and doctors
  const uniquePatients = new Set(records.map((record) => record.patient._id)).size
  const uniqueDoctors = new Set(records.map((record) => record.doctor._id)).size

  // Calculate average records per day (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentRecords = records.filter((record) => new Date(record.createdAt) >= thirtyDaysAgo)
  const averagePerDay = Math.round((recentRecords.length / 30) * 10) / 10

  // Top diagnoses
  const diagnosisCount = records.reduce(
    (acc, record) => {
      acc[record.diagnosis] = (acc[record.diagnosis] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topDiagnosis = Object.entries(diagnosisCount).sort(([, a], [, b]) => b - a)[0]

  // Prescription statistics
  const totalPrescriptions = records.reduce((sum, record) => sum + record.prescription.length, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{recordsThisMonth} this month</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {uniquePatients} patients
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Stethoscope className="h-3 w-3 mr-1" />
              {uniqueDoctors} doctors
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups Required */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups Required</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{followUpRequired}</div>
          <p className="text-xs text-muted-foreground">
            {totalRecords > 0 ? Math.round((followUpRequired / totalRecords) * 100) : 0}% of total records
          </p>
          <div className="mt-2">
            <Badge variant={followUpRequired > 0 ? "destructive" : "default"} className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {followUpRequired > 0 ? "Action needed" : "Up to date"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Average Records/Day */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averagePerDay}</div>
          <p className="text-xs text-muted-foreground">records per day (30 days)</p>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {emergencyRecords} emergency
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top Diagnosis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Common</CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPrescriptions}</div>
          <p className="text-xs text-muted-foreground">total prescriptions</p>
          <div className="mt-2">
            {topDiagnosis && (
              <Badge variant="secondary" className="text-xs">
                {topDiagnosis[0]} ({topDiagnosis[1]})
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
