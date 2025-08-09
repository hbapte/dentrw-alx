"use client"

import { CalendarProvider } from "@/components/appointment-calendar/event-calendar/calendar-context"
import { DentalCalendar } from "./dental-calendar"

export function DentalCalendarApp() {
  return (
    <CalendarProvider>
      <div className="h-screen flex flex-col">
        <DentalCalendar />
      </div>
    </CalendarProvider>
  )
}

export { DentalCalendar } from "./dental-calendar"

