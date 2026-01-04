"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  Camera,
  Sun,
  RefreshCw,
  Circle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

export default function CameraMonitoringPage() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [fps, setFps] = useState(30);

  const detections = [
    {
      id: 1,
      type: "Black Speck",
      confidence: 94.2,
      severity: "High",
      timestamp: "14:32:15",
      color: "text-red-600",
    },
    {
      id: 2,
      type: "Clay Particle",
      confidence: 87.5,
      severity: "Medium",
      timestamp: "14:32:12",
      color: "text-orange-600",
    },
    {
      id: 3,
      type: "Sand",
      confidence: 91.8,
      severity: "Low",
      timestamp: "14:32:09",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Real-Time Camera Monitoring" description="Live 2K camera feed with AI-powered impurity detection" />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stream Status</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {isStreaming ? "Active" : "Stopped"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Circle className="h-6 w-6 fill-green-600 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Frame Rate</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{fps} FPS</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vision-100">
                <TrendingUp className="h-6 w-6 text-vision-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exposure</p>
                <p className="mt-2 text-2xl font-bold text-foreground">Auto</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Sun className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection</p>
                <p className="mt-2 text-2xl font-bold text-foreground">Stable</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Camera Feed - Unit 01</CardTitle>
                <Badge variant={isStreaming ? "default" : "secondary"}>
                  {isStreaming ? "Streaming" : "Stopped"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Camera Feed Mockup */}
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1587845927850-0d2d2f672b50?w=800&h=600&fit=crop"
                  alt="Salt sample"
                  className="h-full w-full object-cover opacity-90"
                />

                {/* AI Detection Overlays */}
                <div className="absolute left-[15%] top-[20%] h-16 w-16 border-2 border-red-500 animate-pulse">
                  <div className="absolute -top-6 left-0 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    Black Speck 94%
                  </div>
                </div>

                <div className="absolute left-[60%] top-[40%] h-12 w-12 border-2 border-orange-500">
                  <div className="absolute -top-6 left-0 rounded bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                    Clay 87%
                  </div>
                </div>

                <div className="absolute left-[40%] top-[65%] h-10 w-10 border-2 border-yellow-500">
                  <div className="absolute -top-6 left-0 rounded bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
                    Sand 91%
                  </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-black/70 px-4 py-3 backdrop-blur">
                  <div className="flex gap-6 text-xs text-white">
                    <span>Resolution: 2048x1536</span>
                    <span>ISO: 400</span>
                    <span>Shutter: 1/250</span>
                    <span className="text-green-400">● Recording</span>
                  </div>
                  <div className="text-xs text-white">14:32:18</div>
                </div>
              </div>

              {/* Control Toolbar */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant={isStreaming ? "destructive" : "default"}
                  onClick={() => setIsStreaming(!isStreaming)}
                  className="gap-2"
                >
                  {isStreaming ? (
                    <>
                      <Square className="h-4 w-4" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Camera
                    </>
                  )}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Sun className="h-4 w-4" />
                  Calibrate Lighting
                </Button>
                <Button variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Capture Snapshot
                </Button>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detection Panel */}
        <div className="space-y-6">
          {/* Real-time Detections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Detected Impurities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detections.map((detection) => (
                  <div
                    key={detection.id}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className={`font-semibold ${detection.color}`}>
                          {detection.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {detection.timestamp}
                        </p>
                      </div>
                      <Badge
                        variant={
                          detection.severity === "High"
                            ? "destructive"
                            : detection.severity === "Medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {detection.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-semibold">{detection.confidence}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-vision-500 to-vision-400"
                          style={{ width: `${detection.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stream Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Stream Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Camera Unit</span>
                <span className="text-sm font-semibold">Unit 01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">White Balance</span>
                <span className="text-sm font-semibold">5600K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Focus</span>
                <span className="text-sm font-semibold">Auto</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">LED Intensity</span>
                <span className="text-sm font-semibold">85%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
