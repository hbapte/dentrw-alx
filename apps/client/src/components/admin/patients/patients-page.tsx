"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"
import { usePatients } from "../../../hooks/use-patients"
import { PatientsStatsCards } from "./patients-stats-cards"
import PatientsTable from "./patients-table"
import { toast } from "sonner"


export default function AdminPatientsPageComponent() {
  const { patients, loading, error, refetch } = usePatients()
  const [refreshing, setRefreshing] = useState(false)
  

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success("Patients data refreshed successfully")
    } catch (error) {
      console.error("Failed to refresh patients data:", error)
      toast.error("Failed to refresh patients data")
    } finally {
      setRefreshing(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Failed to load patients: {error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 py-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">Manage and monitor all patient records in your dental clinic</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              toast.success("Add patient functionality coming soon!")
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <PatientsStatsCards patients={patients} loading={loading} />

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            Complete list of all registered patients with comprehensive medical information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <PatientsTable />
        </CardContent>
      </Card>
    </div>
  )
}
