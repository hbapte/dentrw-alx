"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Search, Moon, Sun, Settings, User, LogOut } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { NAVIGATION_CATEGORIES } from "@/constants/navigation"
import { useAuthStore } from "@/store/auth-store"


export function CommandSearch() {
  const [open, setOpen] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(isDarkMode)
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
    setOpen(false)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
    setOpen(false)
  }

  // Get all navigation items that user has access to
  const availablePages = React.useMemo(() => {
    const pages: Array<{ label: string; path: string; icon: React.ComponentType; category: string }> = []

    NAVIGATION_CATEGORIES.forEach((category) => {
      category.items.forEach((item) => {
        if (user?.role && item.roles.includes(user.role)) {
          pages.push({
            label: item.label,
            path: item.path,
            icon: item.icon,
            category: category.name,
          })
        }
      })
    })

    return pages
  }, [user?.role])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-8 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <span className="sr-only xl:not-sr-only xl:ml-auto xl:text-xs xl:text-muted-foreground">⌘K</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation Pages */}
          <CommandGroup heading="Pages">
            {availablePages.map((page) => (
              <CommandItem
                key={page.path}
                value={`${page.label} ${page.category}`}
                onSelect={() => handleNavigation(page.path)}
              >
                <page.icon />
                <span>{page.label}</span>
                <CommandShortcut>{page.category}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Theme Settings */}
          <CommandGroup heading="Theme">
            <CommandItem onSelect={toggleDarkMode}>
              {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>Toggle {darkMode ? "Light" : "Dark"} Mode</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleNavigation("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
