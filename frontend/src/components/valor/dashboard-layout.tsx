"use client"

import { type ReactNode, useState, useEffect } from "react"
import { LayoutDashboard, ClipboardList, FileText, Bell, Settings, Menu, X, User, Calendar, Recycle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/valor/ui/button"
import { Badge } from "@/components/valor/ui/badge"
import { SyncDataDialog } from "@/components/valor/dialogs/sync-data-dialog"
import { NotificationsPanel } from "@/components/valor/dialogs/notifications-panel"
import { UserMenu } from "@/components/valor/dialogs/user-menu"
import { Toaster } from "@/components/valor/ui/toaster"
import Image from "next/image"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    )
  }, [])

  const navigation = [
    { name: "Dashboard", href: "/valor/dashboard", icon: LayoutDashboard },
    { name: "By Product Records", href: "/valor/dashboard/records", icon: ClipboardList },
    { name: "Waste Prediction", href: "/valor/dashboard/prediction", icon: Recycle },
    { name: "Analytics", href: "/valor/dashboard/analytics", icon: FileText },
    { name: "Alerts", href: "/valor/dashboard/alerts", icon: Bell },
    { name: "Settings", href: "/valor/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background valor-dashboard">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                V
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground text-sm">BrineX Valor</h1>
                <p className="text-xs text-sidebar-foreground/60">Salt Waste Valorization</p>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold mx-auto">
              V
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            // Use exact match for dashboard, pathname match for sub-routes
            const isActive = item.href === "/valor/dashboard" 
              ? pathname === "/valor/dashboard"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50",
                  )}
                />
                {isSidebarOpen && <span>{item.name}</span>}
                {isActive && (
                  <div className="absolute right-1 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="w-4 h-4 text-sidebar-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">Valor User</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Salt Specialist</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center mx-auto">
              <User className="w-4 h-4 text-sidebar-foreground" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="hidden md:block">
              <h2 className="font-semibold text-foreground">Salt Waste Valorization</h2>
              <p className="text-xs text-muted-foreground">
                {currentDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSyncDialogOpen(true)}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Sync Data</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen(true)}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>

      {/* Dialogs */}
      <SyncDataDialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen} />
      <NotificationsPanel open={notificationsPanelOpen} onOpenChange={setNotificationsPanelOpen} />
      <Toaster />
    </div>
  )
}