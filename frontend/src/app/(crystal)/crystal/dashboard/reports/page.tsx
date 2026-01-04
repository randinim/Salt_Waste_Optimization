"use client"

import { DashboardLayout } from "@/components/crystal/dashboard-layout"
import { Card } from "@/components/crystal/ui/card"
import { FileText, Download, Calendar } from "lucide-react"
import { Button } from "@/components/crystal/ui/button"
import { useState } from "react"
import { DownloadReportDialog } from "@/components/crystal/dialogs/download-report-dialog"

export default function ReportsPage() {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState("")

  const handleDownloadClick = (reportName: string) => {
    setSelectedReport(reportName)
    setDownloadDialogOpen(true)
  }

  return (
    <>
      {/* <DashboardLayout> */}
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download production reports</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">Weekly Production Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Summary of crystallization forecasts and actual production
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick("Weekly Production Report")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <Calendar className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">Monthly Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">Comprehensive analysis of seasonal trends and yields</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick("Monthly Analysis")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">Site Performance</h3>
            <p className="text-sm text-muted-foreground mb-4">Individual salt pan productivity metrics</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick("Site Performance")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>
        </div>
      </div>

      <DownloadReportDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        reportType={selectedReport}
      />
      {/* </DashboardLayout> */}
    </>
  )
}
