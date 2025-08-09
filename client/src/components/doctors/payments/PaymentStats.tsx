// client\src\components\payments\PaymentStats.tsx
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, CreditCard, Wallet, BanknoteIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { PaymentStatsApiResponse } from "../../../types/payment.types"


interface PaymentStatsProps {
  stats: PaymentStatsApiResponse
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Transform daily revenue data for the chart
  const dailyChartData = stats.dailyRevenue.map((item) => ({
    date: item._id,
    amount: item.total,
  }))

  // Create monthly data (this would ideally come from the API)
  // For now, we'll just use the daily data as a placeholder
  const monthlyChartData = stats.dailyRevenue.map((item) => ({
    month: item._id,
    amount: item.total,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-500">
              From {stats.statuses.completed.count} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.statuses.pending.amount)}</div>
            <p className="text-xs text-gray-500">From {stats.statuses.pending.count} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.statuses.refunded.amount)}</div>
            <p className="text-xs text-gray-500">From {stats.statuses.refunded.count} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{stats.paymentMethods.stripe?.count || 0}</span>
              
              {stats.paymentMethods.MoMo && (
                <>
                  <Wallet className="h-4 w-4 text-pink-500 ml-2" />
                  <span className="text-sm">{stats.paymentMethods.MoMo.count}</span>
                </>
              )}
              
              {stats.paymentMethods.cash && (
                <>
                  <BanknoteIcon className="h-4 w-4 text-green-500 ml-2" />
                  <span className="text-sm">{stats.paymentMethods.cash.count}</span>
                </>
              )}
              
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="amount" fill="#4f46e5" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="monthly">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="amount" fill="#4f46e5" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentStats
