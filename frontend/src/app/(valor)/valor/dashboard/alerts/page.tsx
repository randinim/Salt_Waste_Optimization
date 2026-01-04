"use client"

import { DashboardLayout } from "@/components/valor/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Badge } from "@/components/valor/ui/badge"
import { Button } from "@/components/valor/ui/button"
import { Bell, AlertTriangle, CheckCircle, Info, Settings } from "lucide-react"

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
            <p className="text-muted-foreground">Monitor system alerts and notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Alert Settings
            </Button>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">1</div>
              <p className="text-xs text-muted-foreground">Monitor closely</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">8</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">5</div>
              <p className="text-xs text-muted-foreground">Informational only</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample alerts */}
            <div className="flex items-start gap-3 p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
              <Bell className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">High Temperature Alert</h4>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Crystallization chamber temperature exceeded safe limits (&gt;85°C)
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">Low Efficiency Warning</h4>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Waste conversion efficiency dropped below 85%
                </p>
                <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border border-blue-500/20 bg-blue-500/5 rounded-lg">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">System Update Available</h4>
                  <Badge variant="outline" className="border-blue-500 text-blue-500">Info</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  New valorization algorithms available for update
                </p>
                <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}