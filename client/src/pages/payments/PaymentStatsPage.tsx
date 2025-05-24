// client\src\pages\payments\PaymentStatsPage.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar } from "../../components/ui/calendar"
import { Button } from "../../components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { usePaymentStore } from "../../store/payment-store"
import PaymentStats from "../../components/payments/PaymentStats"
import PageHeader from "../../components/ui/page-header"

const PaymentStatsPage: React.FC = () => {
  const { paymentStats, loading, error, fetchPaymentStats } = usePaymentStore()
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetchPaymentStats(
      startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    )
  }, [fetchPaymentStats, startDate, endDate])

  const handleDateRangeChange = (type: "start" | "end", date: Date | undefined) => {
    if (type === "start") {
      setStartDate(date)
    } else {
      setEndDate(date)
    }
  }

  const handleResetDates = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Payment Statistics"
        description="View payment statistics and trends"
        actions={
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{startDate ? format(startDate, "PPP") : "Start Date"}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateRangeChange("start", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{endDate ? format(endDate, "PPP") : "End Date"}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateRangeChange("end", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {(startDate || endDate) && (
              <Button variant="ghost" onClick={handleResetDates}>
                Reset
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      ) : paymentStats ? (
        <PaymentStats stats={paymentStats} />
      ) : (
        <div className="text-center py-8 text-gray-500">No statistics available</div>
      )}
    </div>
  )
}

export default PaymentStatsPage
