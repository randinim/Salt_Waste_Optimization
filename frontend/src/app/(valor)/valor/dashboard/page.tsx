"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/valor/dashboard-layout"
import { Button } from "@/components/valor/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/valor/ui/card"
import { Badge } from "@/components/valor/ui/badge"
import { Checkbox } from "@/components/valor/ui/checkbox"
import { Label } from "@/components/valor/ui/label"
import Dashboard from "@/components/valor/dashboard"
import { ByProductForm } from "@/components/valor/by-product-form"
import { PredictForm } from "@/components/valor/predict-form"
import { ReportGenerator } from "@/components/valor/report-generator"
import { generateTimestampId } from "@/lib/id-utils"
import { Plus, Recycle, BarChart3, TrendingUp } from "lucide-react"

export default function ValorDashboardPage() {
  const [showByProductForm, setShowByProductForm] = useState(false)
  const [showPredictForm, setShowPredictForm] = useState(false)
  const [companionMode, setCompanionMode] = useState(false)
  const [byProductRecords, setByProductRecords] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [nextDataId, setNextDataId] = useState<number | null>(0)
  const [hasMorePredictions, setHasMorePredictions] = useState(false)

  const handleAddByProductRecord = (record: any) => {
    const recordWithId = { ...record, id: generateTimestampId(), type: "record" };
    setByProductRecords([...byProductRecords, recordWithId]);
    setShowByProductForm(false);
  }

  const handleAddPrediction = async (data: any) => {
    try {
      const response = await fetch("http://localhost:8001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: data.features }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();
      console.log("Prediction result:", result);

      // After creating a new prediction on the server, fetch the latest predictions
      // using the cursor-based API so the UI stays consistent with the server state.
      await fetchPredictions(0, true)
    } catch (error) {
      console.error("Error making prediction:", error);
      alert("Failed to get prediction. Make sure the API server is running.");
    }
    setShowPredictForm(false);
  }

  // Fetch predictions from server using cursor-based API
  const fetchPredictions = async (cursor: number | null = 0, replace = false) => {
    if (cursor === null) return
    try {
      const pageSize = 20
      const url = `http://localhost:8001/predictions?next_data_id=${cursor}&page_size=${pageSize}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch predictions")
      const payload = await res.json()

      // Map server entries to local UI shape
      const mapped = (payload.predictions || []).map((p: any) => ({
        id: p.timestamp || generateTimestampId(),
        type: "prediction",
        input: p.features,
        predictions: p.predictions,
        raw_predictions: p.raw_predictions,
      }))

      if (replace) {
        setPredictions(mapped)
      } else {
        setPredictions((cur) => [...cur, ...mapped])
      }

      setNextDataId(payload.next_data_id ?? null)
      setHasMorePredictions(Boolean(payload.has_more))
    } catch (err) {
      console.error("Error fetching predictions:", err)
    }
  }

  // Initial load
  useEffect(() => {
    fetchPredictions(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for custom DOM event emitted by the dashboard sentinel to trigger load-more
  useEffect(() => {
    const sentinel = document.getElementById("predictions-sentinel")
    if (!sentinel) return
    const handler = () => {
      if (hasMorePredictions) fetchPredictions(nextDataId)
    }
    sentinel.addEventListener("predictions:load-more", handler as EventListener)
    return () => sentinel.removeEventListener("predictions:load-more", handler as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextDataId, hasMorePredictions])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Salt Waste Valorization</h1>
            <p className="text-muted-foreground">Transform waste into value through data-driven insights</p>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="valor-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{byProductRecords.length}</div>
              <p className="text-xs text-muted-foreground">Waste records logged</p>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictions</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{predictions.length}</div>
              <p className="text-xs text-muted-foreground">AI predictions made</p>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valorization Rate</CardTitle>
              <Recycle className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">87%</div>
              <p className="text-xs text-muted-foreground">Waste conversion efficiency</p>
            </CardContent>
          </Card>

          <Card className="valor-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Mode</CardTitle>
              <div className="h-4 w-4">
                {companionMode ? (
                  <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-primary"></Badge>
                ) : (
                  <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full"></Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companionMode ? "Companion" : "Standard"}</div>
              <p className="text-xs text-muted-foreground">Current operating mode</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setShowByProductForm(true)}
            className="valor-button-primary gap-2"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Add By Product Record
          </Button>
          <Button
            onClick={() => setShowPredictForm(true)}
            className="valor-button-secondary gap-2"
            size="lg"
          >
            <TrendingUp className="w-4 h-4" />
            Create Prediction
          </Button>
        </div>

        {/* Report Generator */}
        {(predictions.length > 0 || byProductRecords.length > 0) && (
          <ReportGenerator
            predictions={predictions}
            byProductRecords={byProductRecords}
            companionMode={companionMode}
          />
        )}

        {/* Dashboard */}
        <Dashboard 
          predictions={predictions} 
          byProductRecords={byProductRecords} 
          companionMode={companionMode}
          onLoadMore={() => fetchPredictions(nextDataId)}
          hasMore={hasMorePredictions}
        />
      </div>

      {/* Forms - Sliding Drawers */}
      {showByProductForm && (
        <ByProductForm onClose={() => setShowByProductForm(false)} onSubmit={handleAddByProductRecord} />
      )}

      {showPredictForm && <PredictForm onClose={() => setShowPredictForm(false)} onSubmit={handleAddPrediction} />}
    </DashboardLayout>
  )
}