"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationStore } from "@/lib/notification-store"

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } =
    useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)

  // 當打開下拉菜單時，標記所有通知為已讀
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const timer = setTimeout(() => {
        markAllAsRead()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, unreadCount, markAllAsRead])

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 text-green-500 border-green-500/50"
      case "warning":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "error":
        return "bg-red-500/20 text-red-500 border-red-500/50"
      case "info":
      default:
        return "bg-blue-500/20 text-blue-500 border-blue-500/50"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-sm font-medium">Notifications</div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => markAllAsRead()}
              title="Mark all as read"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => clearAllNotifications()}
              title="Clear all notifications"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`mb-2 rounded-md border p-3 ${getNotificationColor(notification.type)} ${!notification.read ? "border-l-2" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{notification.title}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 -mr-1 -mt-1"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-1 text-sm">{notification.message}</div>
                  <div className="mt-1 text-xs opacity-70">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
