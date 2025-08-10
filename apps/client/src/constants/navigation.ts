import type React from "react"
import { Calendar, Users, User, Home, UserPlus, Book, CreditCard, BarChart3, Settings } from "lucide-react"

export interface NavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  roles: string[]
  badge?: string
}

export interface NavigationCategory {
  name: string
  items: NavigationItem[]
}

export const NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    name: "Main",
    items: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: Home,
        roles: ["admin","receptionist", "doctor", "patient"],
      },
    ],
  },
  {
    name: "Management",
    items: [
      {
        path: "/patients",
        label: "Patients",
        icon: Users,
        roles: ["admin","receptionist", "doctor", "patient"],
        badge: "24",
      },
      {
        path: "/doctors",
        label: "Doctors",
        icon: UserPlus,
        roles: ["admin"],
        badge: "8",
      },
  
      {
        path: "/appointments",
        label: "Appointments",
        icon: Calendar,
        roles: ["admin", "receptionist", "doctor", "patient"],
        badge: "12",
      },

      {
        path: "/medical-records",
        label: "Medical Records",
        icon: Book,
        roles: ["admin", "doctor"],
      },
      {
        path: "/payments",
        label: "Payments",
        icon: CreditCard,
        roles: ["admin",  "doctor", "doctor", "patient"],
      },
    ],
  },
  {
    name: "Analytics",
    items: [
      {
        path: "/payments/stats",
        label: "Payment Stats",
        icon: BarChart3,
        roles: ["admin"],
      },
    ],
  },
  
]

export const FOOTER_NAVIGATION: NavigationItem[] = [
  {
    path: "/profile",
    label: "Profile",
    icon: User,
    roles: ["admin", "doctor", "patient"],
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "doctor", "patient"],
  },
]

export const THEME_CONFIG = {
  STORAGE_KEY: "darkMode",
  DARK_CLASS: "dark",
} as const

export const SIDEBAR_CONFIG = {
  WIDTH: "12rem",
  COLLAPSED_WIDTH: "2rem",
} as const
