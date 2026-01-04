"use client"

import { type ReactNode, useState } from "react"
import { LayoutDashboard, ClipboardList, FileText, Bell, Settings, Menu, X, User, Calendar, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/crystal/ui/button"
import { Badge } from "@/components/crystal/ui/badge"
import { SyncDataDialog } from "@/components/crystal/dialogs/sync-data-dialog"
import { NotificationsPanel } from "@/components/crystal/dialogs/notifications-panel"
import { UserMenu } from "@/components/crystal/dialogs/user-menu"
import { Toaster } from "@/components/crystal/ui/toaster"
import Image from "next/image"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)

  const navigation = [
    { name: "Production Prediction", href: "/crystal/dashboard/production", icon: LayoutDashboard },
    { name: "Parameter Recording", href: "/crystal/dashboard/recording", icon: ClipboardList },
    { name: "Salt Production Recording", href: "/crystal/dashboard/salt-production", icon: Package },
    { name: "Reports", href: "/crystal/dashboard/reports", icon: FileText },
    { name: "System Alerts", href: "/crystal/dashboard/alerts", icon: Bell },
    { name: "Settings", href: "/crystal/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
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
              {/* <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                BX
              </div>
              <span className="font-semibold text-sidebar-foreground">BrineX Crystal</span> */}
              <Image src={"/assets/images/crystal-logo.svg"} alt={""} width={150} height={150} />
            </div>
          ) : (
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold mx-auto">
              BX
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />}
                <item.icon className={cn("h-5 w-5 flex shrink-0", isSidebarOpen ? "" : "mx-auto")} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full justify-center text-sidebar-foreground hover:text-sidebar-accent-foreground"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSyncDialogOpen(true)}>
              Sync Data
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotificationsPanelOpen(true)}
            >
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                2
              </Badge>
            </Button>
            <UserMenu>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </UserMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Dialogs */}
      <SyncDataDialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen} />
      <NotificationsPanel open={notificationsPanelOpen} onOpenChange={setNotificationsPanelOpen} />
      <Toaster />
    </div>
  )
}
