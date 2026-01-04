"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/crystal/ui/sheet"
import { Button } from "@/components/crystal/ui/button"
import { Badge } from "@/components/crystal/ui/badge"
import { Bell, AlertCircle, Info, CheckCircle, X } from "lucide-react"
import { ScrollArea } from "@/components/crystal/ui/scroll-area"
import { useState } from "react"

interface NotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Notification {
  id: number
  type: "warning" | "info" | "success"
  title: string
  message: string
  time: string
  read: boolean
}

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "warning",
      title: "High Humidity Alert",
      message: "Humidity levels above 75% may reduce crystal growth in pans A2-A5",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "success",
      title: "Data Sync Complete",
      message: "145 field records successfully synced to central server",
      time: "3 hours ago",
      read: false
    },
    {
      id: 3,
      type: "info",
      title: "Forecast Updated",
      message: "New 7-day production forecast available for review",
      time: "5 hours ago",
      read: true
    },
    {
      id: 4,
      type: "warning",
      title: "Action Required",
      message: "Pan A2 requires brine drainage within 24 hours",
      time: "1 day ago",
      read: true
    },
    {
      id: 5,
      type: "success",
      title: "Harvest Complete",
      message: "Pan C4 collection finished - 580 tons recorded",
      time: "2 days ago",
      read: true
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />
      default:
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? "bg-background border-border"
                      : "bg-accent/30 border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
