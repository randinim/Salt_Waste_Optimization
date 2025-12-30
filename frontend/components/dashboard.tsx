"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import RecordsTable from "@/components/records-table"
import { Download } from "lucide-react"

interface DashboardProps {
  predictions: any[]
  byProductRecords: any[]
  companionMode: boolean
}

export default function Dashboard({ predictions, byProductRecords, companionMode }: DashboardProps) {
  // Calculate summary totals from predictions
  const summaryTotals = useMemo(() => {
    if (predictions.length === 0) {
      return { byproduct1: 0, byproduct2: 0, byproduct3: 0 }
    }

    return {
      byproduct1: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.byproduct1) || 0), 0),
      byproduct2: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.byproduct2) || 0), 0),
      byproduct3: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.byproduct3) || 0), 0),
    }
  }, [predictions])

  const handleGenerateReport = () => {
    // Generate report logic
    const reportData = {
      timestamp: new Date().toISOString(),
      companionMode,
      predictions,
      byProductRecords,
      summaryTotals,
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `report-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-8">
      {/* Predicted Summaries */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Predicted Summaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Byproduct 1 Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{summaryTotals.byproduct1.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground mt-2">From {predictions.length} predictions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Byproduct 2 Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{summaryTotals.byproduct2.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground mt-2">From {predictions.length} predictions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Byproduct 3 Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{summaryTotals.byproduct3.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground mt-2">From {predictions.length} predictions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Records Tables */}
      <div className="space-y-6">
        {/* Predictions Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Predictions</h2>
            <Button
              onClick={handleGenerateReport}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
          {predictions.length > 0 ? (
            <RecordsTable data={predictions} type="prediction" />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No predictions yet. Click "Predict By Product" to add one.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* By Product Records Table */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">By Product Records</h2>
          {byProductRecords.length > 0 ? (
            <RecordsTable data={byProductRecords} type="record" />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No records yet. Click "By Product Records" to add one.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Companion Mode Info */}
      {companionMode && (
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Companion Mode Enabled:</span> Additional insights and recommendations are
              now available based on your data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
