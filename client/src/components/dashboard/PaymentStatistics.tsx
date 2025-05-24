"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import paymentService from "../../services/payment.service"
import type { PaymentStatsApiResponse } from "../../types/payment.types"

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const PaymentStatistics: React.FC = () => {
  const [stats, setStats] = useState<PaymentStatsApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await paymentService.getPaymentStats()
        setStats(response)
      } catch (error) {
        console.error("Error fetching payment stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-64 animate-pulse bg-gray-200 rounded-lg"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No payment statistics available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for payment method pie chart
  const paymentMethodData = Object.entries(stats.paymentMethods).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value.amount,
    count: value.count,
  }))

  // Prepare data for payment status pie chart
  const paymentStatusData = Object.entries(stats.statuses).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value.amount,
    count: value.count,
  }))

  // Prepare data for daily revenue chart
  const dailyRevenueData = stats.dailyRevenue.map((item) => ({
    date: item._id,
    amount: item.total,
    count: item.count,
  }))

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="statuses">Payment Statuses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Daily Revenue</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="amount" fill="#4f46e5" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-xl font-bold">{stats.statuses.completed.count}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-xl font-bold">{stats.statuses.pending.count}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Failed/Refunded</p>
                  <p className="text-xl font-bold">{stats.statuses.failed.count + stats.statuses.refunded.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethodData.map((method) => (
                  <div key={method.name} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">{method.name}</p>
                    <p className="text-xl font-bold">{formatCurrency(method.value)}</p>
                    <p className="text-xs text-gray-500">{method.count} transactions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Payment Statuses</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentStatusData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentStatusData.map((status) => (
                  <div
                    key={status.name}
                    className={`p-3 rounded-lg ${
                      status.name === "Completed"
                        ? "bg-green-50"
                        : status.name === "Pending"
                          ? "bg-yellow-50"
                          : status.name === "Failed"
                            ? "bg-red-50"
                            : "bg-gray-50"
                    }`}
                  >
                    <p className="text-sm text-gray-500">{status.name}</p>
                    <p className="text-xl font-bold">{formatCurrency(status.value)}</p>
                    <p className="text-xs text-gray-500">{status.count} transactions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PaymentStatistics
