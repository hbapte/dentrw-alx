// client\src\components\doctors\medical-records\medical-records-page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, FileText } from "lucide-react"
import { useMedicalRecords } from "@/hooks/use-medical-records"
import { MedicalRecordsStatsCards } from "./medical-records-stats-cards"
import MedicalRecordsTable from "./medical-records-table"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"

export default function DoctorMedicalRecordsPageComponent() {
  const { user } = useAuthStore()
  const doctorId = user?.doctorId || ""

  // Pass doctorId as initial filter to the hook
  const { records, loading, error, refetch } = useMedicalRecords({
    doctorId: doctorId
  })
  
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success("Medical records data refreshed successfully")
    } catch (error) {
      console.error("Failed to refresh medical records data:", error)
      toast.error("Failed to refresh medical records data")
    } finally {
      setRefreshing(false)
    }
  }

  // Show loading state when doctorId is not yet available
  if (!doctorId && !error) {
    return (
      <div className="container mx-auto ">
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Loading doctor information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto ">
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Failed to load medical records: {error}</p>
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
    <div className="container mx-auto space-y-8 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">
            Comprehensive medical records management for your patient visits and treatments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              toast.success("Add medical record functionality coming soon!")
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <MedicalRecordsStatsCards 
        records={records} 
        loading={loading} 
      />

      {/* Medical Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Medical Records
          </CardTitle>
          <CardDescription>Complete medical history and treatment records for your patients</CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <MedicalRecordsTable />
        </CardContent>
      </Card>
    </div>
  )
}