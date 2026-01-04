"use client"

import { DashboardLayout } from "@/components/valor/dashboard-layout"
import { Button } from "@/components/valor/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Plus, FileText, Filter } from "lucide-react"

export default function RecordsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">By Product Records</h1>
            <p className="text-muted-foreground">Manage and track salt waste by-product records</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Record
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground">No records yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">0</div>
              <p className="text-xs text-muted-foreground">Records added this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg/Month</CardTitle>
              <FileText className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">0</div>
              <p className="text-xs text-muted-foreground">Average records per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Records Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              List of all by-product records. No records found yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-10 text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p>No records found</p>
            <p className="text-sm">Create your first by-product record to get started.</p>
            <Button className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Add First Record
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}