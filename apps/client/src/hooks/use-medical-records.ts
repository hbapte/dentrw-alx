// client\src\hooks\use-medical-records.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import MedicalRecordService from "../services/medical-record.service"
import type { MedicalRecord, MedicalRecordFilters, MedicalRecordStats } from "../types/medical-record.types"

export function useMedicalRecords(initialFilters: MedicalRecordFilters = {}) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MedicalRecordFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  const fetchRecords = useCallback(
    async (newFilters?: MedicalRecordFilters) => {
      try {
        setLoading(true)
        setError(null)

        const filtersToUse = newFilters || filters
        const response = await MedicalRecordService.getAllRecords(filtersToUse)

        setRecords(response.records)
        setPagination(response.pagination)
      } catch (err) {
        console.error("Failed to fetch medical records:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch medical records")
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )



  const updateRecord = useCallback(async (recordId: string, data: Partial<MedicalRecord>) => {
    try {
      const updatedRecord = await MedicalRecordService.updateRecord(recordId, data)
      setRecords((prev) => prev.map((record) => (record._id === recordId ? updatedRecord : record)))
      return updatedRecord
    } catch (err) {
      console.error("Failed to update medical record:", err)
      throw err
    }
  }, [])

  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      await MedicalRecordService.deleteRecord(recordId)
      setRecords((prev) => prev.filter((record) => record._id !== recordId))
    } catch (err) {
      console.error("Failed to delete medical record:", err)
      throw err
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchRecords()
  }, [fetchRecords])

  const updateFilters = useCallback(
    (newFilters: Partial<MedicalRecordFilters>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      fetchRecords(updatedFilters)
    },
    [filters, fetchRecords],
  )

  useEffect(() => {
    fetchRecords()
  }, [])

  return {
    records,
    loading,
    error,
    pagination,
    filters,
    updateRecord,
    deleteRecord,
    refetch,
    updateFilters,
  }
}

export function useMedicalRecordStats() {
  const [stats, setStats] = useState<MedicalRecordStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const statsData = await MedicalRecordService.getStatistics()
      setStats(statsData)
    } catch (err) {
      console.error("Failed to fetch medical record stats:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
