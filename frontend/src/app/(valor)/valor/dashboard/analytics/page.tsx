"use client"

import { DashboardLayout } from "@/components/valor/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { BarChart3, PieChart, TrendingUp, Activity } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Comprehensive analytics for salt waste valorization</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">87%</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">94%</div>
              <p className="text-xs text-muted-foreground">+1.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              <BarChart3 className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">2.4k</div>
              <p className="text-xs text-muted-foreground">Tons this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <PieChart className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">$12.5k</div>
              <p className="text-xs text-muted-foreground">From valorization</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waste Conversion Trends</CardTitle>
              <CardDescription>Monthly waste to value conversion rates</CardDescription>
            </CardHeader>
            <CardContent className="py-10 text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p>Chart will be displayed here</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By-Product Distribution</CardTitle>
              <CardDescription>Breakdown of different by-products generated</CardDescription>
            </CardHeader>
            <CardContent className="py-10 text-center text-muted-foreground">
              <PieChart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p>Chart will be displayed here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}