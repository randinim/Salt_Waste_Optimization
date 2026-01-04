"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/valor/ui/table"
import { Input } from "@/components/valor/ui/input"
import { ChevronUp, ChevronDown } from "lucide-react"

interface RecordsTableProps {
  data: any[]
  type: "prediction" | "record"
}

export default function RecordsTable({ data, type }: RecordsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)
  const [filterDate, setFilterDate] = useState("")
  const [filterByproduct, setFilterByproduct] = useState("")

  // Sorting logic
  const sortedData = useMemo(() => {
    let sorted = [...data]

    // Filter by date
    if (filterDate) {
      sorted = sorted.filter((item) => item.date === filterDate)
    }

    // Filter by byproduct
    if (filterByproduct) {
      sorted = sorted.filter((item) => {
        const searchTerm = filterByproduct.toLowerCase()
        return (
          item.byproduct1?.toString().includes(searchTerm) ||
          item.byproduct2?.toString().includes(searchTerm) ||
          item.byproduct3?.toString().includes(searchTerm)
        )
      })
    }

    // Sort
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return sorted
  }, [data, sortConfig, filterDate, filterByproduct])

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4" />
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Filter by Date</label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="mt-1 bg-input border-border text-foreground"
            placeholder="Filter by date"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Filter by Value</label>
          <Input
            value={filterByproduct}
            onChange={(e) => setFilterByproduct(e.target.value)}
            className="mt-1 bg-input border-border text-foreground"
            placeholder="Filter by byproduct value"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="border-b border-border">
              <TableHead className="h-10">
                <span className="font-semibold text-foreground">ID</span>
              </TableHead>
              <TableHead className="h-10">
                <button
                  onClick={() => handleSort("production_volume")}
                  className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Production (kg)
                  <SortIcon columnKey="production_volume" />
                </button>
              </TableHead>
              <TableHead className="h-10">
                <button
                  onClick={() => handleSort("Total_Waste_kg")}
                  className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Total Waste (kg)
                  <SortIcon columnKey="Total_Waste_kg" />
                </button>
              </TableHead>
              <TableHead className="h-10">
                <button
                  onClick={() => handleSort("Solid_Waste_Limestone_kg")}
                  className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Limestone (kg)
                  <SortIcon columnKey="Solid_Waste_Limestone_kg" />
                </button>
              </TableHead>
              <TableHead className="h-10">
                <button
                  onClick={() => handleSort("Solid_Waste_Gypsum_kg")}
                  className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Gypsum (kg)
                  <SortIcon columnKey="Solid_Waste_Gypsum_kg" />
                </button>
              </TableHead>
              <TableHead className="h-10">
                <button
                  onClick={() => handleSort("Liquid_Waste_Bittern_Liters")}
                  className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Bittern (L)
                  <SortIcon columnKey="Liquid_Waste_Bittern_Liters" />
                </button>
              </TableHead>
              <TableHead className="h-10">
                <button
                  onClick={() => handleSort("Potential_Epsom_Salt_kg")}
                  className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Epsom Salt (kg)
                  <SortIcon columnKey="Potential_Epsom_Salt_kg" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, idx) => (
              <TableRow key={`${row.id}-${idx}`} className="border-b border-border hover:bg-muted/50">
                <TableCell className="py-3 text-foreground text-xs">{row.id?.slice(-8) || '-'}</TableCell>
                <TableCell className="py-3 font-semibold text-primary">
                  {(row.input?.[0] || 0).toFixed(2)}
                </TableCell>
                <TableCell className="py-3 font-semibold text-destructive">
                  {(row.predictions?.Total_Waste_kg || 0).toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-foreground">
                  {(row.predictions?.Solid_Waste_Limestone_kg || 0).toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-foreground">
                  {(row.predictions?.Solid_Waste_Gypsum_kg || 0).toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-blue-500">
                  {(row.predictions?.Liquid_Waste_Bittern_Liters || 0).toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-green-500">
                  {(row.predictions?.Potential_Epsom_Salt_kg || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && data.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No results match your filters.</p>
        </div>
      )}
    </div>
  )
}
