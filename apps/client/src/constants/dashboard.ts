export const DASHBOARD_STATS = [
  {
    title: "Today's Appointments",
    value: "12",
    change: "+2 from yesterday",
    icon: "Calendar",
  },
  {
    title: "Total Patients",
    value: "1,234",
    change: "+15 this month",
    icon: "Users",
  },
  {
    title: "Revenue",
    value: "$12,345",
    change: "+8% from last month",
    icon: "DollarSign",
  },
  {
    title: "Active Treatments",
    value: "89",
    change: "+12 this week",
    icon: "Activity",
  },
] as const

export const RECENT_APPOINTMENTS = [
  {
    time: "09:00 AM",
    patient: "John Doe",
    treatment: "Cleaning",
    status: "confirmed" as const,
  },
  {
    time: "10:30 AM",
    patient: "Jane Smith",
    treatment: "Root Canal",
    status: "in-progress" as const,
  },
  {
    time: "02:00 PM",
    patient: "Mike Johnson",
    treatment: "Checkup",
    status: "pending" as const,
  },
  {
    time: "03:30 PM",
    patient: "Sarah Wilson",
    treatment: "Filling",
    status: "confirmed" as const,
  },
] as const

export const QUICK_ACTIONS = [
  {
    label: "Add New Patient",
    icon: "Users",
    path: "/patients/new",
  },
  {
    label: "Schedule Appointment",
    icon: "Calendar",
    path: "/appointments/new",
  },
  {
    label: "View Medical Records",
    icon: "Activity",
    path: "/medical-records",
  },
  {
    label: "Generate Report",
    icon: "TrendingUp",
    path: "/reports",
  },
] as const
