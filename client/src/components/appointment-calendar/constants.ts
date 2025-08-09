export const EventHeight = 24;

// Vertical gap between events in pixels - controls spacing in month view
export const EventGap = 4;

// Height of hour cells in week and day views - controls the scale of time display
export const WeekCellsHeight = 72;

// Number of days to show in the agenda view
export const AgendaDaysToShow = 30;

// Start and end hours for the week and day views
export const StartHour = 7; // Start at 7 AM
export const EndHour = 20; // End at 8 PM

// Default start and end times
export const DefaultStartHour = 9; // 9 AM
export const DefaultEndHour = 10; // 10 AM


export const appointmentTypes = [
  { value: "consultation", label: "Consultation", description: "Initial consultation or assessment" },
  { value: "checkup", label: "Check-up", description: "Routine dental examination" },
  { value: "treatment", label: "Treatment", description: "Active dental treatment" },
  { value: "follow-up", label: "Follow-up", description: "Post-treatment follow-up visit" },
]

export const appointmentStatuses = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "confirmed", label: "Confirmed", color: "emerald" },
  { value: "completed", label: "Completed", color: "violet" },
  { value: "cancelled", label: "Cancelled", color: "rose" },
  { value: "no-show", label: "No Show", color: "orange" },
]