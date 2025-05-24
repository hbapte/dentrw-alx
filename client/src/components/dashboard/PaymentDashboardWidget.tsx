"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { CreditCard, ArrowRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
// import { useAuthStore } from "../../store/auth-store"

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  pendingAmount: number
  recentPayments: {
    _id: string
    amount: number
    status: string
    createdAt: string
    patient: {
      _id: string
      names: string
    }
  }[]
}

const PaymentDashboardWidget = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  // const { user } = useAuthStore()

  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        // This would be replaced with an actual API call
        // const response = await paymentService.getPaymentStats()
        // setStats(response.data)

        // Mock data for demonstration
        setStats({
          totalPayments: 128,
          totalAmount: 12500000,
          pendingAmount: 2300000,
          recentPayments: [
            {
              _id: "1",
              amount: 150000,
              status: "completed",
              createdAt: new Date().toISOString(),
              patient: {
                _id: "p1",
                names: "John Doe",
              },
            },
            {
              _id: "2",
              amount: 85000,
              status: "pending",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              patient: {
                _id: "p2",
                names: "Jane Smith",
              },
            },
            {
              _id: "3",
              amount: 200000,
              status: "completed",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              patient: {
                _id: "p3",
                names: "Robert Johnson",
              },
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching payment stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStats()
  }, [])

  // Format currency in RWF
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Payment Overview</h2>
          <CreditCard className="text-blue-500 dark:text-blue-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No payment data available</p>
      </div>
    )
  }

  const collectionRate =
    stats.totalAmount > 0 ? ((stats.totalAmount - stats.pendingAmount) / stats.totalAmount) * 100 : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Payment Overview</h2>
          <CreditCard className="text-blue-500 dark:text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300">Total Collected</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(stats.totalAmount - stats.pendingAmount)}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">{collectionRate.toFixed(1)}% collection rate</span>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-300">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
                <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-amber-600 dark:text-amber-300">
                {stats.totalPayments} total transactions
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Payments</h3>
        <div className="space-y-3">
          {stats.recentPayments.map((payment) => (
            <div
              key={payment._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{payment.patient.names}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.createdAt)}</p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full mr-2 ${
                    payment.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}
                >
                  {payment.status}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <Link
            to="/payments"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View all payments
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentDashboardWidget
