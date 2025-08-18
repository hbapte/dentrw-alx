"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import DoctorService from "@/services/doctor.service"
import { DoctorFormModal } from "../doctor-form/doctor-form-modal"
import { DoctorsTable } from "./doctors-table"
import { DoctorsStatsCards } from "./doctors-stats-cards"
import type { Doctor } from "@/types/doctor.types"

export function AdminDoctorsPageComponent() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const data = await DoctorService.getAllDoctors({ limit: 100 })
      setDoctors(data)
    } catch (error) {
      console.error("Failed to fetch doctors:", error)
      toast.error("Failed to load doctors")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchDoctors()
      toast.success("Doctors data refreshed successfully")
    } catch (error) {
      console.error("Failed to refresh doctors data:", error)
      toast.error("Failed to refresh doctors data")
    } finally {
      setRefreshing(false)
    }
  }

  const handleEdit = (doctor: Doctor) => {
    // TODO: Implement edit functionality
    toast.success(`Edit ${doctor.user?.names} - Coming soon!`)
  }

  const handleDelete = async (doctorId: string) => {
    // TODO: Implement delete functionality
    toast.success(`Delete doctor ${doctorId} - Coming soon!`)
  }

  if (loading && doctors.length === 0) {
    return (
      <div className="container mx-auto space-y-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctors Management</h1>
            <p className="text-muted-foreground">Manage and monitor all doctors in your clinic</p>
          </div>
        </div>
        <DoctorsStatsCards doctors={[]} loading={true} />
        <Card>
          <CardHeader>
            <CardTitle>All Doctors</CardTitle>
            <CardDescription>Complete list of all registered doctors with management capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          <h1 className="text-3xl font-bold">Doctors Management</h1>
          <p className="text-muted-foreground">Manage and monitor all doctors in your clinic</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DoctorsStatsCards doctors={doctors} loading={loading} />

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Doctors</CardTitle>
          <CardDescription>Complete list of all registered doctors with management capabilities</CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <DoctorsTable
            doctors={doctors}
            loading={loading}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <DoctorFormModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
