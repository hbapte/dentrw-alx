// client\src\components\event-calendar\index.ts
"use client"

// Component exports
export { AgendaView } from "../patient/agenda-view"
export { DayView } from "../patient/day-view"
export { DraggableEvent } from "../patient/draggable-event"
export { DroppableCell } from "../patient/droppable-cell"
export { EventDialog } from "./event-dialog" // Add this back
export { EventItem } from "../patient/event-item"
export { EventsPopup } from "../patient/events-popup"
export { EventCalendar } from "./event-calendar"
export { MonthView } from "../patient/month-view"
export { WeekView } from "../patient/week-view"
export { CalendarDndProvider, useCalendarDnd } from "./calendar-dnd-context"

// Constants and utility exports
export * from "../constants"
export * from "../utils"

// Hook exports
export * from "../hooks/use-current-time-indicator"
export * from "../hooks/use-event-visibility"

// Type exports
export type { CalendarEvent, CalendarView, EventColor } from "./types"
