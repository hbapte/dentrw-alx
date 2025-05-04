import { format, parseISO, isValid } from "date-fns"

export const formatDate = (date: string | Date, formatString = "MMM dd, yyyy"): string => {
  if (!date) return ""

  const dateObj = typeof date === "string" ? parseISO(date) : date

  if (!isValid(dateObj)) {
    return "Invalid date"
  }

  return format(dateObj, formatString)
}

export const formatTime = (time: string, formatString = "h:mm a"): string => {
  if (!time) return ""

  // Handle time strings like "14:30"
  if (time.includes(":")) {
    const [hours, minutes] = time.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))

    if (!isValid(date)) {
      return "Invalid time"
    }

    return format(date, formatString)
  }

  return "Invalid time format"
}

export const formatDateTime = (date: string | Date, time?: string): string => {
  if (!date) return ""

  let dateObj = typeof date === "string" ? parseISO(date) : date

  if (time && time.includes(":")) {
    const [hours, minutes] = time.split(":")
    dateObj = new Date(dateObj)
    dateObj.setHours(Number.parseInt(hours, 10))
    dateObj.setMinutes(Number.parseInt(minutes, 10))
  }

  if (!isValid(dateObj)) {
    return "Invalid date/time"
  }

  return format(dateObj, "MMM dd, yyyy h:mm a")
}
