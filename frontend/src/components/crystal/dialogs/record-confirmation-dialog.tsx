"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/crystal/ui/dialog"
import { Button } from "@/components/crystal/ui/button"
import { CheckCircle, FileCheck } from "lucide-react"

interface RecordConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordData?: {
    site: string
    worker: string
    parameters: number
  }
}

export function RecordConfirmationDialog({ open, onOpenChange, recordData }: RecordConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Data Recorded Successfully
          </DialogTitle>
          <DialogDescription>
            Your field measurements have been saved
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <CheckCircle className="h-16 w-16 text-success mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Recording Complete!</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Field data has been saved locally and will sync automatically
          </p>

          {recordData && (
            <div className="w-full space-y-2 mb-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Site/Pan</span>
                <span className="text-sm font-medium text-foreground">{recordData.site}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Recorded by</span>
                <span className="text-sm font-medium text-foreground">{recordData.worker}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Parameters logged</span>
                <span className="text-sm font-medium text-foreground">{recordData.parameters}</span>
              </div>
            </div>
          )}

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Continue Recording
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
