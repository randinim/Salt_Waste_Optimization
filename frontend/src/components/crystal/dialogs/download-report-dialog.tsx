"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/crystal/ui/dialog"
import { Button } from "@/components/crystal/ui/button"
import { Label } from "@/components/crystal/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/crystal/ui/radio-group"
import { Download, FileText } from "lucide-react"
import { useState } from "react"

interface DownloadReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportType: string
}

export function DownloadReportDialog({ open, onOpenChange, reportType }: DownloadReportDialogProps) {
  const [formatType, setFormatType] = useState("pdf")

  const handleDownload = () => {
    // Simulate download
    const filename = `${reportType.toLowerCase().replace(/\s+/g, '-')}.${formatType}`
    console.log(`Downloading ${filename}...`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Download {reportType}
          </DialogTitle>
          <DialogDescription>
            Select format for your report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Report Format</Label>
            <RadioGroup value={formatType} onValueChange={setFormatType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal cursor-pointer">
                  PDF Document (.pdf)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="font-normal cursor-pointer">
                  Excel Spreadsheet (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer">
                  CSV File (.csv)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Report Preview</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Includes production forecasts and actual data</p>
              <p>• Site-wise performance breakdown</p>
              <p>• Environmental factors analysis</p>
              <p>• Recommendations and insights</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
