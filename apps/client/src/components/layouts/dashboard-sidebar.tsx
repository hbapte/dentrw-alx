"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { Moon, Sun, Activity } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { FOOTER_NAVIGATION, NAVIGATION_CATEGORIES, THEME_CONFIG } from "../../constants/navigation"
import { LogoutButton } from "../auth/logout-button"
import { Separator } from "../ui/separator"

export function AppSidebar() {
  const { user } = useAuthStore()
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDarkMode = localStorage.getItem(THEME_CONFIG.STORAGE_KEY) === "true"
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add(THEME_CONFIG.DARK_CLASS)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add(THEME_CONFIG.DARK_CLASS)
    } else {
      document.documentElement.classList.remove(THEME_CONFIG.DARK_CLASS)
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">DentRW</span>
                  <span className="truncate text-xs">Dental Clinic</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-2">
          {NAVIGATION_CATEGORIES.map((category) => {
            const filteredItems = category.items.filter((item) => user?.role && item.roles.includes(user.role))

            if (filteredItems.length === 0) return null

            return (
              <SidebarGroup key={category.name}>
                <SidebarGroupLabel>{category.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                          <Link to={item.path}>
                            <item.icon />
                            <span>{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          })}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-border/100">

        <SidebarMenu>
          {FOOTER_NAVIGATION.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                <Link to={item.path}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleDarkMode} tooltip={darkMode ? "Light Mode" : "Dark Mode"}>
              {darkMode ? <Sun /> : <Moon />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />
          <SidebarMenuItem>
            <LogoutButton className="text-red-500" />
           
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
