"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/valor/ui/button"
import { Input } from "@/components/valor/ui/input"
import { Label } from "@/components/valor/ui/label"
import { X } from "lucide-react"

interface PredictFormProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

export function PredictForm({ onClose, onSubmit }: PredictFormProps) {
  const [formData, setFormData] = useState({
    production_volume: "",
    rain_sum: "",
    temperature_mean: "",
    humidity_mean: "",
    wind_speed_mean: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert string values to numbers array for API (order matters!)
    const features = [
      parseFloat(formData.production_volume),
      parseFloat(formData.rain_sum),
      parseFloat(formData.temperature_mean),
      parseFloat(formData.humidity_mean),
      parseFloat(formData.wind_speed_mean),
    ]
    
    onSubmit({ features })
    setFormData({
      production_volume: "",
      rain_sum: "",
      temperature_mean: "",
      humidity_mean: "",
      wind_speed_mean: "",
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
            <h2 className="text-xl font-bold text-foreground">Create Waste Prediction</h2>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="production_volume" className="text-sm font-medium text-foreground">
                Production Volume (kg)
              </Label>
              <Input
                id="production_volume"
                type="number"
                step="0.1"
                placeholder="e.g., 50000.0"
                min="0"
                value={formData.production_volume}
                onChange={(e) => setFormData({ ...formData, production_volume: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Salt production volume in kilograms</p>
            </div>

            <div>
              <Label htmlFor="rain_sum" className="text-sm font-medium text-foreground">
                Total Rainfall (mm)
              </Label>
              <Input
                id="rain_sum"
                type="number"
                step="0.1"
                placeholder="e.g., 5.0"
                min="0"
                value={formData.rain_sum}
                onChange={(e) => setFormData({ ...formData, rain_sum: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Total rainfall in millimeters</p>
            </div>

            <div>
              <Label htmlFor="temperature_mean" className="text-sm font-medium text-foreground">
                Average Temperature (°C)
              </Label>
              <Input
                id="temperature_mean"
                type="number"
                step="0.1"
                placeholder="e.g., 28.5"
                value={formData.temperature_mean}
                onChange={(e) => setFormData({ ...formData, temperature_mean: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Mean temperature in Celsius</p>
            </div>

            <div>
              <Label htmlFor="humidity_mean" className="text-sm font-medium text-foreground">
                Average Humidity (%)
              </Label>
              <Input
                id="humidity_mean"
                type="number"
                step="0.1"
                placeholder="e.g., 65.0"
                min="0"
                max="100"
                value={formData.humidity_mean}
                onChange={(e) => setFormData({ ...formData, humidity_mean: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Mean humidity percentage</p>
            </div>

            <div>
              <Label htmlFor="wind_speed_mean" className="text-sm font-medium text-foreground">
                Average Wind Speed (km/h)
              </Label>
              <Input
                id="wind_speed_mean"
                type="number"
                step="0.1"
                placeholder="e.g., 12.0"
                min="0"
                value={formData.wind_speed_mean}
                onChange={(e) => setFormData({ ...formData, wind_speed_mean: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Mean wind speed in km/h</p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Generate Prediction
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
