"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Button } from "@/components/valor/ui/button"
import RecordsTable from "@/components/valor/records-table"
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
      return {
        totalWaste: 0,
        limestone: 0,
        gypsum: 0,
        industrialSalt: 0,
        bittern: 0,
        epsomSalt: 0,
        potash: 0,
        magnesiumOil: 0,
      }
    }

    return {
      totalWaste: predictions.reduce((sum, p) => sum + (p.predictions?.Total_Waste_kg || 0), 0),
      limestone: predictions.reduce((sum, p) => sum + (p.predictions?.Solid_Waste_Limestone_kg || 0), 0),
      gypsum: predictions.reduce((sum, p) => sum + (p.predictions?.Solid_Waste_Gypsum_kg || 0), 0),
      industrialSalt: predictions.reduce((sum, p) => sum + (p.predictions?.Solid_Waste_Industrial_Salt_kg || 0), 0),
      bittern: predictions.reduce((sum, p) => sum + (p.predictions?.Liquid_Waste_Bittern_Liters || 0), 0),
      epsomSalt: predictions.reduce((sum, p) => sum + (p.predictions?.Potential_Epsom_Salt_kg || 0), 0),
      potash: predictions.reduce((sum, p) => sum + (p.predictions?.Potential_Potash_kg || 0), 0),
      magnesiumOil: predictions.reduce((sum, p) => sum + (p.predictions?.Potential_Magnesium_Oil_Liters || 0), 0),
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
        
        {/* Total Waste - Featured */}
        <Card className="valor-card mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-destructive">{summaryTotals.totalWaste.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground mt-2">From {predictions.length} predictions</p>
          </CardContent>
        </Card>

        {/* Solid Wastes */}
        <h3 className="text-lg font-semibold text-foreground mb-3">Solid Wastes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Limestone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold valor-highlight">{summaryTotals.limestone.toFixed(2)} kg</div>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gypsum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{summaryTotals.gypsum.toFixed(2)} kg</div>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Industrial Salt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{summaryTotals.industrialSalt.toFixed(2)} kg</div>
            </CardContent>
          </Card>
        </div>

        {/* Liquid Waste */}
        <h3 className="text-lg font-semibold text-foreground mb-3">Liquid Waste</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bittern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{summaryTotals.bittern.toFixed(2)} L</div>
            </CardContent>
          </Card>
        </div>

        {/* Potential Byproducts */}
        <h3 className="text-lg font-semibold text-foreground mb-3">Potential Byproducts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Epsom Salt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{summaryTotals.epsomSalt.toFixed(2)} kg</div>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Potash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{summaryTotals.potash.toFixed(2)} kg</div>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Magnesium Oil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{summaryTotals.magnesiumOil.toFixed(2)} L</div>
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
              className="valor-button-secondary gap-2"
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
