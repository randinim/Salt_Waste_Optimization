"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/valor/ui/dialog"
import { Button } from "@/components/valor/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Badge } from "@/components/valor/ui/badge"
import { Calendar, Database, Loader2, CheckCircle } from "lucide-react"

interface SyncDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncDataDialog({ open, onOpenChange }: SyncDataDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState("2 hours ago")

  const handleSync = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastSync("Just now")
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Synchronization
          </DialogTitle>
          <DialogDescription>
            Sync waste valorization data with external systems
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="valor-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Last Sync Status</span>
                <Badge variant={isLoading ? "secondary" : "outline"} className="valor-highlight">
                  {isLoading ? "Syncing..." : "Up to date"}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {lastSync}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waste Records</span>
                  <span className="font-medium">245 records</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Predictions</span>
                  <span className="font-medium">67 predictions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Analytics Data</span>
                  <span className="font-medium">15.2 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={isLoading}
              className="valor-button-primary flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Syncing..." : "Sync Now"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}