"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Camera,
  Sun,
  Focus,
  Cpu,
  Upload,
  RotateCcw,
  Shield,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

export default function SettingsPage() {
  const users = [
    { name: "Admin User", email: "admin@saltqc.com", role: "Admin", status: "Active" },
    { name: "QC Operator 1", email: "qc1@saltqc.com", role: "QC Operator", status: "Active" },
    { name: "QC Operator 2", email: "qc2@saltqc.com", role: "QC Operator", status: "Active" },
    { name: "Supervisor", email: "supervisor@saltqc.com", role: "Supervisor", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="System Settings" description="Configure cameras, AI models, and user access" />

      {/* Camera Calibration */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-vision-600" />
              Camera Calibration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exposure */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Exposure
                </Label>
                <span className="text-sm font-semibold">Auto</span>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
            </div>

            {/* White Balance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>White Balance (K)</Label>
                <span className="text-sm font-semibold">5600K</span>
              </div>
              <Slider defaultValue={[5600]} min={2000} max={10000} step={100} className="w-full" />
            </div>

            {/* Focus */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Focus className="h-4 w-4" />
                  Focus
                </Label>
                <span className="text-sm font-semibold">Auto</span>
              </div>
              <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
            </div>

            {/* LED Intensity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>LED Intensity</Label>
                <span className="text-sm font-semibold">85%</span>
              </div>
              <Slider defaultValue={[85]} max={100} step={1} className="w-full" />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">Apply Settings</Button>
              <Button variant="outline">Reset to Default</Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-600" />
              AI Model Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Current Model</p>
                  <p className="text-sm text-muted-foreground">Production environment</p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-semibold">v2.4.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deployed</span>
                  <span className="font-semibold">Jan 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-semibold text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inference Time</span>
                  <span className="font-semibold">32ms</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-vision-200 bg-vision-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Available Update</p>
                  <p className="text-sm text-muted-foreground">New version ready</p>
                </div>
                <Badge variant="secondary" className="bg-vision-600 text-white">
                  v2.5.0
                </Badge>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Improved detection accuracy for organic impurities
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2">
                  <Upload className="h-3 w-3" />
                  Update Model
                </Button>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                Rollback to v2.3.5
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              User Management
            </CardTitle>
            <Button className="gap-2">
              <User className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "Admin" ? "default" : "secondary"}
                        className={user.role === "Admin" ? "bg-purple-600" : ""}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Software Version</p>
              <p className="mt-1 font-semibold">v2.4.1</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Last System Update</p>
              <p className="mt-1 font-semibold">Jan 15, 2024</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">License Status</p>
              <p className="mt-1 font-semibold text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
