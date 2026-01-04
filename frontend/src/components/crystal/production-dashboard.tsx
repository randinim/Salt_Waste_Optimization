"use client"

import { Card } from "@/components/crystal/ui/card"
import { Badge } from "@/components/crystal/ui/badge"
import { Button } from "@/components/crystal/ui/button"
import { TrendingUp, Droplets, Activity, Cloud, AlertCircle, CloudCog } from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from "recharts"
import { useState, useEffect } from "react"
import { ForecastReportDialog } from "@/components/crystal/dialogs/forecast-report-dialog"
import { NotifySupervisorsDialog } from "@/components/crystal/dialogs/notify-supervisors-dialog"
import { currentSeason, historicalProduction, monthlyProduction } from "@/sample-data/crystal/pss-mock-data"
import { crystallizationController } from "@/services/crystallization.controller"
import { PredictedMonthlyProduction } from "@/types/crystallization.types"
import { productionController } from "@/services/production.controller"

// Generate mock historical data (temporary until API is ready)
const generateMockHistoricalData = (startDate: string, endDate: string): any[] => {
  const result: any[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const currentDate = new Date(start)

  // Base values for realistic variation
  const baseValues = {
    water_temperature: 26,
    lagoon: 1.5,
    OR_brine_level: 22,
    OR_bund_level: 0.8,
    IR_brine_level: 24,
    IR_bound_level: 0.7,
    East_channel: 1.2,
    West_channel: 1.3,
    rainfall: 5,
    temperature: 27,
    humidity: 75
  }

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]

    // Add some realistic variation
    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000)
    const seasonalFactor = Math.sin((dayOfYear / 365) * Math.PI * 2)

    result.push({
      date: dateStr,
      parameters: {
        water_temperature: parseFloat((baseValues.water_temperature + seasonalFactor * 2 + (Math.random() - 0.5)).toFixed(2)),
        lagoon: parseFloat((baseValues.lagoon + seasonalFactor * 0.3 + (Math.random() - 0.5) * 0.2).toFixed(2)),
        OR_brine_level: parseFloat((baseValues.OR_brine_level + seasonalFactor * 2 + (Math.random() - 0.5)).toFixed(2)),
        OR_bund_level: parseFloat((baseValues.OR_bund_level + seasonalFactor * 0.2 + (Math.random() - 0.5) * 0.1).toFixed(2)),
        IR_brine_level: parseFloat((baseValues.IR_brine_level + seasonalFactor * 2 + (Math.random() - 0.5)).toFixed(2)),
        IR_bound_level: parseFloat((baseValues.IR_bound_level + seasonalFactor * 0.2 + (Math.random() - 0.5) * 0.1).toFixed(2)),
        East_channel: parseFloat((baseValues.East_channel + seasonalFactor * 0.3 + (Math.random() - 0.5) * 0.15).toFixed(2)),
        West_channel: parseFloat((baseValues.West_channel + seasonalFactor * 0.3 + (Math.random() - 0.5) * 0.15).toFixed(2)),
      },
      weather: {
        rain_sum: parseFloat(Math.max(0, baseValues.rainfall + seasonalFactor * 10 + (Math.random() - 0.5) * 8).toFixed(2)),
        temperature_mean: parseFloat((baseValues.temperature + seasonalFactor * 2.5 + (Math.random() - 0.5) * 1.5).toFixed(2)),
        relative_humidity_mean: parseFloat((baseValues.humidity + seasonalFactor * 5 + (Math.random() - 0.5) * 5).toFixed(2)),
      }
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

// Transform API data to chart format
const transformDailyEnvironmentalData = (
  historicalData: any[],
  predictedData: any[],
  startDate: string,
  endDate: string
): any[] => {
  const result: any[] = []

  // Create a map for quick lookup
  const historicalMap = new Map()
  const predictedMap = new Map()

  historicalData.forEach(item => {
    if (item && item.date) {
      // Normalize date to YYYY-MM-DD format (handle both ISO strings and date-only strings)
      const dateStr = item.date.split('T')[0]
      historicalMap.set(dateStr, item)
    }
  })

  predictedData.forEach(item => {
    if (item && item.date) {
      // Normalize date to YYYY-MM-DD format (handle both ISO strings and date-only strings)
      const dateStr = item.date.split('T')[0]
      predictedMap.set(dateStr, item)
    }
  })

  // Generate all dates in the range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const currentDate = new Date(start)

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const isHistorical = currentDate <= new Date()

    const historicalItem = historicalMap.get(dateStr)
    const predictedItem = predictedMap.get(dateStr)
    const item = isHistorical ? historicalItem : predictedItem

    // Format period for display
    const period = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    if (item) {
      // Data exists for this date
      result.push({
        date: dateStr,
        period,
        water_temperature: item.parameters?.water_temperature != null ? parseFloat(item.parameters.water_temperature.toFixed(2)) : null,
        lagoon: item.parameters?.lagoon != null ? parseFloat(item.parameters.lagoon.toFixed(2)) : null,
        OR_brine_level: item.parameters?.OR_brine_level != null ? parseFloat(item.parameters.OR_brine_level.toFixed(2)) : null,
        OR_bund_level: item.parameters?.OR_bund_level != null ? parseFloat(item.parameters.OR_bund_level.toFixed(2)) : null,
        IR_brine_level: item.parameters?.IR_brine_level != null ? parseFloat(item.parameters.IR_brine_level.toFixed(2)) : null,
        IR_bound_level: item.parameters?.IR_bound_level != null ? parseFloat(item.parameters.IR_bound_level.toFixed(2)) : null,
        East_channel: item.parameters?.East_channel != null ? parseFloat(item.parameters.East_channel.toFixed(2)) : null,
        West_channel: item.parameters?.West_channel != null ? parseFloat(item.parameters.West_channel.toFixed(2)) : null,
        rainfall: item.weather?.rain_sum != null ? parseFloat(item.weather.rain_sum.toFixed(2)) : null,
        temperature: item.weather?.temperature_mean != null ? parseFloat(item.weather.temperature_mean.toFixed(2)) : null,
        humidity: item.weather?.relative_humidity_mean != null ? parseFloat(item.weather.relative_humidity_mean.toFixed(2)) : null,
        type: isHistorical ? 'historical' : 'predicted'
      })
    } else {
      // No data for this date - use null values
      result.push({
        date: dateStr,
        period,
        water_temperature: null,
        lagoon: null,
        OR_brine_level: null,
        OR_bund_level: null,
        IR_brine_level: null,
        IR_bound_level: null,
        East_channel: null,
        West_channel: null,
        rainfall: null,
        temperature: null,
        humidity: null,
        type: isHistorical ? 'historical' : 'predicted'
      })
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

export function ProductionDashboard() {
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false)
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false)
  const [monthlyProductionData, setMonthlyProductionData] = useState<PredictedMonthlyProduction[]>([])
  const [isLoadingMonthlyData, setIsLoadingMonthlyData] = useState(true)
  const [dailyEnvironmentalData, setDailyEnvironmentalData] = useState<any[]>([])
  const [isLoadingDailyData, setIsLoadingDailyData] = useState(true)
  const [hiddenDataKeys, setHiddenDataKeys] = useState<Set<string>>(new Set(['humidity']))

  // Fetch daily environmental data (historical + predicted)
  useEffect(() => {
    const fetchDailyEnvironmentalData = async () => {
      const today = new Date()
      try {
        setIsLoadingDailyData(true)

        // Calculate date ranges
        const formatDate = (d: Date) => d.toISOString().split('T')[0]

        // Historical: 6 months ago to today
        const historicalStart = new Date(today)
        historicalStart.setMonth(today.getMonth() - 6)
        const historicalStartStr = formatDate(historicalStart)
        const todayStr = formatDate(today)

        // Predicted: today to 2 months from now
        const predictedEnd = new Date(today)
        predictedEnd.setMonth(today.getMonth() + 2)
        const predictedEndStr = formatDate(predictedEnd)

        // For now, use mock data for historical since API doesn't exist yet
        // Only fetch predicted data from API
        let historicalData: any[] = []
        let predictedData: any[] = []

        try {
          // Fetch historical data from API
          const historicalResponse = await crystallizationController.getDailyMeasurements({
            startDate: historicalStartStr,
            endDate: todayStr,
          })
          historicalData = Array.isArray(historicalResponse) ? historicalResponse : (historicalResponse?.data || [])
          // console.log("Historical data fetched:", historicalData.length, "records")
        } catch (error) {
          console.error("Failed to fetch historical data:", error)
          // Fallback to mock data if API fails
          historicalData = []
          // historicalData = generateMockHistoricalData(historicalStartStr, todayStr)
          // console.log("Using mock historical data as fallback:", historicalData.length, "records")
        }

        try {
          // Fetch predicted data from API
          const predictedResponse = await crystallizationController.getPredictedDailyMeasurements({
            startDate: todayStr,
            endDate: predictedEndStr,
          })
          predictedData = Array.isArray(predictedResponse) ? predictedResponse : (predictedResponse?.data || [])
          // console.log("Predicted data fetched:", predictedData.length, "records")
        } catch (error) {
          console.error("Failed to fetch predicted data:", error)
          predictedData = []
        }

        // Transform the data
        const transformedData = transformDailyEnvironmentalData(
          historicalData,
          predictedData,
          historicalStartStr,
          predictedEndStr
        )

        // console.log("Transformed data:", transformedData.length, "records")
        setDailyEnvironmentalData(transformedData)
      } catch (error) {
        console.error("Failed to fetch daily environmental data:", error)
        // Use mock data as fallback
        const historicalStart = new Date(today)
        historicalStart.setMonth(today.getMonth() - 6)
        const historicalStartStr = historicalStart.toISOString().split('T')[0]
        const todayStr = today.toISOString().split('T')[0]
        const predictedEnd = new Date(today)
        predictedEnd.setMonth(today.getMonth() + 2)
        const predictedEndStr = predictedEnd.toISOString().split('T')[0]

        const mockData = generateMockHistoricalData(historicalStartStr, predictedEndStr)
        setDailyEnvironmentalData(mockData)
      } finally {
        setIsLoadingDailyData(false)
      }
    }

    fetchDailyEnvironmentalData()
  }, [])

  // Fetch both actual and predicted monthly production data
  useEffect(() => {
    const fetchMonthlyProductions = async () => {
      const date = new Date();
      try {
        setIsLoadingMonthlyData(true)

        const formatDate = (d: Date) => d.toISOString().slice(0, 7)
        const startActual = formatDate(new Date(date.getFullYear(), date.getMonth() - 6, 15))
        const currentMonth = formatDate(date)
        const endPredicted = formatDate(new Date(date.getFullYear(), date.getMonth() + 6, 15))

        const [actualResponse, predictedResponse] = await Promise.all([
          productionController.getActualMonthlyProductions({
            startMonth: startActual,
            endMonth: currentMonth,
          }),
          crystallizationController.getPredictedMonthlyProductions({
            startMonth: currentMonth,
            endMonth: endPredicted,
          }),
        ])

        // The http-client already extracts the data, so responses are arrays directly
        const actualData = Array.isArray(actualResponse) ? actualResponse : (actualResponse?.data || [])
        const predictedData = Array.isArray(predictedResponse) ? predictedResponse : (predictedResponse?.data || [])

        // Transform the data
        const transformedData = transformProductionData(
          actualData,
          predictedData
        )

        // Always set the transformed data (with null check)
        if (transformedData && Array.isArray(transformedData)) {
          setMonthlyProductionData(transformedData)
        } else {
          console.error('Transform returned invalid data:', transformedData)
          setMonthlyProductionData(defaultMonthlyProductionData)
        }
      } catch (error) {
        console.error("Failed to fetch monthly productions:", error)
        // Use fallback data on error
        setMonthlyProductionData(defaultMonthlyProductionData)
      } finally {
        setIsLoadingMonthlyData(false)
      }
    }

    fetchMonthlyProductions()
  }, [])

  // Helper function to format month from "YYYY-MM" to "MMM YY" (e.g., "2023-10" -> "Oct 23")
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIndex = parseInt(month) - 1
    const shortYear = year.slice(2)
    return `${monthNames[monthIndex]} ${shortYear}`
  }

  // Transform API data to chart format
  const transformProductionData = (
    actualData: any[],
    predictedData: any[]
  ): PredictedMonthlyProduction[] => {
    const result: PredictedMonthlyProduction[] = []

    // Validate input data
    if (!actualData || !Array.isArray(actualData)) {
      console.warn('Actual data is not an array:', actualData)
      actualData = []
    }

    if (!predictedData || !Array.isArray(predictedData)) {
      console.warn('Predicted data is not an array:', predictedData)
      predictedData = []
    }

    // Add actual/historical data
    actualData.forEach(item => {
      if (item && item.month && item.production_volume !== undefined) {
        result.push({
          month: formatMonth(item.month),
          production: item.production_volume,
          predicted: null,
          type: "historical"
        })
      }
    })

    console.log("actualData", actualData)

    // Add gap if there's a time difference between actual and predicted
    if (actualData.length > 0 && predictedData.length > 0) {
      const lastActual = actualData[actualData.length - 1].month
      const firstPredicted = predictedData[0].month

      if (lastActual && firstPredicted) {
        // Check if there's a gap (more than 1 month difference)
        const lastActualDate = new Date(lastActual)
        const firstPredictedDate = new Date(firstPredicted)
        const monthsDiff = (firstPredictedDate.getFullYear() - lastActualDate.getFullYear()) * 12 +
          (firstPredictedDate.getMonth() - lastActualDate.getMonth())

        if (monthsDiff > 1) {
          result.push({
            month: "...",
            production: null,
            predicted: null,
            type: "gap"
          })
        }
      }
    }

    // Add predicted data
    predictedData.forEach(item => {
      if (item && item.month && item.productionForecast !== undefined) {
        result.push({
          month: formatMonth(item.month),
          production: null,
          predicted: Math.round(item.productionForecast),
          type: "predicted"
        })
      }
    })

    return result
  }

  // Default/fallback monthly production data
  const defaultMonthlyProductionData: PredictedMonthlyProduction[] = [
    // Maha 2024/25 - Historical (Oct 2024 - Mar 2025)
    { month: "Oct 24", production: 1180, predicted: null, type: "historical" },
    { month: "Nov 24", production: 1250, predicted: null, type: "historical" },
    { month: "Dec 24", production: 1420, predicted: null, type: "historical" },
    { month: "Jan 25", production: 1580, predicted: null, type: "historical" },
    { month: "Feb 25", production: 1690, predicted: null, type: "historical" },
    { month: "Mar 25", production: 1520, predicted: null, type: "historical" },
    // Future months gap
    { month: "...", production: null, predicted: null, type: "gap" },
    // Maha 2025/26 - Predicted (Dec 2025 - May 2026)
    { month: "Dec 25", production: null, predicted: 1200, type: "predicted" },
    { month: "Jan 26", production: null, predicted: 1450, type: "predicted" },
    { month: "Feb 26", production: null, predicted: 1650, type: "predicted" },
    { month: "Mar 26", production: null, predicted: 1580, type: "predicted" },
    { month: "Apr 26", production: null, predicted: 1380, type: "predicted" },
    { month: "May 26", production: null, predicted: 1100, type: "predicted" },
  ]

  // Combine historical and future production data
  const combinedProductionData = [
    { period: "Yala 2023", production: 6350, type: "historical" },
    { period: "Maha 2023/24", production: 7920, type: "historical" },
    { period: "Yala 2024", production: 6580, type: "historical" },
    { period: "Maha 2024/25", production: 8120, type: "historical" },
    { period: "Dec 2025", production: null, predicted: 1200, type: "current" },
    { period: "Jan 2026", production: null, predicted: 1450, type: "future" },
    { period: "Feb 2026", production: null, predicted: 1650, type: "future" },
    { period: "Mar 2026", production: null, predicted: 1580, type: "future" },
    { period: "Apr 2026", production: null, predicted: 1380, type: "future" },
    { period: "May 2026", production: null, predicted: 1100, type: "future" },
  ]

  const totalPrediction = monthlyProduction.reduce((sum, month) => sum + month.predicted, 0)
  const avgConfidence = Math.round(monthlyProduction.reduce((sum, month) => sum + month.confidence, 0) / monthlyProduction.length)

  const mahaSeasons = historicalProduction.filter(s => s.season.includes("Maha") && !s.predicted)
  const avgHistorical = Math.round(mahaSeasons.reduce((sum, s) => sum + s.production, 0) / mahaSeasons.length)

  // Handle legend click to toggle line visibility
  const handleLegendClick = (dataKey: string) => {
    setHiddenDataKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey)
      } else {
        newSet.add(dataKey)
      }
      return newSet
    })
  }

  // Get current environmental conditions (latest data point from historical data)
  const latestEnv = dailyEnvironmentalData.filter(d => d.type === 'historical').slice(-1)[0] || dailyEnvironmentalData[0]

  return (
    <div className="p-6 space-y-4">
      {/* Compact Header with Season */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Daily Environmental Monitoring & Production Forecast</h1>
          <p className="text-sm text-muted-foreground">Puttalam Salt Society - Critical Operational Data</p>
        </div>
        <div className="text-right">
          <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">
            {currentSeason.name} {currentSeason.year}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">Oct 2025 - Mar 2026</p>
        </div>
      </div>

      {/* Compact Key Metrics */}
      <div className="grid gap-3 grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Season Forecast</span>
            <TrendingUp className="h-3 w-3 text-success" />
          </div>
          <div className="text-xl font-bold text-foreground">{totalPrediction.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">tons</p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">OR Brine Level</span>
            <Droplets className="h-3 w-3 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">{latestEnv?.OR_brine_level?.toFixed(1) || '--'}</div>
          <p className="text-xs text-success">°Bé</p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Temperature</span>
            <Activity className="h-3 w-3 text-destructive" />
          </div>
          <div className="text-xl font-bold text-foreground">{latestEnv?.temperature?.toFixed(1) || '--'}</div>
          <p className="text-xs text-muted-foreground">°C</p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Humidity</span>
            <Cloud className="h-3 w-3 text-success" />
          </div>
          <div className="text-xl font-bold text-foreground">{latestEnv?.humidity?.toFixed(0) || '--'}</div>
          <p className="text-xs text-muted-foreground">%</p>
        </Card>
      </div>

      {/* MAIN: Daily Environmental Predictions - MOST IMPORTANT */}
      <Card className="p-5 border-2 border-primary/30 bg-linear-to-br from-primary/5 to-background">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <h2 className="text-lg font-bold text-foreground">Daily Environmental Predictions</h2>
            <Badge className="bg-primary/20 text-primary">Critical for PSS Maintenance</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Past 6 months (solid) vs Future 6 months (dashed) - All Environmental Parameters</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyEnvironmentalData}>
              <defs>
                <linearGradient id="colorSalinity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(99 102 241)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(99 102 241)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
              <XAxis
                dataKey="period"
                stroke="rgb(115 115 115)"
                tick={{ fontSize: 9 }}
                interval={Math.floor(dailyEnvironmentalData.length / 15)}
              />
              <YAxis yAxisId="left" stroke="rgb(99 102 241)" tick={{ fontSize: 10 }} label={{ value: "Environmental Measurements (various units)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
              <YAxis yAxisId="right" orientation="right" stroke="rgb(59 130 246)" tick={{ fontSize: 10 }} label={{ value: "Rainfall (mm)", angle: 90, position: "insideRight", style: { fontSize: 10 } }} />

              {/* Vertical line marking the boundary between historical (left) and predicted (right) */}
              <ReferenceLine
                x={dailyEnvironmentalData.find(d => d.type === 'predicted')?.period || "1 Dec"}
                stroke="rgb(239 68 68)"
                strokeWidth={2}
                strokeDasharray="5 5"
                yAxisId="left"
              >
                <Label
                  value="← HISTORICAL | PREDICTED →"
                  position="top"
                  fill="rgb(239 68 68)"
                  fontSize={12}
                  fontWeight="bold"
                />
              </ReferenceLine>

              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid rgb(229 229 229)",
                  borderRadius: "8px",
                  fontSize: "11px"
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-semibold text-xs mb-1">{data.period}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.type === 'historical' ? '📊 Historical' : '🔮 Predicted'}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  paddingTop: "10px"
                }}
                onClick={(e) => {
                  if (e.dataKey) {
                    handleLegendClick(String(e.dataKey))
                  }
                }}
                iconType="line"
                formatter={(value, entry: any) => {
                  const dataKey = String(entry.dataKey)
                  const isHidden = hiddenDataKeys.has(dataKey)
                  return (
                    <span style={{
                      color: isHidden ? '#aaa' : entry.color,
                      textDecoration: isHidden ? 'line-through' : 'none',
                      cursor: 'pointer',
                      opacity: isHidden ? 0.6 : 1,
                      fontWeight: isHidden ? 'normal' : '500',
                      display: 'inline-block',
                      padding: '2px 4px',
                      transition: 'all 0.2s ease'
                    }}>
                      {value}
                    </span>
                  )
                }}
              />

              {/* Salinity - PRIMARY METRIC - Thick blue line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="salinity"
                stroke="rgb(99 102 241)"
                strokeWidth={4}
                name="Salinity (°Bé)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('salinity')}
              />

              {/* Rainfall - Blue bars, lighter for predicted */}
              <Bar
                yAxisId="right"
                dataKey="rainfall"
                fill="rgb(59 130 246)"
                name="Rainfall (mm)"
                radius={[2, 2, 0, 0]}
                opacity={0.6}
                hide={hiddenDataKeys.has('rainfall')}
              />

              {/* Temperature - Red line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="rgb(239 68 68)"
                strokeWidth={2}
                name="Temperature (°C)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('temperature')}
              />

              {/* Humidity - Green line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                stroke="rgb(34 197 94)"
                strokeWidth={2}
                name="Humidity (%)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('humidity')}
              />

              {/* Water Temperature - Orange line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="water_temperature"
                stroke="rgb(249 115 22)"
                strokeWidth={2}
                name="Water Temp (°C)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('water_temperature')}
              />

              {/* Lagoon - Cyan line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="lagoon"
                stroke="rgb(6 182 212)"
                strokeWidth={2}
                name="Lagoon (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('lagoon')}
              />

              {/* OR Brine Level - Purple line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="OR_brine_level"
                stroke="rgb(168 85 247)"
                strokeWidth={2}
                name="OR Brine (°Bé)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('OR_brine_level')}
              />

              {/* OR Bund Level - Pink line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="OR_bund_level"
                stroke="rgb(236 72 153)"
                strokeWidth={2}
                name="OR Bund (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('OR_bund_level')}
              />

              {/* IR Brine Level - Violet line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="IR_brine_level"
                stroke="rgb(139 92 246)"
                strokeWidth={2}
                name="IR Brine (°Bé)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('IR_brine_level')}
              />

              {/* IR Bund Level - Fuchsia line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="IR_bund_level"
                stroke="rgb(217 70 239)"
                strokeWidth={2}
                name="IR Bund (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('IR_bund_level')}
              />

              {/* East Channel - Teal line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="East_channel"
                stroke="rgb(20 184 166)"
                strokeWidth={2}
                name="East Channel (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('East_channel')}
              />

              {/* West Channel - Emerald line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="West_channel"
                stroke="rgb(16 185 129)"
                strokeWidth={2}
                name="West Channel (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('West_channel')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground justify-center border-t pt-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded">
            <div className="h-0.5 w-10 bg-primary"></div>
            <span className="font-medium">← Past 6 months (Historical)</span>
          </div>
          <div className="h-6 w-px bg-destructive"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded">
            <span className="font-medium">Future 6 months (Predicted) →</span>
            <div className="h-0.5 w-10 bg-primary"></div>
          </div>
        </div>
      </Card>

      {/* Secondary: Production Forecasts - Seasonal & Monthly */}
      <div className="grid gap-4 grid-cols-2">
        {/* Seasonal Production (Yala/Maha) */}
        <Card className="p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Seasonal Production - Yala/Maha</h2>
            <p className="text-xs text-muted-foreground">6-month seasonal totals (historical & predicted)</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                { season: "Yala 2023", production: 6350, type: "historical" },
                { season: "Maha 2023/24", production: 7920, type: "historical" },
                { season: "Yala 2024", production: 6580, type: "historical" },
                { season: "Maha 2024/25", production: 8120, type: "historical" },
                { season: "Yala 2025", production: null, predicted: 6800, type: "predicted" },
                { season: "Maha 2025/26", production: null, predicted: 8360, type: "predicted" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis
                  dataKey="season"
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="rgb(115 115 115)" tick={{ fontSize: 11 }} label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid rgb(229 229 229)",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="production" fill="rgb(99 102 241)" name="Actual (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgb(168 85 247)" name="Predicted (tons)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Production Breakdown */}
        <Card className="p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Monthly Production - Past & Future</h2>
            <p className="text-xs text-muted-foreground">Maha 2024/25 (actual) + Maha 2025/26 (predicted)</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyProductionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis
                  dataKey="month"
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="rgb(115 115 115)" tick={{ fontSize: 11 }} label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid rgb(229 229 229)",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="production" fill="rgb(99 102 241)" name="Actual (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgb(168 85 247)" name="Predicted (tons)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Summary */}
      <div className="grid gap-4 grid-cols-3">
        {/* Overall Saltern Status */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Overall Saltern Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-success/10 rounded">
              <span className="text-sm text-foreground">Avg Brine Density</span>
              <span className="text-sm font-bold text-success">24.9°Bé</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm text-foreground">Total Area</span>
              <span className="text-sm font-bold text-foreground">13.9 ha</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm text-foreground">Active Landowners</span>
              <span className="text-sm font-bold text-foreground">8</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
              <span className="text-sm text-foreground">PSS Workmen</span>
              <span className="text-sm font-bold text-primary">16</span>
            </div>
          </div>
        </Card>

        {/* Current Season Summary */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Current Season (Maha 2025/26)</h3>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 rounded">
              <p className="text-xs text-muted-foreground">Total Forecast</p>
              <p className="text-2xl font-bold text-primary">{totalPrediction.toLocaleString()} tons</p>
            </div>
            <div className="p-2 bg-success/10 rounded">
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded-full h-2">
                  <div className="bg-success rounded-full h-2" style={{ width: `${avgConfidence}%` }} />
                </div>
                <span className="text-sm font-bold text-success">{avgConfidence}%</span>
              </div>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">vs Historical Avg</p>
              <p className="text-lg font-bold text-foreground">+{Math.round((totalPrediction - avgHistorical) / avgHistorical * 100)}% better</p>
            </div>
          </div>
        </Card>

        {/* PSS Recommendations */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">PSS Actions Required</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-success/10 border border-success/20 rounded text-xs">
              <Activity className="h-4 w-4 text-success mt-0.5 flex shrink-0" />
              <div>
                <p className="font-medium text-foreground">Optimal Salinity Trend</p>
                <p className="text-muted-foreground">Maintain current operations</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/20 rounded text-xs">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex shrink-0" />
              <div>
                <p className="font-medium text-foreground">Rainfall Expected</p>
                <p className="text-muted-foreground">Monitor daily, adjust workmen</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => setForecastDialogOpen(true)} className="flex-1 text-xs h-8">
              View Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNotifyDialogOpen(true)} className="flex-1 text-xs h-8">
              Alert Teams
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <ForecastReportDialog open={forecastDialogOpen} onOpenChange={setForecastDialogOpen} />
      <NotifySupervisorsDialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen} />
    </div>
  )
}
