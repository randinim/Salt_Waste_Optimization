"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingDown, TrendingUp, Filter } from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7days");

  const impurityTrend = [
    { date: "Jan 15", impurity: 3.2, whiteness: 85.3 },
    { date: "Jan 16", impurity: 2.8, whiteness: 86.7 },
    { date: "Jan 17", impurity: 3.5, whiteness: 84.2 },
    { date: "Jan 18", impurity: 2.6, whiteness: 87.1 },
    { date: "Jan 19", impurity: 3.1, whiteness: 86.0 },
    { date: "Jan 20", impurity: 2.9, whiteness: 86.8 },
    { date: "Jan 21", impurity: 2.7, whiteness: 87.3 },
  ];

  const batchResults = [
    { date: "Jan 15", accepted: 22, rejected: 4 },
    { date: "Jan 16", accepted: 25, rejected: 2 },
    { date: "Jan 17", accepted: 20, rejected: 5 },
    { date: "Jan 18", accepted: 28, rejected: 1 },
    { date: "Jan 19", accepted: 24, rejected: 3 },
    { date: "Jan 20", accepted: 26, rejected: 2 },
    { date: "Jan 21", accepted: 27, rejected: 3 },
  ];

  const impurityDistribution = [
    { type: "Clay", count: 342, percentage: 38 },
    { type: "Sand", count: 245, percentage: 27 },
    { type: "Black Speck", count: 189, percentage: 21 },
    { type: "Organic", count: 124, percentage: 14 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Historical Analytics" description="Performance trends and quality insights" />
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Impurity</p>
                <p className="mt-2 text-2xl font-bold text-foreground">2.9%</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>12% decrease</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Whiteness</p>
                <p className="mt-2 text-2xl font-bold text-foreground">86.5</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>3.2% increase</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acceptance Rate</p>
                <p className="mt-2 text-2xl font-bold text-foreground">91.2%</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>5.1% increase</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
                <p className="mt-2 text-2xl font-bold text-foreground">172</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-vision-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Last 7 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Impurity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Impurity Levels Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impurityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impurity"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Impurity %"
                  dot={{ fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Whiteness Score */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Whiteness Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impurityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[80, 90]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="whiteness"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Whiteness Index"
                  dot={{ fill: "#0ea5e9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Batch Results */}
        <Card>
          <CardHeader>
            <CardTitle>Accepted vs Rejected Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batchResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="accepted" fill="#10b981" name="Accepted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Impurity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Impurity Class Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={impurityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" name="Count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Mockup */}
      <Card>
        <CardHeader>
          <CardTitle>Crystal Uniformity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }, (_, i) => {
              const value = Math.random();
              const colorClass =
                value > 0.8
                  ? "bg-green-500"
                  : value > 0.6
                    ? "bg-green-400"
                    : value > 0.4
                      ? "bg-yellow-400"
                      : value > 0.2
                        ? "bg-orange-400"
                        : "bg-red-400";
              return <div key={i} className={`aspect-square rounded ${colorClass}`}></div>;
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-400"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-400"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500"></div>
              <span>High</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
