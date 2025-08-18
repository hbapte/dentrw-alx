/* eslint-disable react-refresh/only-export-components */
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface CalendarContextType {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  return <CalendarContext.Provider value={{ currentDate, setCurrentDate }}>{children}</CalendarContext.Provider>
}

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendarContext must be used within a CalendarProvider")
  }
  return context
}
