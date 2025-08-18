/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import PatientService from "../services/patient.service"
import type { Patient } from "../types/patient.types"

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  const fetchPatients = useCallback(
    async (params?: {
      page?: number
      limit?: number
      search?: string
      gender?: "male" | "female" | "other"
      sortBy?: string
      sortOrder?: "asc" | "desc"
    }) => {
      try {
        setLoading(true)
        setError(null)

        const response = await PatientService.getAllPatients({
          page: params?.page || 1,
          limit: params?.limit || 50,
          search: params?.search,
          gender: params?.gender,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc",
        })

        setPatients(response.patients)
        setPagination(response.pagination)
      } catch (err) {
        console.error("Failed to fetch patients:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch patients")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const refetch = useCallback(() => {
    return fetchPatients()
  }, [fetchPatients])

  const deletePatient = useCallback(async (patientId: string) => {
    try {
      await PatientService.deletePatient(patientId)
      setPatients((prev) => prev.filter((patient) => patient._id !== patientId))
    } catch (err) {
      console.error("Failed to delete patient:", err)
      throw err
    }
  }, [])

  const updatePatient = useCallback(async (patientId: string, data: any) => {
    try {
      const updatedPatient = await PatientService.updatePatient(patientId, data)
      setPatients((prev) => prev.map((patient) => (patient._id === patientId ? updatedPatient : patient)))
    } catch (err) {
      console.error("Failed to update patient:", err)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return {
    patients,
    loading,
    error,
    pagination,
    refetch,
    deletePatient,
    updatePatient,
    fetchPatients,
  }
}
