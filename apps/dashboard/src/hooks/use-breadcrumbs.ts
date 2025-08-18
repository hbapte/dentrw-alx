"use client"

import { useLocation } from "react-router-dom"
import { useMemo } from "react"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage?: boolean
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  doctors: "Doctors",
  appointments: "Appointments",
  "medical-records": "Medical Records",
  payments: "Payments",
  stats: "Statistics",
  profile: "Profile",
  settings: "Settings",
  new: "New",
  edit: "Edit",
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation()

  return useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always add dashboard as root
    if (pathSegments[0] !== "dashboard") {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/dashboard",
      })
    }

    // Build breadcrumbs from path segments
    let currentPath = ""
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1

      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        isCurrentPage: isLast,
      })
    })

    return breadcrumbs
  }, [location.pathname])
}
