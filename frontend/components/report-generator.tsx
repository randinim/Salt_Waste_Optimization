"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import jsPDF from "jspdf"

interface ReportGeneratorProps {
  predictions: any[]
  byProductRecords: any[]
  companionMode: boolean
}

export function ReportGenerator({ predictions, byProductRecords, companionMode }: ReportGeneratorProps) {
  const calculateTotals = () => {
    return {
      predictions: {
        byproduct1: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.byproduct1) || 0), 0),
        byproduct2: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.byproduct2) || 0), 0),
        byproduct3: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.byproduct3) || 0), 0),
        totalWaste: predictions.reduce((sum, p) => sum + (Number.parseFloat(p.totalWasteWeight) || 0), 0),
      },
      records: {
        byproduct1: byProductRecords.reduce((sum, r) => sum + (Number.parseFloat(r.byproduct1) || 0), 0),
        byproduct2: byProductRecords.reduce((sum, r) => sum + (Number.parseFloat(r.byproduct2) || 0), 0),
        byproduct3: byProductRecords.reduce((sum, r) => sum + (Number.parseFloat(r.byproduct3) || 0), 0),
        totalWaste: byProductRecords.reduce((sum, r) => sum + (Number.parseFloat(r.totalWasteWeight) || 0), 0),
      },
    }
  }

  const generatePDFReport = async () => {
    const totals = calculateTotals()
    const doc = new jsPDF()
    let yPosition = 20

    // Header
    doc.setFontSize(24)
    doc.text("Brinex Valor - Report", 20, yPosition)
    yPosition += 15

    // Metadata
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition)
    doc.text(`Companion Mode: ${companionMode ? "Enabled" : "Disabled"}`, 20, yPosition + 5)
    yPosition += 15

    // Predictions Summary
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Prediction Summary", 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.text(`Predictions Count: ${predictions.length}`, 20, yPosition)
    doc.text(`Byproduct 1 Total: ${totals.predictions.byproduct1.toFixed(2)} kg`, 20, yPosition + 5)
    doc.text(`Byproduct 2 Total: ${totals.predictions.byproduct2.toFixed(2)} kg`, 20, yPosition + 10)
    doc.text(`Byproduct 3 Total: ${totals.predictions.byproduct3.toFixed(2)} kg`, 20, yPosition + 15)
    doc.text(`Total Waste Predicted: ${totals.predictions.totalWaste.toFixed(2)} kg`, 20, yPosition + 20)
    yPosition += 35

    // Records Summary
    doc.setFontSize(14)
    doc.text("Records Summary", 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.text(`Records Count: ${byProductRecords.length}`, 20, yPosition)
    doc.text(`Byproduct 1 Total: ${totals.records.byproduct1.toFixed(2)} kg`, 20, yPosition + 5)
    doc.text(`Byproduct 2 Total: ${totals.records.byproduct2.toFixed(2)} kg`, 20, yPosition + 10)
    doc.text(`Byproduct 3 Total: ${totals.records.byproduct3.toFixed(2)} kg`, 20, yPosition + 15)
    doc.text(`Total Waste Recorded: ${totals.records.totalWaste.toFixed(2)} kg`, 20, yPosition + 20)

    // Save the PDF
    doc.save(`report-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const generateJSONReport = () => {
    const totals = calculateTotals()
    const reportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        companionMode,
      },
      summary: {
        predictions: totals.predictions,
        records: totals.records,
      },
      predictions,
      records: byProductRecords,
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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generate Report
        </CardTitle>
        <CardDescription>Export your data and predictions in various formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={generatePDFReport}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            disabled={predictions.length === 0 && byProductRecords.length === 0}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            onClick={generateJSONReport}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
            disabled={predictions.length === 0 && byProductRecords.length === 0}
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
