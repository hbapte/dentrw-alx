"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "./dashboard-header"
import { AppSidebar } from "./dashboard-sidebar"

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
