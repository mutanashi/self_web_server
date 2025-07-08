import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
  type: "info" | "success" | "warning" | "error"
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number

  // 添加通知
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void

  // 標記通知為已讀
  markAsRead: (id: string) => void

  // 標記所有通知為已讀
  markAllAsRead: () => void

  // 刪除通知
  removeNotification: (id: string) => void

  // 清空所有通知
  clearAllNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          )

          const unreadCount = updatedNotifications.filter((notification) => !notification.read).length

          return {
            notifications: updatedNotifications,
            unreadCount,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const unreadCount = notification && !notification.read ? state.unreadCount - 1 : state.unreadCount

          return {
            notifications: state.notifications.filter((notification) => notification.id !== id),
            unreadCount,
          }
        })
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },
    }),
    {
      name: "notification-storage",
    },
  ),
)
