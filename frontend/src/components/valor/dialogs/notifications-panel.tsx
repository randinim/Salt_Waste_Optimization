"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/valor/ui/sheet"
import { Button } from "@/components/valor/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Badge } from "@/components/valor/ui/badge"
import { Separator } from "@/components/valor/ui/separator"
import { Bell, AlertTriangle, CheckCircle, Info, Trash2 } from "lucide-react"

interface NotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "High Waste Volume Detected",
    message: "By-product waste levels are above normal threshold",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Prediction Model Updated",
    message: "Waste valorization model has been successfully retrained",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Weekly Report Available",
    message: "Your waste management report is ready for review",
    time: "3 hours ago",
    read: true,
  },
]

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive"
      case "success":
        return "default"
      case "info":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount} new
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with waste valorization alerts and system updates
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="flex gap-2">
            <Button size="sm" className="valor-button-primary">
              Mark All Read
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`valor-card cursor-pointer transition-colors hover:bg-accent/50 ${
                  !notification.read ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getIcon(notification.type)}
                      <span className="font-medium">{notification.title}</span>
                    </div>
                    <Badge variant={getVariant(notification.type)} className="text-xs">
                      {notification.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-2">
                    {notification.message}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}