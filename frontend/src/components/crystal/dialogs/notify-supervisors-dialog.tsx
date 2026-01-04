"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/crystal/ui/dialog"
import { Button } from "@/components/crystal/ui/button"
import { Textarea } from "@/components/crystal/ui/textarea"
import { Label } from "@/components/crystal/ui/label"
import { Checkbox } from "@/components/crystal/ui/checkbox"
import { Send, CheckCircle } from "lucide-react"
import { useState } from "react"

interface NotifySupervisorsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotifySupervisorsDialog({ open, onOpenChange }: NotifySupervisorsDialogProps) {
  const [message, setMessage] = useState("")
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>(["all"])
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const supervisors = [
    { id: "all", name: "All Supervisors", count: 8 },
    { id: "sector-a", name: "Sector A Team", count: 3 },
    { id: "sector-b", name: "Sector B Team", count: 3 },
    { id: "sector-c", name: "Sector C Team", count: 2 },
  ]

  const handleSend = async () => {
    setIsSending(true)
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSending(false)
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setMessage("")
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Notify Field Supervisors
          </DialogTitle>
          <DialogDescription>
            Send production alerts and recommendations to field teams
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <div className="space-y-6 mt-4">
            {/* Recipients */}
            <div className="space-y-3">
              <Label>Recipients</Label>
              <div className="space-y-2">
                {supervisors.map((supervisor) => (
                  <div key={supervisor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={supervisor.id}
                      checked={selectedSupervisors.includes(supervisor.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSupervisors([...selectedSupervisors, supervisor.id])
                        } else {
                          setSelectedSupervisors(selectedSupervisors.filter(id => id !== supervisor.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={supervisor.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {supervisor.name} <span className="text-muted-foreground">({supervisor.count})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Include specific actions, site IDs, and timelines
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage("High humidity alert: Monitor pans A2-A5 closely over the next 48 hours.")}
                >
                  Humidity Alert
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage("Optimal salinity detected in pans B1-B3. Continue evaporation process.")}
                >
                  Optimal Conditions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage("Action required: Drain excess brine in Pan A2 within 24 hours.")}
                >
                  Action Required
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage("Harvest ready: Pan C4 has reached maturity and is ready for collection.")}
                >
                  Harvest Ready
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSend}
                disabled={!message || selectedSupervisors.length === 0 || isSending}
                className="flex-1"
              >
                {isSending ? "Sending..." : "Send Notification"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-success mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Notification Sent!</h3>
            <p className="text-sm text-muted-foreground">
              Message delivered to {selectedSupervisors.length} {selectedSupervisors.length === 1 ? "group" : "groups"}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
