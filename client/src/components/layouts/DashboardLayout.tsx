"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import {
  Calendar,
  Users,
  User,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
  UserPlus,
  Activity,
  Book,
  CreditCard,
  BarChart3,
  Bell,
  Search,
  ChevronDown,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react"

const DashboardLayout = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check if user prefers dark mode
    const isDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  // Navigation categories
  const categories = [
    {
      name: "Main",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: <Home size={20} />, roles: ["admin", "doctor", "patient"] },
      ],
    },
    {
      name: "Management",
      items: [
        { path: "/patients", label: "Patients", icon: <Users size={20} />, roles: ["admin", "doctor", "patient"] },
        { path: "/doctors", label: "Doctors", icon: <UserPlus size={20} />, roles: ["admin"] },
        {
          path: "/appointments",
          label: "Appointments",
          icon: <Calendar size={20} />,
          roles: ["admin", "doctor", "patient"],
        },
        { path: "/medical-records", label: "Medical Records", icon: <Book size={20} />, roles: ["admin", "doctor"] },
        { path: "/payments", label: "Payments", icon: <CreditCard size={20} />, roles: ["admin", "doctor", "patient"] },
      ],
    },
    {
      name: "Analytics",
      items: [
        { path: "/payments/stats", label: "Payment Stats", icon: <BarChart3 size={20} />, roles: ["admin", "doctor"] },
      ],
    },
  ]

  return (
    <div className={`flex h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
      >
        <div
          className={`flex h-16 items-center justify-between px-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <Link to="/dashboard" className="flex items-center">
            <Activity className={`h-8 w-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <span className={`ml-2 text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>dentRW</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className={darkMode ? "text-gray-300" : "text-gray-500"} />
          </button>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
          <nav className="px-4 space-y-6">
            {categories.map((category, idx) => {
              // Filter items based on user role
              const filteredItems = category.items.filter((item) => user?.role && item.roles.includes(user.role))

              // Skip rendering the category if there are no items for this user's role
              if (filteredItems.length === 0) return null

              return (
                <div key={idx} className="space-y-2">
                  <h3
                    className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {category.name}
                  </h3>
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive(item.path)
                            ? darkMode
                              ? "bg-blue-900/50 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                            : darkMode
                              ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`mr-3 ${isActive(item.path) ? (darkMode ? "text-blue-300" : "text-blue-700") : ""}`}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="mt-6 px-4">
            <div className={`pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive("/profile")
                      ? darkMode
                        ? "bg-blue-900/50 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User size={20} className="mr-3" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive("/settings")
                      ? darkMode
                        ? "bg-blue-900/50 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className={`flex w-full items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {darkMode ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className={`z-10 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b`}>
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                className={`mr-4 ${darkMode ? "text-gray-300" : "text-gray-500"} lg:hidden`}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>

              {/* Search bar */}
              <div
                className={`hidden md:flex items-center ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-md px-3 py-1.5`}
              >
                <Search size={18} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`ml-2 bg-transparent border-none outline-none text-sm w-64 ${darkMode ? "text-white placeholder:text-gray-400" : "text-gray-800 placeholder:text-gray-500"}`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className={`relative p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                <Bell size={20} className={darkMode ? "text-gray-300" : "text-gray-600"} />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Help */}
              <button className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                <HelpCircle size={20} className={darkMode ? "text-gray-300" : "text-gray-600"} />
              </button>

              {/* User menu */}
              <div className="relative">
                <div
                  className={`flex items-center space-x-2 cursor-pointer p-1 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <div
                    className={`h-8 w-8 rounded-full ${darkMode ? "bg-blue-500" : "bg-blue-600"} flex items-center justify-center text-white`}
                  >
                    {user?.names ? user.names.charAt(0) : "U"}
                  </div>
                  <span
                    className={`hidden md:block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                  >
                    {user?.names || "User"}
                  </span>
                  <ChevronDown size={16} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main
          className={`flex-1 overflow-auto p-4 md:p-6 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
