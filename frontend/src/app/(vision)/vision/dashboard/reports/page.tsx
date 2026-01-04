"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Mail, Printer, CheckCircle, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Report Generation" description="Export quality inspection reports and compliance documents" />
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-vision-200 bg-gradient-to-br from-vision-50 to-vision-100">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-vision-600 mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">PDF Report</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comprehensive quality report with charts
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full gap-2 bg-vision-600 hover:bg-vision-700">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">CSV Data</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Raw data export for analysis
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full gap-2 bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">JSON Export</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Machine-readable format
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full gap-2 bg-purple-600 hover:bg-purple-700">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Report Preview</CardTitle>
            <Badge variant="default">Batch SLT-2024-0421</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-border bg-white p-8">
            {/* Report Header */}
            <div className="mb-6 flex items-start justify-between border-b pb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Quality Inspection Report</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Industrial Salt Quality Assessment
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">Report ID: RPT-2024-0421</p>
                <p className="text-muted-foreground">Date: January 21, 2024</p>
                <p className="text-muted-foreground">Time: 14:35:00</p>
              </div>
            </div>

            {/* Batch Information */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Batch Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Batch ID</p>
                  <p className="mt-1 font-semibold">SLT-2024-0421</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Saltern Location</p>
                  <p className="mt-1 font-semibold">Production Unit A</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Camera Unit</p>
                  <p className="mt-1 font-semibold">CAM-01</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Inspector</p>
                  <p className="mt-1 font-semibold">QC Admin</p>
                </div>
              </div>
            </div>

            {/* Inspection Metrics */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Inspection Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                  <span className="text-sm font-medium">Whiteness Index</span>
                  <span className="text-lg font-bold text-vision-600">87.5 / 100</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                  <span className="text-sm font-medium">Average Impurity Level</span>
                  <span className="text-lg font-bold text-orange-600">2.8%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                  <span className="text-sm font-medium">Crystal Size Category</span>
                  <span className="text-lg font-bold text-foreground">Medium</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                  <span className="text-sm font-medium">Uniformity Score</span>
                  <span className="text-lg font-bold text-vision-500">0.91 / 1.00</span>
                </div>
              </div>
            </div>

            {/* Impurity Breakdown */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Impurity Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
                  <span className="text-sm font-medium">Clay Particles</span>
                  <Badge variant="secondary">12 detected</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                  <span className="text-sm font-medium">Sand</span>
                  <Badge variant="secondary">8 detected</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                  <span className="text-sm font-medium">Black Speck</span>
                  <Badge variant="secondary">5 detected</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                  <span className="text-sm font-medium">Organic Matter</span>
                  <Badge variant="secondary">3 detected</Badge>
                </div>
              </div>
            </div>

            {/* Compliance Rating */}
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900">Grade A - Compliant</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Batch meets all quality standards and is approved for distribution
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
              <p>Generated by SaltQC AI Quality Inspection System v2.4.1</p>
              <p className="mt-1">© 2024 SaltQC AI. All rights reserved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
