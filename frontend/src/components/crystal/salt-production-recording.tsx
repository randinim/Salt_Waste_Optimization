"use client"

import { Card } from "@/components/crystal/ui/card"
import { Button } from "@/components/crystal/ui/button"
import { Input } from "@/components/crystal/ui/input"
import { Label } from "@/components/crystal/ui/label"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/crystal/ui/select"
import { Badge } from "@/components/crystal/ui/badge"
import { TrendingUp, Edit, Trash2, Plus, Calendar, Package, BarChart3 } from "lucide-react"
import { productionController } from "@/services/production.controller"
import { ActualMonthlyProductionData } from "@/types/production.types"
import { useToast } from "@/hooks/use-toast"
import { crystallizationController } from "@/services/crystallization.controller"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/crystal/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/crystal/ui/alert-dialog"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function SaltProductionRecording() {
    const { toast } = useToast()
    const [productions, setProductions] = useState<ActualMonthlyProductionData[]>([])
    const [predictedProductions, setPredictedProductions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedProduction, setSelectedProduction] = useState<ActualMonthlyProductionData | null>(null)

    const [formData, setFormData] = useState({
        month: "",
        production_volume: "",
        season: "",
    })

    // Fetch production records
    const fetchProductions = async () => {
        try {
            setIsLoading(true)
            const today = new Date()
            const startDate = new Date(today.getFullYear() - 2, 0, 1) // 2 years ago
            const endDate = new Date(today.getFullYear() + 1, 11, 31) // 1 year ahead

            const formatDate = (d: Date) => d.toISOString().slice(0, 7)

            // Fetch actual productions
            const actualResponse = await productionController.getActualMonthlyProductions({
                startMonth: formatDate(startDate),
                endMonth: formatDate(today),
            })

            const actualData = Array.isArray(actualResponse) ? actualResponse : (actualResponse?.data || [])

            // Fetch predicted productions
            try {
                const predictedResponse = await crystallizationController.getPredictedMonthlyProductions({
                    startMonth: formatDate(today),
                    endMonth: formatDate(endDate),
                })
                const predictedData = Array.isArray(predictedResponse) ? predictedResponse : (predictedResponse?.data || [])
                setPredictedProductions(predictedData)
            } catch (error) {
                console.error("Failed to fetch predicted productions:", error)
                setPredictedProductions([])
            }

            // Sort by month descending
            const sortedData = actualData.sort((a, b) => b.month.localeCompare(a.month))
            setProductions(sortedData)
        } catch (error) {
            console.error("Failed to fetch productions:", error)
            toast({
                title: "Error",
                description: "Failed to fetch production records",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProductions()
    }, [])

    // Prepare chart data
    const prepareChartData = () => {
        // Combine actual and predicted data
        const combinedData: any[] = []

        // Group actual data by season
        const seasonalData: { [key: string]: { actual: number; season: string; month: string } } = {}

        productions.forEach((prod) => {
            const seasonKey = `${prod.season} ${prod.month.split('-')[0]}`
            if (!seasonalData[seasonKey]) {
                seasonalData[seasonKey] = {
                    actual: 0,
                    season: prod.season,
                    month: prod.month,
                }
            }
            seasonalData[seasonKey].actual += prod.production_volume
        })

        // Group predicted data by season
        const predictedSeasonalData: { [key: string]: { predicted: number; season: string } } = {}

        predictedProductions.forEach((pred) => {
            // Determine season based on month
            const monthNum = parseInt(pred.month.split('-')[1])
            const season = (monthNum >= 4 && monthNum <= 9) ? 'Yala' : 'Maha'
            const year = pred.month.split('-')[0]
            const seasonKey = `${season} ${year}`

            if (!predictedSeasonalData[seasonKey]) {
                predictedSeasonalData[seasonKey] = {
                    predicted: 0,
                    season: season,
                }
            }
            predictedSeasonalData[seasonKey].predicted += pred.productionForecast || 0
        })

        // Combine into chart data
        const allSeasons = new Set([...Object.keys(seasonalData), ...Object.keys(predictedSeasonalData)])

        allSeasons.forEach((seasonKey) => {
            const actual = seasonalData[seasonKey]
            const predicted = predictedSeasonalData[seasonKey]

            combinedData.push({
                season: seasonKey,
                actual: actual ? Math.round(actual.actual) : null,
                predicted: predicted ? Math.round(predicted.predicted) : null,
                seasonType: actual?.season || predicted?.season || 'Maha',
            })
        })

        // Sort by season chronologically
        return combinedData.sort((a, b) => a.season.localeCompare(b.season)).slice(-6)
    }

    const chartData = prepareChartData()

    // Handle create
    const handleCreate = async () => {
        if (!formData.month || !formData.production_volume || !formData.season) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            await productionController.createProduction({
                month: formData.month,
                production_volume: parseFloat(formData.production_volume),
                season: formData.season,
            })

            toast({
                title: "Success",
                description: "Production record created successfully",
            })

            setShowCreateDialog(false)
            setFormData({ month: "", production_volume: "", season: "" })
            fetchProductions()
        } catch (error) {
            console.error("Failed to create production:", error)
            toast({
                title: "Error",
                description: "Failed to create production record",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle update
    const handleUpdate = async () => {
        if (!selectedProduction || !formData.production_volume || !formData.season) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            await productionController.updateProduction(selectedProduction._id, {
                production_volume: parseFloat(formData.production_volume),
                season: formData.season,
            })

            toast({
                title: "Success",
                description: "Production record updated successfully",
            })

            setShowEditDialog(false)
            setSelectedProduction(null)
            setFormData({ month: "", production_volume: "", season: "" })
            fetchProductions()
        } catch (error) {
            console.error("Failed to update production:", error)
            toast({
                title: "Error",
                description: "Failed to update production record",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle delete
    const handleDelete = async () => {
        if (!selectedProduction) return

        try {
            setIsSubmitting(true)
            await productionController.deleteProduction(selectedProduction._id)

            toast({
                title: "Success",
                description: "Production record deleted successfully",
            })

            setShowDeleteDialog(false)
            setSelectedProduction(null)
            fetchProductions()
        } catch (error) {
            console.error("Failed to delete production:", error)
            toast({
                title: "Error",
                description: "Failed to delete production record",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Open edit dialog
    const openEditDialog = (production: ActualMonthlyProductionData) => {
        setSelectedProduction(production)
        setFormData({
            month: production.month,
            production_volume: production.production_volume.toString(),
            season: production.season,
        })
        setShowEditDialog(true)
    }

    // Open delete dialog
    const openDeleteDialog = (production: ActualMonthlyProductionData) => {
        setSelectedProduction(production)
        setShowDeleteDialog(true)
    }

    // Format month for display
    const formatMonth = (monthStr: string): string => {
        const [year, month] = monthStr.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = parseInt(month) - 1
        return `${monthNames[monthIndex]} ${year}`
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Salt Production Recording</h1>
                        <p className="text-sm text-muted-foreground">Manage monthly production records</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setFormData({ month: "", production_volume: "", season: "" })
                        setShowCreateDialog(true)
                    }}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Record
                </Button>
            </div>

            {/* Production Chart */}
            {chartData.length > 0 && (
                <Card className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Production Overview</h2>
                            <p className="text-sm text-muted-foreground">Actual vs Predicted Seasonal Production</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(99 102 241)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="rgb(99 102 241)" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(168 85 247)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="rgb(168 85 247)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                                <XAxis
                                    dataKey="season"
                                    stroke="rgb(115 115 115)"
                                    tick={{ fontSize: 12 }}
                                    angle={-20}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis
                                    stroke="rgb(115 115 115)"
                                    tick={{ fontSize: 11 }}
                                    label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid rgb(229 229 229)",
                                        borderRadius: "8px",
                                        fontSize: "12px"
                                    }}
                                    formatter={(value: any) => [`${value?.toLocaleString()} tons`, ""]}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                                    formatter={(value) => value === "actual" ? "Actual (tons)" : "Predicted (tons)"}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="rgb(99 102 241)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorActual)"
                                    name="actual"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="rgb(168 85 247)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPredicted)"
                                    name="predicted"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Production Records Table */}
            <Card className="p-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Production Records</h2>
                    <p className="text-sm text-muted-foreground">View and manage all production records</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading production records...</p>
                    </div>
                ) : productions.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No production records found</p>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            variant="outline"
                            className="mt-4"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Record
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Month</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Season</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Production (tons)</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productions.map((production) => (
                                    <tr key={production._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground">{formatMonth(production.month)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                className={
                                                    production.season === "Maha"
                                                        ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                                                        : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                                }
                                            >
                                                {production.season}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <TrendingUp className="h-4 w-4 text-success" />
                                                <span className="font-bold text-foreground">
                                                    {production.production_volume.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(production)}
                                                    className="hover:bg-primary/10 hover:text-primary"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(production)}
                                                    className="hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Production Record</DialogTitle>
                        <DialogDescription>
                            Add a new monthly production record
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-month">Month</Label>
                            <Input
                                id="create-month"
                                type="month"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-season">Season</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                                <SelectTrigger id="create-season" className="bg-background border-border text-foreground">
                                    <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maha">Maha</SelectItem>
                                    <SelectItem value="Yala">Yala</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-volume">Production Volume (tons)</Label>
                            <Input
                                id="create-volume"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.production_volume}
                                onChange={(e) => setFormData({ ...formData, production_volume: e.target.value })}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Record"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Production Record</DialogTitle>
                        <DialogDescription>
                            Update production record for {selectedProduction && formatMonth(selectedProduction.month)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-month">Month</Label>
                            <Input
                                id="edit-month"
                                type="month"
                                value={formData.month}
                                disabled
                                className="bg-muted border-border text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-season">Season</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                                <SelectTrigger id="edit-season" className="bg-background border-border text-foreground">
                                    <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maha">Maha</SelectItem>
                                    <SelectItem value="Yala">Yala</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-volume">Production Volume (tons)</Label>
                            <Input
                                id="edit-volume"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.production_volume}
                                onChange={(e) => setFormData({ ...formData, production_volume: e.target.value })}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Record"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the production record for{" "}
                            <strong>{selectedProduction && formatMonth(selectedProduction.month)}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
