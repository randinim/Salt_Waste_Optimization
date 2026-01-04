"use client"

import { DashboardLayout } from "@/components/crystal/dashboard-layout"
import { Card } from "@/components/crystal/ui/card"
import { Switch } from "@/components/crystal/ui/switch"
import { User, Mail, Briefcase, MapPin } from "lucide-react"

export default function SettingsPage() {
  // PSS authenticated user data
  const userData = {
    name: "Sunil Perera",
    email: "sunil.perera@puttalam-salt.lk",
    role: "PSS Operations Manager",
    location: "Puttalam Salt Society, Sri Lanka"
  }

  return (
    // <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your BrineX Crystal system</p>
        </div>

        <div className="grid gap-6 max-w-3xl">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">User Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium text-foreground">{userData.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">{userData.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Site Location</p>
                  <p className="text-sm font-medium text-foreground">{userData.location}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Production Alerts</p>
                  <p className="text-xs text-muted-foreground">Receive notifications about forecast changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">System Warnings</p>
                  <p className="text-xs text-muted-foreground">Get notified about critical system alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Data Sync Notifications</p>
                  <p className="text-xs text-muted-foreground">Alerts when data is successfully synced</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">System Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Offline Mode</p>
                  <p className="text-xs text-muted-foreground">Enable data recording without internet connection</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Sync</p>
                  <p className="text-xs text-muted-foreground">Automatically sync data when connection is available</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    // </DashboardLayout>
  )
}
