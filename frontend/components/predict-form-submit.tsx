"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface PredictFormV2Props {
  onClose: () => void
  onSubmit: (data: any) => void
}

export function PredictFormV2({ onClose, onSubmit }: PredictFormV2Props) {
  const [formData, setFormData] = useState({
    temperature_c: "",
    humidity_pct: "",
    rain_mm: "",
    wind_speed_kmh: "",
    production_volume: "",
    evaporation_index: "",
    predicted_waste_bags: "",
    confidence: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      temperature_c: "",
      humidity_pct: "",
      rain_mm: "",
      wind_speed_kmh: "",
      production_volume: "",
      evaporation_index: "",
      predicted_waste_bags: "",
      confidence: "",
    })
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sliding Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-50 overflow-y-auto animate-in slide-in-from-right-full duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Predict Waste Bags</h2>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="temperature_c" className="text-sm font-medium text-foreground">
                Temperature (°C)
              </Label>
              <Input
                id="temperature_c"
                type="number"
                step="any"
                value={formData.temperature_c}
                onChange={(e) => setFormData({ ...formData, temperature_c: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="humidity_pct" className="text-sm font-medium text-foreground">
                Humidity (%)
              </Label>
              <Input
                id="humidity_pct"
                type="number"
                step="any"
                value={formData.humidity_pct}
                onChange={(e) => setFormData({ ...formData, humidity_pct: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="rain_mm" className="text-sm font-medium text-foreground">
                Rain (mm)
              </Label>
              <Input
                id="rain_mm"
                type="number"
                step="any"
                value={formData.rain_mm}
                onChange={(e) => setFormData({ ...formData, rain_mm: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="wind_speed_kmh" className="text-sm font-medium text-foreground">
                Wind Speed (km/h)
              </Label>
              <Input
                id="wind_speed_kmh"
                type="number"
                step="any"
                value={formData.wind_speed_kmh}
                onChange={(e) => setFormData({ ...formData, wind_speed_kmh: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="production_volume" className="text-sm font-medium text-foreground">
                Production Volume
              </Label>
              <Input
                id="production_volume"
                type="number"
                step="any"
                value={formData.production_volume}
                onChange={(e) => setFormData({ ...formData, production_volume: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="evaporation_index" className="text-sm font-medium text-foreground">
                Evaporation Index
              </Label>
              <Input
                id="evaporation_index"
                type="number"
                step="any"
                value={formData.evaporation_index}
                onChange={(e) => setFormData({ ...formData, evaporation_index: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="predicted_waste_bags" className="text-sm font-medium text-foreground">
                Predicted Waste Bags
              </Label>
              <Input
                id="predicted_waste_bags"
                type="number"
                step="any"
                value={formData.predicted_waste_bags}
                onChange={(e) => setFormData({ ...formData, predicted_waste_bags: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="confidence" className="text-sm font-medium text-foreground">
                Confidence
              </Label>
              <Input
                id="confidence"
                type="number"
                step="any"
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>
            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Predict
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
