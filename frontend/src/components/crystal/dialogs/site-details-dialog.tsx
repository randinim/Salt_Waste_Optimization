"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/crystal/ui/dialog"
import { Card } from "@/components/crystal/ui/card"
import { Badge } from "@/components/crystal/ui/badge"
import { Droplets, Calendar, TrendingUp, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Site {
  id: string
  name: string
  density: number
  status: string
  maturity: string
  yield: string
}

interface SiteDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site: Site | null
}

export function SiteDetailsDialog({ open, onOpenChange, site }: SiteDetailsDialogProps) {
  if (!site) return null

  // Generate 30-day history data
  const historyData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    density: 18 + Math.random() * 8 + (i * 0.15),
    temperature: 28 + Math.random() * 6,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {site.name}
                <Badge
                  variant={site.status === "high" ? "default" : site.status === "medium" ? "secondary" : "outline"}
                  className={
                    site.status === "high"
                      ? "bg-success text-success-foreground"
                      : site.status === "medium"
                        ? "bg-warning text-warning-foreground"
                        : "bg-destructive text-destructive-foreground"
                  }
                >
                  {site.yield} Yield
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Site ID: {site.id}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Brine Density</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{site.density}°Bé</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Est. Maturity</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{site.maturity}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Collection Date</p>
              </div>
              <p className="text-2xl font-bold text-foreground">Dec {16 + parseInt(site.maturity)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Growth Rate</p>
              </div>
              <p className="text-2xl font-bold text-success">+2.8%</p>
            </Card>
          </div>

          {/* 30-Day Density History */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">30-Day Brine Density History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                  <XAxis dataKey="day" stroke="rgb(115 115 115)" label={{ value: "Days", position: "insideBottom", offset: -5 }} />
                  <YAxis stroke="rgb(115 115 115)" label={{ value: "°Bé", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid rgb(229 229 229)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="density" stroke="rgb(99 102 241)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Temperature Trend */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Temperature Trend</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                  <XAxis dataKey="day" stroke="rgb(115 115 115)" />
                  <YAxis stroke="rgb(115 115 115)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid rgb(229 229 229)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="rgb(234 179 8)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Site Details</h3>
            <div className="grid gap-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Current Brine Depth</span>
                <span className="text-sm font-medium text-foreground">45 cm</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Evaporation Rate</span>
                <span className="text-sm font-medium text-foreground">8.5 mm/day</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Last Maintenance</span>
                <span className="text-sm font-medium text-foreground">Dec 10, 2024</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Crystallization Phase</span>
                <span className="text-sm font-medium text-foreground">Growth Stage</span>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
