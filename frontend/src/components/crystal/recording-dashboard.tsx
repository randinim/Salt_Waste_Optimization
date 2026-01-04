"use client"

import { Card } from "@/components/crystal/ui/card"
import { Button } from "@/components/crystal/ui/button"
import { Input } from "@/components/crystal/ui/input"
import { Label } from "@/components/crystal/ui/label"
import { Textarea } from "@/components/crystal/ui/textarea"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/crystal/ui/select"
import { Badge } from "@/components/crystal/ui/badge"
import { Droplets, Thermometer, Gauge, Wind, Calendar as CalendarIcon, User, Sparkles } from "lucide-react"
import { RecordConfirmationDialog } from "@/components/crystal/dialogs/record-confirmation-dialog"
import { crystallizationController } from "@/services/crystallization.controller"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"


export function RecordingDashboard() {
  const { user, logout, isLoading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    temperature: "",
    lagoon: "",
    orBrineLevel: "",
    orBundLevel: "",
    irBrineLevel: "",
    irBundLevel: "",
    eastChannel: "",
    westChannel: "",
  })

  const [recentEntries, setRecentEntries] = useState([
    {
      date: "2025-12-15 14:30",
      parameter: "Temperature",
      value: "32°C",
      worker: "Sunil Perera",
      site: "Sector A",
      remarks: "Optimal level",
    },
    {
      date: "2025-12-15 14:15",
      parameter: "OR Brine Level",
      value: "24.5°Bé",
      worker: "Nimal Silva",
      site: "Sector B",
      remarks: "-",
    },
    {
      date: "2025-12-15 13:45",
      parameter: "East Channel",
      value: "15cm",
      worker: "Kamal Fernando",
      site: "Sector C",
      remarks: "Normal depth",
    },
    {
      date: "2025-12-15 13:30",
      parameter: "Lagoon",
      value: "8.5%",
      worker: "Priya Jayawardena",
      site: "Sector A",
      remarks: "Within range",
    },
  ])

  const [showSuccess, setShowSuccess] = useState(false)
  const [recordedData, setRecordedData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields are filled
    const requiredFields = [
      { name: 'Temperature', value: formData.temperature },
      { name: 'Lagoon', value: formData.lagoon },
      { name: 'OR Brine Level', value: formData.orBrineLevel },
      { name: 'OR Bund Level', value: formData.orBundLevel },
      { name: 'IR Brine Level', value: formData.irBrineLevel },
      { name: 'IR Bund Level', value: formData.irBundLevel },
      { name: 'East Channel', value: formData.eastChannel },
      { name: 'West Channel', value: formData.westChannel },
    ]

    const emptyFields = requiredFields.filter(field => !field.value || field.value.trim() === '')

    if (emptyFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${emptyFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the payload
      const payload = {
        date: new Date().toISOString().split('T')[0], // Format: "YYYY-MM-DD"
        waterTemperature: parseFloat(formData.temperature) || 0,
        lagoon: parseFloat(formData.lagoon) || 0,
        orBrineLevel: parseFloat(formData.orBrineLevel) || 0,
        orBoundLevel: parseFloat(formData.orBundLevel) || 0,
        irBrineLevel: parseFloat(formData.irBrineLevel) || 0,
        irBoundLevel: parseFloat(formData.irBundLevel) || 0,
        eastChannel: parseFloat(formData.eastChannel) || 0,
        westChannel: parseFloat(formData.westChannel) || 0,
      }

      // Call the API
      const response = await crystallizationController.createDailyMeasurement(payload)

      // Update recent entries for UI
      const newEntry = {
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        parameter: "Temperature",
        value: `${formData.temperature}°C`,
        worker: "Sunil Perera",
        site: "Field Data",
        remarks: "-",
      }
      setRecentEntries([newEntry, ...recentEntries.slice(0, 3)])

      // Show success dialog
      setRecordedData({
        site: "Puttalam",
        worker: user?.name,
        parameters: Object.values(payload).filter((value) => value !== null && value !== undefined).length,
      })
      setShowSuccess(true)

      // Reset form
      setFormData({
        temperature: "",
        lagoon: "",
        orBrineLevel: "",
        orBundLevel: "",
        irBrineLevel: "",
        irBundLevel: "",
        eastChannel: "",
        westChannel: "",
      })
    } catch (error) {
      console.error('Failed to submit daily measurement:', error)
      alert('Failed to submit measurement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Field Data Recording</h1>
          <p className="text-sm text-muted-foreground">PSS Daily Environmental Monitoring</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Data Entry Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-linear-to-br from-background to-accent/5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-foreground">Record Parameters</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20">{new Date().toLocaleDateString()}</Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Site Selection */}
              {/* <div className="space-y-2">
                <Label htmlFor="site" className="text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Sector / Location
                </Label>
                <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                  <SelectTrigger id="site" className="bg-background border-border text-foreground h-12">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sector A">Sector A</SelectItem>
                    <SelectItem value="Sector B">Sector B</SelectItem>
                    <SelectItem value="Sector C">Sector C</SelectItem>
                    <SelectItem value="Sector D">Sector D</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Parameter Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Temperature */}
                <Card className="p-4 bg-destructive/5 border-destructive/20 hover:bg-destructive/10 transition-colors">
                  <Label htmlFor="temperature" className="flex items-center gap-2 text-destructive font-semibold">
                    <Thermometer className="h-5 w-5" />
                    Temperature
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="28.0"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">°C</span>
                  </div>
                </Card>

                {/* Lagoon */}
                <Card className="p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <Label htmlFor="lagoon" className="flex items-center gap-2 text-primary font-semibold">
                    <Droplets className="h-5 w-5" />
                    Lagoon
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="lagoon"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.lagoon}
                      onChange={(e) => setFormData({ ...formData, lagoon: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">%</span>
                  </div>
                </Card>

                {/* OR Brine Level (Salinity) */}
                <Card className="p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <Label htmlFor="orBrineLevel" className="flex items-center gap-2 text-primary font-semibold">
                    <Droplets className="h-5 w-5" />
                    OR Brine Level
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="orBrineLevel"
                      type="number"
                      step="0.1"
                      placeholder="24.5"
                      value={formData.orBrineLevel}
                      onChange={(e) => setFormData({ ...formData, orBrineLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">°Bé</span>
                  </div>
                </Card>

                {/* OR Bund Level (Water Level) */}
                <Card className="p-4 bg-chart-2/10 border-chart-2/20 hover:bg-chart-2/20 transition-colors">
                  <Label htmlFor="orBundLevel" className="flex items-center gap-2 text-chart-2 font-semibold">
                    <Gauge className="h-5 w-5" />
                    OR Bund Level
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="orBundLevel"
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={formData.orBundLevel}
                      onChange={(e) => setFormData({ ...formData, orBundLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">cm</span>
                  </div>
                </Card>

                {/* IR Brine Level (Salinity) */}
                <Card className="p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <Label htmlFor="irBrineLevel" className="flex items-center gap-2 text-primary font-semibold">
                    <Droplets className="h-5 w-5" />
                    IR Brine Level
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="irBrineLevel"
                      type="number"
                      step="0.1"
                      placeholder="24.5"
                      value={formData.irBrineLevel}
                      onChange={(e) => setFormData({ ...formData, irBrineLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">°Bé</span>
                  </div>
                </Card>

                {/* IR Bund Level (Water Level) */}
                <Card className="p-4 bg-chart-2/10 border-chart-2/20 hover:bg-chart-2/20 transition-colors">
                  <Label htmlFor="irBundLevel" className="flex items-center gap-2 text-chart-2 font-semibold">
                    <Gauge className="h-5 w-5" />
                    IR Bund Level
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="irBundLevel"
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={formData.irBundLevel}
                      onChange={(e) => setFormData({ ...formData, irBundLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">cm</span>
                  </div>
                </Card>

                {/* East Channel (Water Level) */}
                <Card className="p-4 bg-chart-3/10 border-chart-3/20 hover:bg-chart-3/20 transition-colors">
                  <Label htmlFor="eastChannel" className="flex items-center gap-2 text-chart-3 font-semibold">
                    <Wind className="h-5 w-5" />
                    East Channel
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="eastChannel"
                      type="number"
                      step="0.1"
                      placeholder="12.0"
                      value={formData.eastChannel}
                      onChange={(e) => setFormData({ ...formData, eastChannel: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">cm</span>
                  </div>
                </Card>

                {/* West Channel (Water Level) */}
                <Card className="p-4 bg-chart-3/10 border-chart-3/20 hover:bg-chart-3/20 transition-colors">
                  <Label htmlFor="westChannel" className="flex items-center gap-2 text-chart-3 font-semibold">
                    <Wind className="h-5 w-5" />
                    West Channel
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="westChannel"
                      type="number"
                      step="0.1"
                      placeholder="12.0"
                      value={formData.westChannel}
                      onChange={(e) => setFormData({ ...formData, westChannel: e.target.value })}
                      className="bg-background border-border text-foreground text-2xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium">cm</span>
                  </div>
                </Card>
              </div>

              {/* Notes */}
              {/* <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">
                  Field Observations (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any notable conditions or observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-background border-border text-foreground min-h-24"
                />
              </div> */}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {isSubmitting ? "Submitting..." : "Record Field Data"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Quick Stats & Recent Activity */}
        <div className="space-y-4">
          {/* Today's Summary */}
          <Card className="p-5 bg-linear-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Today's Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Entries Recorded</span>
                <span className="text-2xl font-bold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Sectors Monitored</span>
                <span className="text-2xl font-bold text-foreground">4</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Active Workers</span>
                <span className="text-2xl font-bold text-foreground">8</span>
              </div>
            </div>
          </Card>

          {/* Data Sync */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Sync Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-xs text-muted-foreground">Synced to Server</span>
                <Badge className="bg-success text-success-foreground">24</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-xs text-muted-foreground">Pending Upload</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Last sync: Just now</p>
            </div>
          </Card>

          {/* Recent Entries Preview */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Recent Entries</h3>
            <div className="space-y-2">
              {recentEntries.slice(0, 3).map((entry, index) => (
                <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-foreground">{entry.site}</span>
                    <Badge variant="outline" className="text-xs">{entry.value}</Badge>
                  </div>
                  <p className="text-muted-foreground">{entry.worker} • {entry.date.split(' ')[1]}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <RecordConfirmationDialog
        open={showSuccess}
        onOpenChange={(open) => {
          setShowSuccess(open)
          if (!open) setRecordedData(null)
        }}
        recordData={recordedData}
      />
    </div>
  )
}
