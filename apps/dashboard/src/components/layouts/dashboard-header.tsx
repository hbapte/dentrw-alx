"use client"

import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/auth-store"
import { Bell, HelpCircle, Settings, User, Globe, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useState } from "react"
import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "../ui/separator"

import { CommandSearch } from "./command-search"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { Loader } from "../common/loader"
import { toast } from "sonner"
import Clock from "./clock"

export function DashboardHeader() {
  const { user } = useAuthStore()
  const breadcrumbs = useBreadcrumbs()
  const [notifications] = useState(3)
  const { logout, loading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  const getLanguageLabel = (lang: string) => {
    const languages = {
      en: "English",
      fr: "Français",
      rw: "Kinyarwanda",
    }
    return languages[lang as keyof typeof languages] || lang
  }

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrator",
      doctor: "Doctor",
      patient: "Patient",
    }
    return roles[role as keyof typeof roles] || role
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b  dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {breadcrumb.isCurrentPage ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Command Search */}
          <CommandSearch />

          {/* Clock */}
          <Clock />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{notifications}</Badge>
            )}
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 !rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {user?.names
                    ? user.names
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                    : "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user?.names
                        ? user.names
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "U"}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">{user?.names || "User"}</p>
                       <div className="flex mt-1 text-xs leading-none text-muted-foreground">
                      <p className=" ">@{user?.username || "username"}</p>&nbsp; {" | "} &nbsp; <span> {user?.phoneNumber || "123-456-7890"}</span>
                      </div>

                      <div className="text-xs leading-none text-muted-foreground mt-1 flex items-center space-x-1">
                      <span></span>
                      <span>{user?.email || "user@dentrw.com"}</span>
                    </div> 
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {getRoleLabel(user?.role || "user")}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{getLanguageLabel(user?.preferredLanguage || "en")}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    
                    {/* {user?.phoneNumber && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )} */}
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="p-0">
                <Button variant={"ghost"} onClick={handleLogout}
                disabled={loading}
                className="w-full hover:cursor-pointer justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="h-4 w-4 " />
                  {loading ? "Logging out..." : "Logout"}
                  {loading && <Loader className="ml-auto h-4 w-4 animate-spin" />}
                </Button>

              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}
