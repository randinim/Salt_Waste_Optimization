"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/valor/ui/button"
import { Input } from "@/components/valor/ui/input"
import { Label } from "@/components/valor/ui/label"
import { X } from "lucide-react"

interface ByProductFormProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

export function ByProductForm({ onClose, onSubmit }: ByProductFormProps) {
  const [formData, setFormData] = useState({
    temperature_c: "",
    humidity_pct: "",
    rain_mm: "",
    wind_speed_kmh: "",
    production_volume: "",
    evaporation_index: "",
    predicted_waste_bags: "",
    confidence: "",
    actual_organic_matter: "",
    actual_gypsum: "",
    actual_magnesium: "",
    actual_iron_oxides: "",
    actual_silica_clay: "",
    actual_residual_salt: "",
    actual_moisture: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert string values to numbers for API
    const apiData = {
      temperature_c: parseFloat(formData.temperature_c),
      humidity_pct: parseFloat(formData.humidity_pct),
      rain_mm: parseFloat(formData.rain_mm),
      wind_speed_kmh: parseFloat(formData.wind_speed_kmh),
      production_volume: parseFloat(formData.production_volume),
      evaporation_index: parseFloat(formData.evaporation_index),
      predicted_waste_bags: parseFloat(formData.predicted_waste_bags),
      confidence: parseFloat(formData.confidence),
      actual_organic_matter: parseFloat(formData.actual_organic_matter),
      actual_gypsum: parseFloat(formData.actual_gypsum),
      actual_magnesium: parseFloat(formData.actual_magnesium),
      actual_iron_oxides: parseFloat(formData.actual_iron_oxides),
      actual_silica_clay: parseFloat(formData.actual_silica_clay),
      actual_residual_salt: parseFloat(formData.actual_residual_salt),
      actual_moisture: parseFloat(formData.actual_moisture),
    }
    
    onSubmit(apiData)
    setFormData({
      temperature_c: "",
      humidity_pct: "",
      rain_mm: "",
      wind_speed_kmh: "",
      production_volume: "",
      evaporation_index: "",
      predicted_waste_bags: "",
      confidence: "",
      actual_organic_matter: "",
      actual_gypsum: "",
      actual_magnesium: "",
      actual_iron_oxides: "",
      actual_silica_clay: "",
      actual_residual_salt: "",
      actual_moisture: "",
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
            <h2 className="text-xl font-bold text-foreground">Add By Product Record</h2>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Environmental Data Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Environmental Data
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature_c" className="text-sm font-medium text-foreground">
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature_c"
                    type="number"
                    step="0.1"
                    placeholder="30.5"
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
                    step="0.1"
                    placeholder="70.0"
                    min="0"
                    max="100"
                    value={formData.humidity_pct}
                    onChange={(e) => setFormData({ ...formData, humidity_pct: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rain_mm" className="text-sm font-medium text-foreground">
                    Rainfall (mm)
                  </Label>
                  <Input
                    id="rain_mm"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    min="0"
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
                    step="0.1"
                    placeholder="8.0"
                    min="0"
                    value={formData.wind_speed_kmh}
                    onChange={(e) => setFormData({ ...formData, wind_speed_kmh: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="production_volume" className="text-sm font-medium text-foreground">
                    Production Volume
                  </Label>
                  <Input
                    id="production_volume"
                    type="number"
                    step="0.1"
                    placeholder="1800.0"
                    min="0"
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
                    step="0.1"
                    placeholder="50.0"
                    min="0"
                    value={formData.evaporation_index}
                    onChange={(e) => setFormData({ ...formData, evaporation_index: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="predicted_waste_bags" className="text-sm font-medium text-foreground">
                    Predicted Waste Bags
                  </Label>
                  <Input
                    id="predicted_waste_bags"
                    type="number"
                    step="0.1"
                    placeholder="300.0"
                    min="0"
                    value={formData.predicted_waste_bags}
                    onChange={(e) => setFormData({ ...formData, predicted_waste_bags: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confidence" className="text-sm font-medium text-foreground">
                    Confidence (0.0-1.0)
                  </Label>
                  <Input
                    id="confidence"
                    type="number"
                    step="0.01"
                    placeholder="0.90"
                    min="0"
                    max="1"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actual Component Measurements Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Actual Component Measurements
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="actual_organic_matter" className="text-sm font-medium text-foreground">
                    Organic Matter
                  </Label>
                  <Input
                    id="actual_organic_matter"
                    type="number"
                    step="0.1"
                    placeholder="48.1"
                    min="0"
                    value={formData.actual_organic_matter}
                    onChange={(e) => setFormData({ ...formData, actual_organic_matter: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="actual_gypsum" className="text-sm font-medium text-foreground">
                    Gypsum
                  </Label>
                  <Input
                    id="actual_gypsum"
                    type="number"
                    step="0.1"
                    placeholder="10.5"
                    min="0"
                    value={formData.actual_gypsum}
                    onChange={(e) => setFormData({ ...formData, actual_gypsum: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="actual_magnesium" className="text-sm font-medium text-foreground">
                    Magnesium
                  </Label>
                  <Input
                    id="actual_magnesium"
                    type="number"
                    step="0.1"
                    placeholder="7.9"
                    min="0"
                    value={formData.actual_magnesium}
                    onChange={(e) => setFormData({ ...formData, actual_magnesium: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="actual_iron_oxides" className="text-sm font-medium text-foreground">
                    Iron Oxides
                  </Label>
                  <Input
                    id="actual_iron_oxides"
                    type="number"
                    step="0.1"
                    placeholder="14.2"
                    min="0"
                    value={formData.actual_iron_oxides}
                    onChange={(e) => setFormData({ ...formData, actual_iron_oxides: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="actual_silica_clay" className="text-sm font-medium text-foreground">
                    Silica Clay
                  </Label>
                  <Input
                    id="actual_silica_clay"
                    type="number"
                    step="0.1"
                    placeholder="12.8"
                    min="0"
                    value={formData.actual_silica_clay}
                    onChange={(e) => setFormData({ ...formData, actual_silica_clay: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="actual_residual_salt" className="text-sm font-medium text-foreground">
                    Residual Salt
                  </Label>
                  <Input
                    id="actual_residual_salt"
                    type="number"
                    step="0.1"
                    placeholder="4.1"
                    min="0"
                    value={formData.actual_residual_salt}
                    onChange={(e) => setFormData({ ...formData, actual_residual_salt: e.target.value })}
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="actual_moisture" className="text-sm font-medium text-foreground">
                  Moisture Content
                </Label>
                <Input
                  id="actual_moisture"
                  type="number"
                  step="0.1"
                  placeholder="2.4"
                  min="0"
                  value={formData.actual_moisture}
                  onChange={(e) => setFormData({ ...formData, actual_moisture: e.target.value })}
                  className="mt-2 bg-input border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
