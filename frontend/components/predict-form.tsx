"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface PredictFormProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

export function PredictForm({ onClose, onSubmit }: PredictFormProps) {
  const [formData, setFormData] = useState({
    date: "",
    byproduct1: "",
    byproduct2: "",
    byproduct3: "",
    totalWasteWeight: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      date: "",
      byproduct1: "",
      byproduct2: "",
      byproduct3: "",
      totalWasteWeight: "",
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
            <h2 className="text-xl font-bold text-foreground">Predict By Product</h2>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="pred-date" className="text-sm font-medium text-foreground">
                Date
              </Label>
              <Input
                id="pred-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>

            <div>
              <Label htmlFor="pred-byproduct1" className="text-sm font-medium text-foreground">
                Byproduct 1 (Predicted)
              </Label>
              <Input
                id="pred-byproduct1"
                type="number"
                placeholder="Enter predicted weight (kg)"
                value={formData.byproduct1}
                onChange={(e) => setFormData({ ...formData, byproduct1: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>

            <div>
              <Label htmlFor="pred-byproduct2" className="text-sm font-medium text-foreground">
                Byproduct 2 (Predicted)
              </Label>
              <Input
                id="pred-byproduct2"
                type="number"
                placeholder="Enter predicted weight (kg)"
                value={formData.byproduct2}
                onChange={(e) => setFormData({ ...formData, byproduct2: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>

            <div>
              <Label htmlFor="pred-byproduct3" className="text-sm font-medium text-foreground">
                Byproduct 3 (Predicted)
              </Label>
              <Input
                id="pred-byproduct3"
                type="number"
                placeholder="Enter predicted weight (kg)"
                value={formData.byproduct3}
                onChange={(e) => setFormData({ ...formData, byproduct3: e.target.value })}
                className="mt-2 bg-input border-border text-foreground"
                required
              />
            </div>

            <div>
              <Label htmlFor="pred-totalWasteWeight" className="text-sm font-medium text-foreground">
                Total Waste Weight (Predicted)
              </Label>
              <Input
                id="pred-totalWasteWeight"
                type="number"
                placeholder="Enter predicted total weight (kg)"
                value={formData.totalWasteWeight}
                onChange={(e) => setFormData({ ...formData, totalWasteWeight: e.target.value })}
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
