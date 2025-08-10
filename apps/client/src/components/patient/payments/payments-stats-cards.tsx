"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, DollarSign, TrendingUp, AlertCircle, RefreshCw, CheckCircle, Clock, XCircle } from "lucide-react"
import { formatCurrency } from "../../../utils/format-utils"
import type { PaymentStatsApiResponse } from "../../../types/payment.types"

interface PaymentStatsCardsProps {
  stats: PaymentStatsApiResponse | null
  loading?: boolean
}

export function PaymentStatsCards({ stats, loading }: PaymentStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No payment data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalPayments =
    stats.statuses.completed.count +
    stats.statuses.pending.count +
    stats.statuses.failed.count +
    stats.statuses.refunded.count

  const completionRate = totalPayments > 0 ? (stats.statuses.completed.count / totalPayments) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Average: {formatCurrency(stats.averagePaymentAmount)}</p>
        </CardContent>
      </Card>

      {/* Total Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPayments.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Success rate: {completionRate.toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Completed Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.statuses.completed.count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(stats.statuses.completed.amount)}</p>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.statuses.pending.count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(stats.statuses.pending.amount)}</p>
        </CardContent>
      </Card>

      {/* Failed Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.statuses.failed.count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(stats.statuses.failed.amount)}</p>
        </CardContent>
      </Card>

      {/* Refunded Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Refunded</CardTitle>
          <RefreshCw className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.statuses.refunded.count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(stats.refundStats.totalRefunded)}</p>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.paymentMethods).map(([method, data]) => (
              <div key={method} className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {method === "mobile-money" ? "MoMo" : method.charAt(0).toUpperCase() + method.slice(1)}
                </Badge>
                <span className="text-sm font-medium">{data.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Revenue Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.dailyRevenue.length > 0
              ? formatCurrency(stats.dailyRevenue.reduce((sum, day) => sum + day.total, 0) / stats.dailyRevenue.length)
              : formatCurrency(0)}
          </div>
          <p className="text-xs text-muted-foreground">{stats.dailyRevenue.length} days tracked</p>
        </CardContent>
      </Card>
    </div>
  )
}
