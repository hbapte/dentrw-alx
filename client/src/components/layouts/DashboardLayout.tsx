"use client"

import type React from "react"
import { useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Calendar, Users, User, FileText, Home, Menu, X, LogOut, Settings, UserPlus, Activity,Book } from "lucide-react"

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/patients", label: "Patients", icon: <Users size={20} /> },
    { path: "/doctors", label: "Doctors", icon: <Users size={20} /> },
    { path: "/appointments", label: "Appointments", icon: <Calendar size={20} /> },
    { path: "/medical-records", label: "Medical Records", icon: <Book size={20} /> },
    

  ]

  // Add conditional nav items based on user role
  if (user?.role === "admin" || user?.role === "doctor") {
    navItems.push({
      path: "/medical-records",
      label: "Medical Records",
      icon: <FileText size={20} />,
    })
  }

  if (user?.role === "admin") {
    navItems.push({
      path: "/doctors",
      label: "Doctors",
      icon: <UserPlus size={20} />,
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link to="/dashboard" className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">dentRW</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 space-y-1">
            <Link
              to="/profile"
              className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                isActive("/profile") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User size={20} />
              <span className="ml-3">Profile</span>
            </Link>
            <Link
              to="/settings"
              className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                isActive("/settings") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={20} />
              <span className="ml-3">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <button className="text-gray-500 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
