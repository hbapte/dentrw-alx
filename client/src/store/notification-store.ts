import { create } from "zustand"

type NotificationType = "success" | "error" | "warning" | "info"

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationState {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, "id">) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  dismissNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  showNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // Default 5 seconds
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto-dismiss after duration
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, newNotification.duration)
  },

  showSuccess: (message, duration = 5000) => {
    set((state) => {
      state.showNotification({
        type: "success",
        message,
        duration,
      })
      return state
    })
  },

  showError: (message, duration = 5000) => {
    set((state) => {
      state.showNotification({
        type: "error",
        message,
        duration,
      })
      return state
    })
  },

  showWarning: (message, duration = 5000) => {
    set((state) => {
      state.showNotification({
        type: "warning",
        message,
        duration,
      })
      return state
    })
  },

  showInfo: (message, duration = 5000) => {
    set((state) => {
      state.showNotification({
        type: "info",
        message,
        duration,
      })
      return state
    })
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))
