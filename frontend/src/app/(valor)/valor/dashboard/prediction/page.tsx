"use client"

import { DashboardLayout } from "@/components/valor/dashboard-layout"
import { Button } from "@/components/valor/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Plus, TrendingUp, Brain } from "lucide-react"

export default function PredictionPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Waste Prediction</h1>
            <p className="text-muted-foreground">AI-powered predictions for salt waste valorization</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Prediction
            </Button>
          </div>
        </div>

        {/* Prediction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground">AI predictions generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">--</div>
              <p className="text-xs text-muted-foreground">Average prediction accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Models Active</CardTitle>
              <Brain className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">0</div>
              <p className="text-xs text-muted-foreground">Active ML models</p>
            </CardContent>
          </Card>
        </div>

        {/* Predictions Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Predictions</CardTitle>
            <CardDescription>
              AI-generated predictions for waste valorization opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p>No predictions available</p>
            <p className="text-sm">Create your first prediction to get started with AI insights.</p>
            <Button className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Create First Prediction
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}