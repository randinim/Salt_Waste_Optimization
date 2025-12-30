"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Dashboard from "@/components/dashboard"
import { ByProductForm } from "@/components/by-product-form"
import { PredictForm } from "@/components/predict-form"
import { ReportGenerator } from "@/components/report-generator"

export default function Home() {
  const [showByProductForm, setShowByProductForm] = useState(false)
  const [showPredictForm, setShowPredictForm] = useState(false)
  const [companionMode, setCompanionMode] = useState(false)
  const [byProductRecords, setByProductRecords] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])

  const handleAddByProductRecord = (record: any) => {
    setByProductRecords([...byProductRecords, { ...record, id: Date.now(), type: "record" }])
    setShowByProductForm(false)
  }

  const handleAddPrediction = (prediction: any) => {
    setPredictions([...predictions, { ...prediction, id: Date.now(), type: "prediction" }])
    setShowPredictForm(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Brinex Valor</h1>
              <p className="text-sm text-muted-foreground mt-1">Salt Waste Valorization Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="companion-mode"
                checked={companionMode}
                onCheckedChange={(checked) => setCompanionMode(checked as boolean)}
              />
              <Label htmlFor="companion-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                Companion Mode
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setShowByProductForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            By Product Records
          </Button>
          <Button
            onClick={() => setShowPredictForm(true)}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            size="lg"
          >
            Predict By Product
          </Button>
        </div>

        {/* Report Generator */}
        {(predictions.length > 0 || byProductRecords.length > 0) && (
          <div className="mb-8">
            <ReportGenerator
              predictions={predictions}
              byProductRecords={byProductRecords}
              companionMode={companionMode}
            />
          </div>
        )}

        {/* Dashboard */}
        <Dashboard predictions={predictions} byProductRecords={byProductRecords} companionMode={companionMode} />
      </div>

      {/* Forms - Sliding Drawers */}
      {showByProductForm && (
        <ByProductForm onClose={() => setShowByProductForm(false)} onSubmit={handleAddByProductRecord} />
      )}

      {showPredictForm && <PredictForm onClose={() => setShowPredictForm(false)} onSubmit={handleAddPrediction} />}
    </main>
  )
}
