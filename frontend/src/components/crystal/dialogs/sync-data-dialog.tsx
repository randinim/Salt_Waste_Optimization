"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/crystal/ui/dialog"
import { Button } from "@/components/crystal/ui/button"
import { Progress } from "@/components/crystal/ui/progress"
import { CheckCircle, RefreshCw, Database, Cloud, AlertCircle } from "lucide-react"
import { useState } from "react"

interface SyncDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncDataDialog({ open, onOpenChange }: SyncDataDialogProps) {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [syncComplete, setSyncComplete] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    setProgress(0)
    setSyncComplete(false)

    // Simulate sync progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }

    setSyncing(false)
    setSyncComplete(true)
  }

  const lastSyncData = {
    time: "2 hours ago",
    records: 145,
    status: "successful"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Synchronization
          </DialogTitle>
          <DialogDescription>
            Sync field data with central server
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Last Sync Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Last Successful Sync</p>
                <p className="text-xs text-muted-foreground mt-1">{lastSyncData.time}</p>
                <p className="text-xs text-muted-foreground">{lastSyncData.records} records synced</p>
              </div>
            </div>
          </div>

          {/* Sync Progress */}
          {syncing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Syncing...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Uploading field recordings and downloading latest forecasts
              </p>
            </div>
          )}

          {/* Sync Complete */}
          {syncComplete && !syncing && (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-12 w-12 text-success mb-3" />
              <h4 className="font-semibold text-foreground mb-1">Sync Complete!</h4>
              <p className="text-sm text-muted-foreground">All data is up to date</p>
            </div>
          )}

          {/* Pending Changes */}
          {!syncing && !syncComplete && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Pending Changes</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">New field records</span>
                  <span className="text-sm font-medium text-foreground">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">Updated measurements</span>
                  <span className="text-sm font-medium text-foreground">8</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">Offline entries</span>
                  <span className="text-sm font-medium text-foreground">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!syncComplete && (
              <Button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSyncComplete(false)
                setProgress(0)
                onOpenChange(false)
              }}
            >
              {syncComplete ? "Done" : "Cancel"}
            </Button>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
            <Cloud className="h-4 w-4 text-success" />
            <span className="text-xs text-foreground">Connected to PSS Server</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
