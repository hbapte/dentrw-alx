"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Shield, Heart, TrendingUp, AlertTriangle } from "lucide-react"
import type { Patient } from "../../../types/patient.types"

interface PatientsStatsCardsProps {
  patients: Patient[]
  loading?: boolean
}

export function PatientsStatsCards({ patients, loading }: PatientsStatsCardsProps) {
  if (loading) {
    return <PatientsStatsCardsSkeleton />
  }

  const totalPatients = patients.length
  const activePatients = patients.filter((p) => p.user.active).length
  // const verifiedPatients = patients.filter((p) => p.user.emailVerified).length
  const insuredPatients = patients.filter((p) => p.insuranceInfo.hasInsurance).length

  // Gender distribution
  const malePatients = patients.filter((p) => p.gender === "male" || p.user.gender === "male").length
  const femalePatients = patients.filter((p) => p.gender === "female" || p.user.gender === "female").length

  // Risk assessment
  const highRiskPatients = patients.filter((p) => p.clinicalNotes?.riskAssessment === "high").length
  const moderateRiskPatients = patients.filter((p) => p.clinicalNotes?.riskAssessment === "moderate").length

  // Recent activity (patients created in last 7 days)
  const recentPatients = patients.filter((p) => {
    const createdAt = new Date(p.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdAt > weekAgo
  }).length

  // Patients with recent login (last 30 days)
  const recentlyActivePatients = patients.filter((p) => {
    if (!p.user.lastLogin) return false
    const lastLogin = new Date(p.user.lastLogin)
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    return lastLogin > monthAgo
  }).length

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients.toLocaleString(),
      description: "All registered patients",
      icon: Users,
      trend: recentPatients > 0 ? `+${recentPatients} this week` : "No new patients this week",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Patients",
      value: activePatients.toLocaleString(),
      description: `${((activePatients / totalPatients) * 100).toFixed(1)}% of total`,
      icon: UserCheck,
      trend: `${recentlyActivePatients} active this month`,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Insured Patients",
      value: insuredPatients.toLocaleString(),
      description: `${((insuredPatients / totalPatients) * 100).toFixed(1)}% have insurance`,
      icon: Shield,
      trend:
        insuredPatients === totalPatients ? "All patients insured" : `${totalPatients - insuredPatients} uninsured`,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "High Risk Patients",
      value: highRiskPatients.toLocaleString(),
      description: highRiskPatients > 0 ? "Requires attention" : "No high-risk patients",
      icon: AlertTriangle,
      trend: highRiskPatients > 0 ? "Review required" : "All good",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ]

  const genderStats = [
    {
      gender: "Male",
      count: malePatients,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      gender: "Female",
      count: femalePatients,
      color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    },
    {
      gender: "Other",
      count: totalPatients - malePatients - femalePatients,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    },
  ]

  const riskStats = [
    {
      risk: "High Risk",
      count: highRiskPatients,
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    {
      risk: "Moderate Risk",
      count: moderateRiskPatients,
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    {
      risk: "Low Risk",
      count: totalPatients - highRiskPatients - moderateRiskPatients,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
  ]

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

      {/* Demographics & Risk Assessment */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gender Distribution
            </CardTitle>
            <CardDescription>Patient demographics breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {genderStats.map((gender) => (
              <div key={gender.gender} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={gender.color}>{gender.gender}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {totalPatients > 0 ? ((gender.count / totalPatients) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <span className="font-medium">{gender.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Risk Assessment
            </CardTitle>
            <CardDescription>Patient risk levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskStats.map((risk) => (
              <div key={risk.risk} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={risk.color}>{risk.risk}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {totalPatients > 0 ? ((risk.count / totalPatients) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <span className="font-medium">{risk.count}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Insurance Coverage</span>
                <Badge variant="outline">
                  {totalPatients > 0 ? ((insuredPatients / totalPatients) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PatientsStatsCardsSkeleton() {
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
