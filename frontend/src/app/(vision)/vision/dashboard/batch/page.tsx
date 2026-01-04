"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, RotateCw, Package, TrendingUp } from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

export default function BatchAssessmentPage() {
  const [progress, setProgress] = useState(78);

  const batchSummary = [
    { label: "Batch ID", value: "SLT-2024-0421", icon: Package },
    { label: "Avg Impurity %", value: "3.2%", icon: TrendingUp },
    { label: "Avg Whiteness", value: "86.4", icon: CheckCircle },
    { label: "Avg Crystal Size", value: "Medium", icon: Package },
  ];

  const frameEvaluations = [
    { frame: "Frame 001", impurity: 2.8, whiteness: 87.5, crystalSize: "Medium", grade: "A", result: "Pass" },
    { frame: "Frame 002", impurity: 3.1, whiteness: 86.2, crystalSize: "Medium", grade: "A", result: "Pass" },
    { frame: "Frame 003", impurity: 3.5, whiteness: 85.8, crystalSize: "Fine", grade: "B", result: "Pass" },
    { frame: "Frame 004", impurity: 2.9, whiteness: 87.1, crystalSize: "Medium", grade: "A", result: "Pass" },
    { frame: "Frame 005", impurity: 4.2, whiteness: 84.3, crystalSize: "Coarse", grade: "B", result: "Pass" },
    { frame: "Frame 006", impurity: 3.3, whiteness: 86.0, crystalSize: "Medium", grade: "A", result: "Pass" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Batch Quality Assessment" description="Comprehensive batch evaluation and quality control" />

      {/* Batch Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {batchSummary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vision-100">
                    <Icon className="h-6 w-6 text-vision-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Batch Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Batch Evaluation Progress</CardTitle>
            <Badge variant="default" className="gap-1">
              <RotateCw className="h-3 w-3" />
              Processing
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frames Processed</span>
              <span className="font-semibold text-foreground">156 / 200</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Started: 14:25:00</span>
              <span>Est. Completion: 14:40:00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frame Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Frame Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frame ID</TableHead>
                  <TableHead>Impurity %</TableHead>
                  <TableHead>Whiteness</TableHead>
                  <TableHead>Crystal Size</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frameEvaluations.map((frame) => (
                  <TableRow key={frame.frame}>
                    <TableCell className="font-medium">{frame.frame}</TableCell>
                    <TableCell>
                      <span className={frame.impurity > 4 ? "text-red-600" : "text-green-600"}>
                        {frame.impurity}%
                      </span>
                    </TableCell>
                    <TableCell>{frame.whiteness}</TableCell>
                    <TableCell>{frame.crystalSize}</TableCell>
                    <TableCell>
                      <Badge
                        variant={frame.grade === "A" ? "default" : "secondary"}
                        className={frame.grade === "A" ? "bg-green-600" : "bg-vision-600"}
                      >
                        {frame.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={frame.result === "Pass" ? "default" : "destructive"}>
                        {frame.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actuator Control Panel */}
      <Card className="border-2 border-vision-500/20 bg-gradient-to-br from-vision-50/50 to-vision-100/50">
        <CardHeader>
          <CardTitle>Actuator Control Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-white p-4">
              <h4 className="mb-3 font-semibold">Batch Decision</h4>
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Accept Batch
                </Button>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject Batch Automatically
                </Button>
                <Button variant="outline" className="gap-2">
                  <RotateCw className="h-4 w-4" />
                  Send to Reprocessing
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900">Accepted Today</p>
                <p className="mt-2 text-3xl font-bold text-green-700">24</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-900">Rejected Today</p>
                <p className="mt-2 text-3xl font-bold text-red-700">3</p>
              </div>
              <div className="rounded-lg border border-vision-200 bg-vision-50 p-4">
                <p className="text-sm font-medium text-vision-900">Reprocessing</p>
                <p className="mt-2 text-3xl font-bold text-vision-700">2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
