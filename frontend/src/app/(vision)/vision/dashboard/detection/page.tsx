"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, TrendingUp, Package } from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

export default function DetectionGradingPage() {
  const qualityMetrics = [
    { label: "Whiteness Index", value: 87.5, color: "text-vision-600" },
    { label: "Uniformity Score", value: 0.91, color: "text-vision-500" },
    { label: "Purity Level", value: 94.2, color: "text-green-600" },
  ];

  const impurityClasses = [
    { name: "Clay", count: 12, confidence: 89.3, color: "bg-orange-500" },
    { name: "Sand", count: 8, confidence: 91.7, color: "bg-yellow-500" },
    { name: "Black Speck", count: 5, confidence: 94.2, color: "bg-red-500" },
    { name: "Organic", count: 3, confidence: 86.5, color: "bg-purple-500" },
  ];

  const recentLogs = [
    { time: "14:32:18", action: "Detection completed", status: "success" },
    { time: "14:32:15", action: "Black Speck detected (94.2%)", status: "warning" },
    { time: "14:32:12", action: "Clay particle identified", status: "warning" },
    { time: "14:32:09", action: "Frame processed successfully", status: "success" },
    { time: "14:32:06", action: "AI inference started", status: "info" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Impurity Detection & Grading" description="AI-powered analysis and quality assessment" />

      {/* Grade Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Grade</p>
                <p className="mt-2 text-3xl font-bold text-green-600">A</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impurity %</p>
                <p className="mt-2 text-2xl font-bold text-foreground">2.8%</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crystal Size</p>
                <p className="mt-2 text-2xl font-bold text-foreground">Medium</p>
              </div>
              <Package className="h-10 w-10 text-vision-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="mt-2 text-2xl font-bold text-foreground">92.1%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-vision-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Processed Image */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Processed Image with AI Overlays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1587845927850-0d2d2f672b50?w=800&h=600&fit=crop"
                  alt="Processed salt sample"
                  className="h-full w-full object-cover opacity-90"
                />

                {/* Impurity Highlights */}
                <div className="absolute left-[15%] top-[20%] h-16 w-16 rounded-full border-4 border-red-500 bg-red-500/20 animate-pulse"></div>
                <div className="absolute left-[60%] top-[40%] h-12 w-12 rounded-full border-4 border-orange-500 bg-orange-500/20"></div>
                <div className="absolute left-[40%] top-[65%] h-10 w-10 rounded-full border-4 border-yellow-500 bg-yellow-500/20"></div>
                <div className="absolute left-[75%] top-[55%] h-8 w-8 rounded-full border-4 border-purple-500 bg-purple-500/20"></div>

                {/* Grade Badge */}
                <div className="absolute right-4 top-4 rounded-lg bg-green-600 px-4 py-2 text-2xl font-bold text-white shadow-lg">
                  Grade A
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {qualityMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className={`mt-2 text-2xl font-bold ${metric.color}`}>
                      {typeof metric.value === "number" && metric.value < 10
                        ? metric.value.toFixed(2)
                        : metric.value}
                      {metric.label.includes("Score") ? "" : metric.label.includes("Index") ? "/100" : "%"}
                    </p>
                    <Progress value={typeof metric.value === "number" && metric.value < 10 ? metric.value * 100 : metric.value} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Real-Time Processing Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div className={`h-2 w-2 rounded-full ${log.status === "success"
                      ? "bg-green-500"
                      : log.status === "warning"
                        ? "bg-orange-500"
                        : "bg-vision-500"
                      }`}></div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                    <span className="flex-1 text-sm">{log.action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Inference Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Inference Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Impurity Classes */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">Detected Impurity Classes</h4>
                <div className="space-y-3">
                  {impurityClasses.map((impurity) => (
                    <div key={impurity.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{impurity.name}</span>
                        <span className="text-muted-foreground">{impurity.count} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full ${impurity.color}`}
                            style={{ width: `${impurity.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{impurity.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut Chart Mockup */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">Quality Distribution</h4>
                <div className="flex items-center justify-center py-4">
                  <div className="relative h-48 w-48">
                    <svg className="h-full w-full -rotate-90 transform">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#e2e8f0"
                        strokeWidth="20"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#0ea5e9"
                        strokeWidth="20"
                        fill="none"
                        strokeDasharray={`${87.5 * 5.03} ${100 * 5.03}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">87.5</p>
                        <p className="text-xs text-muted-foreground">Whiteness</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grading Badge */}
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                <Badge className="mb-2 bg-green-600 text-lg">Grade A</Badge>
                <p className="text-xs text-muted-foreground">
                  Passes all quality standards
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
