"use client"

import { Badge } from "../ui/badge"

import type React from "react"
import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Label } from "../ui/label"
import { Calendar } from "../ui/calendar"
import { format } from "date-fns"
import type { PaymentFilterParams } from "../../types/payment.types"

interface PaymentFiltersProps {
  filters: PaymentFilterParams
  onFilterChange: (filters: Partial<PaymentFilterParams>) => void
  onResetFilters: () => void
  onSearch: () => void
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({ filters, onFilterChange, onResetFilters, onSearch }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined)

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      onFilterChange({ startDate: format(date, "yyyy-MM-dd") })
    } else {
      const newFilters = { ...filters }
      delete newFilters.startDate
      onFilterChange(newFilters)
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      onFilterChange({ endDate: format(date, "yyyy-MM-dd") })
    } else {
      const newFilters = { ...filters }
      delete newFilters.endDate
      onFilterChange(newFilters)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by patient name, ID, or transaction ID..."
              className="pl-9"
              value={filters.patientId || ""}
              onChange={(e) => onFilterChange({ patientId: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Filter Payments</h3>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || ""}
                    onValueChange={(value) => onFilterChange({ status: (value as any) || undefined })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={filters.paymentMethod || ""}
                    onValueChange={(value) => onFilterChange({ paymentMethod: (value as any) || undefined })}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All methods</SelectItem>
                      <SelectItem value="stripe">Credit Card</SelectItem>
                      <SelectItem value="MoMo">Mobile Money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount || ""}
                      onChange={(e) =>
                        onFilterChange({ minAmount: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount || ""}
                      onChange={(e) =>
                        onFilterChange({ maxAmount: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="startDate" className="text-xs">
                        Start Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-xs">
                        End Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={onResetFilters}>
                    Reset
                  </Button>
                  <Button onClick={onSearch}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {Object.keys(filters).length > 2 && (
            <Button variant="ghost" onClick={onResetFilters} className="flex items-center gap-1">
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {Object.keys(filters).length > 2 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.status && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters }
                  delete newFilters.status
                  onFilterChange(newFilters)
                }}
              />
            </Badge>
          )}
          {filters.paymentMethod && (
            <Badge variant="outline" className="flex items-center gap-1">
              Method: {filters.paymentMethod}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters }
                  delete newFilters.paymentMethod
                  onFilterChange(newFilters)
                }}
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              From: {format(new Date(filters.startDate), "PP")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters }
                  delete newFilters.startDate
                  setStartDate(undefined)
                  onFilterChange(newFilters)
                }}
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              To: {format(new Date(filters.endDate), "PP")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters }
                  delete newFilters.endDate
                  setEndDate(undefined)
                  onFilterChange(newFilters)
                }}
              />
            </Badge>
          )}
          {filters.minAmount && (
            <Badge variant="outline" className="flex items-center gap-1">
              Min: {filters.minAmount}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters }
                  delete newFilters.minAmount
                  onFilterChange(newFilters)
                }}
              />
            </Badge>
          )}
          {filters.maxAmount && (
            <Badge variant="outline" className="flex items-center gap-1">
              Max: {filters.maxAmount}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters }
                  delete newFilters.maxAmount
                  onFilterChange(newFilters)
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default PaymentFilters
