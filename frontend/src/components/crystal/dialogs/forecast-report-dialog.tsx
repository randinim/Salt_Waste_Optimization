"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/crystal/ui/dialog"
import { Card } from "@/components/crystal/ui/card"
import { Button } from "@/components/crystal/ui/button"
import { Download, TrendingUp, Calendar, FileText } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ForecastReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const detailedForecastData = [
  { date: "Dec 16", production: 450, minRange: 420, maxRange: 480 },
  { date: "Dec 17", production: 520, minRange: 490, maxRange: 550 },
  { date: "Dec 18", production: 480, minRange: 450, maxRange: 510 },
  { date: "Dec 19", production: 610, minRange: 580, maxRange: 640 },
  { date: "Dec 20", production: 580, minRange: 550, maxRange: 610 },
  { date: "Dec 21", production: 650, minRange: 620, maxRange: 680 },
  { date: "Dec 22", production: 590, minRange: 560, maxRange: 620 },
]

export function ForecastReportDialog({ open, onOpenChange }: ForecastReportDialogProps) {
  const handleDownload = () => {
    // Simulate download
    const blob = new Blob(["Production Forecast Report - Week of December 16, 2024"], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "production-forecast-report.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Full Production Forecast Report
          </DialogTitle>
          <DialogDescription>
            Detailed 7-day crystallization forecast with confidence intervals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Total Production</p>
              <p className="text-2xl font-bold text-foreground">3,880 tons</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Avg Daily</p>
              <p className="text-2xl font-bold text-foreground">554 tons</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Peak Day</p>
              <p className="text-2xl font-bold text-foreground">Dec 21</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-2xl font-bold text-success">86%</p>
            </Card>
          </div>

          {/* Detailed Chart */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Production Forecast with Confidence Range</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detailedForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                  <XAxis dataKey="date" stroke="rgb(115 115 115)" />
                  <YAxis stroke="rgb(115 115 115)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid rgb(229 229 229)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="maxRange" stroke="rgb(203 213 225)" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="production" stroke="rgb(99 102 241)" strokeWidth={2} />
                  <Line type="monotone" dataKey="minRange" stroke="rgb(203 213 225)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weather Factors */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Environmental Factors</h3>
            <div className="grid gap-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Temperature Range</span>
                <span className="text-sm font-medium text-foreground">28°C - 34°C</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Average Humidity</span>
                <span className="text-sm font-medium text-foreground">65% - 72%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Wind Speed</span>
                <span className="text-sm font-medium text-foreground">12 - 18 km/h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Rainfall Probability</span>
                <span className="text-sm font-medium text-foreground">15%</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
