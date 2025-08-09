"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Star, Clock, TrendingUp, Activity } from "lucide-react"
import type { Doctor } from "@/types/doctor.types"

interface DoctorsStatsCardsProps {
  doctors: Doctor[]
  loading?: boolean
}

export function DoctorsStatsCards({ doctors, loading }: DoctorsStatsCardsProps) {
  if (loading) {
    return <DoctorsStatsCardsSkeleton />
  }

  const totalDoctors = doctors.length
  const activeDoctors = doctors.filter((d) => d.isActive).length
  const verifiedDoctors = doctors.filter((d) => d.isVerified).length
  const averageRating = doctors.reduce((acc, d) => acc + d.averageRating, 0) / totalDoctors || 0

  // Calculate total patients across all doctors
  const totalPatients = doctors.reduce((acc, d) => acc + d.statistics.totalPatients, 0)
  const totalAppointments = doctors.reduce((acc, d) => acc + d.statistics.totalAppointments, 0)

  // Calculate average consultation fee
  const averageConsultationFee = doctors.reduce((acc, d) => acc + d.consultationFee.initial, 0) / totalDoctors || 0

  // Recent activity (doctors created in last 30 days)
  const recentDoctors = doctors.filter((d) => {
    const createdAt = new Date(d.createdAt)
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    return createdAt > monthAgo
  }).length

  // Employment type distribution
  const fullTimeDoctors = doctors.filter((d) => {
    const workingDaysCount = d.workingHours.filter((wh) => wh.isWorking).length
    return workingDaysCount >= 5
  }).length
  const partTimeDoctors = totalDoctors - fullTimeDoctors

  const stats = [
    {
      title: "Total Doctors",
      value: totalDoctors.toLocaleString(),
      description: "All registered doctors",
      icon: Users,
      trend: recentDoctors > 0 ? `+${recentDoctors} this month` : "No new doctors this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Doctors",
      value: activeDoctors.toLocaleString(),
      description: `${((activeDoctors / totalDoctors) * 100).toFixed(1)}% of total`,
      icon: UserCheck,
      trend: `${verifiedDoctors} verified doctors`,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      description: "Overall doctor rating",
      icon: Star,
      trend: `Based on ${doctors.reduce((acc, d) => acc + d.totalReviews, 0)} reviews`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Total Patients",
      value: totalPatients.toLocaleString(),
      description: "Across all doctors",
      icon: Activity,
      trend: `${totalAppointments} total appointments`,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  const specializations = doctors.reduce(
    (acc, doctor) => {
      doctor.specialization.forEach((spec) => {
        acc[spec] = (acc[spec] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const topSpecializations = Object.entries(specializations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-md p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground text-xs">{stat.description}</p>
              <div className="flex items-center pt-1">
                <TrendingUp className="text-muted-foreground mr-1 h-3 w-3" />
                <span className="text-muted-foreground text-xs">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Specializations & Employment Type */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Specializations
            </CardTitle>
            <CardDescription>Most common doctor specializations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSpecializations.map(([specialization, count]) => (
              <div key={specialization} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{specialization}</Badge>
                  <span className="text-muted-foreground text-sm">{((count / totalDoctors) * 100).toFixed(1)}%</span>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Employment & Fees
            </CardTitle>
            <CardDescription>Employment distribution and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Full-time doctors</span>
              <Badge className="bg-blue-100 text-blue-800">{fullTimeDoctors}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Part-time doctors</span>
              <Badge className="bg-orange-100 text-orange-800">{partTimeDoctors}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average consultation fee</span>
              <Badge variant="outline">
                {new Intl.NumberFormat("en-RW", {
                  style: "currency",
                  currency: "RWF",
                  minimumFractionDigits: 0,
                }).format(averageConsultationFee)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Verified doctors</span>
              <Badge variant={verifiedDoctors === totalDoctors ? "default" : "secondary"}>
                {verifiedDoctors}/{totalDoctors}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DoctorsStatsCardsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-16 animate-pulse rounded" />
              <div className="bg-muted mb-2 h-3 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="bg-muted h-5 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-40 animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-8 animate-pulse rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
