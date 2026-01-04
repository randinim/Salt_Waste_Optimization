"use client"

import { DashboardLayout } from "@/components/valor/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Button } from "@/components/valor/ui/button"
import { Separator } from "@/components/valor/ui/separator"
import { Settings, User, Bell, Database, Shield, Download } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your system preferences and configuration</p>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <CardTitle>User Settings</CardTitle>
              </div>
              <CardDescription>Manage your personal preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Profile Information</h4>
                <p className="text-sm text-muted-foreground">Update your profile and contact details</p>
                <Button variant="outline" size="sm">Edit Profile</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Display Preferences</h4>
                <p className="text-sm text-muted-foreground">Theme, language, and layout settings</p>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Control your alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Alert Thresholds</h4>
                <p className="text-sm text-muted-foreground">Set when you want to be notified</p>
                <Button variant="outline" size="sm">Configure Alerts</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Notification Channels</h4>
                <p className="text-sm text-muted-foreground">Email, SMS, and in-app notifications</p>
                <Button variant="outline" size="sm">Manage Channels</Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <CardTitle>Data Management</CardTitle>
              </div>
              <CardDescription>Backup and sync your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Data Backup</h4>
                <p className="text-sm text-muted-foreground">Export and backup your valorization data</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Sync Settings</h4>
                <p className="text-sm text-muted-foreground">Configure automatic data synchronization</p>
                <Button variant="outline" size="sm">Configure Sync</Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Password & Authentication</h4>
                <p className="text-sm text-muted-foreground">Change password and setup 2FA</p>
                <Button variant="outline" size="sm">Security Settings</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Data Privacy</h4>
                <p className="text-sm text-muted-foreground">Control how your data is used</p>
                <Button variant="outline" size="sm">Privacy Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <CardTitle>System Information</CardTitle>
            </div>
            <CardDescription>Current system status and version information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Version:</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Updated:</span>
              <span>2024-01-03</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span className="text-green-500">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}