"use client"

import { DashboardLayout } from "@/components/crystal/dashboard-layout"
import { Card } from "@/components/crystal/ui/card"
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react"
import { Badge } from "@/components/crystal/ui/badge"
import { Button } from "@/components/crystal/ui/button"
import { useState } from "react"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "High Humidity Alert",
      message: "Humidity levels above 75% may reduce crystal growth in pans A2-A5",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Optimal Salinity Detected",
      message: "Brine salinity in optimal range for pans B1-B3. Continue evaporation.",
      time: "4 hours ago",
      read: true,
    },
    {
      id: 3,
      type: "success",
      title: "Harvest Ready",
      message: "Pan C4 has reached maturity. Ready for collection.",
      time: "6 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "warning",
      title: "Temperature Fluctuation",
      message: "Unusual temperature variations detected in sector D",
      time: "1 day ago",
      read: true,
    },
  ])

  const [expandedAlert, setExpandedAlert] = useState<number | null>(null)

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
    if (expandedAlert === id) {
      setExpandedAlert(null)
    }
  }

  const toggleAlertRead = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: !alert.read } : alert
    ))
  }

  return (
    // <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">System Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor critical notifications and system warnings</p>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 transition-colors ${alert.read ? 'hover:bg-accent/30' : 'hover:bg-accent/50 bg-accent/20'}`}
            >
              <div className="flex items-start gap-4">
                {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />}
                {alert.type === "info" && <Info className="h-5 w-5 text-primary mt-0.5" />}
                {alert.type === "success" && <CheckCircle className="h-5 w-5 text-success mt-0.5" />}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <Badge
                      variant={
                        alert.type === "warning" ? "destructive" : alert.type === "success" ? "default" : "secondary"
                      }
                    >
                      {alert.type}
                    </Badge>
                    {!alert.read && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  
                  {expandedAlert === alert.id && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="font-medium text-foreground mb-2">Detailed Information:</p>
                      <p className="text-muted-foreground mb-2">
                        This alert was generated based on real-time monitoring of field conditions.
                        Field supervisors have been notified and should take appropriate action.
                      </p>
                      <p className="text-xs text-muted-foreground">Alert ID: #{alert.id} • Generated: {alert.time}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                    >
                      {expandedAlert === alert.id ? "Hide details" : "View details"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => toggleAlertRead(alert.id)}
                    >
                      {alert.read ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    // </DashboardLayout>
  )
}
