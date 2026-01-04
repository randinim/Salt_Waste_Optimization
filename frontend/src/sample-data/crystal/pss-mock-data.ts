// BrineX Crystal Mock Data - Puttalam Salt Society
// Environmental data is DAILY for operational planning
// Production data is MONTHLY

// Current Season (Maha 2025/2026)
export const currentSeason = {
  name: "Maha",
  year: "2025/2026",
  startDate: new Date(2025, 9, 1), // October 1, 2025
  endDate: new Date(2026, 2, 31), // March 31, 2026
  isActive: true
}

// 6-Month Production Forecast (Monthly basis)
export const monthlyProduction = [
  { month: "Dec 2025", predicted: 1200, confidence: 88 },
  { month: "Jan 2026", predicted: 1450, confidence: 85 },
  { month: "Feb 2026", predicted: 1650, confidence: 82 },
  { month: "Mar 2026", predicted: 1580, confidence: 79 },
  { month: "Apr 2026", predicted: 1380, confidence: 76 },
  { month: "May 2026", predicted: 1100, confidence: 73 },
]

// Generate daily environmental data
// Past 6 months: Jun - Nov 2025 (historical)
// Future 6 months: Dec 2025 - May 2026 (predicted)
const generateDailyEnvironmentalData = () => {
  const data = []
  const startDate = new Date(2025, 5, 1) // June 1, 2025
  const totalDays = 365 // ~12 months of data
  
  // Base patterns for realistic variation
  // const salinityBase = 24.5
  const rainfallBase = 100
  const temperatureBase = 28
  const humidityBase = 75
  const waterTempBase = 26
  const lagoonBase = 1.5
  const brineBase = 22
  const bundBase = 0.8
  const channelBase = 1.2
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const month = currentDate.getMonth()
    const day = currentDate.getDate()
    const isHistorical = currentDate < new Date(2025, 11, 1) // Before Dec 2025
    
    // Seasonal variations
    const seasonalFactor = Math.sin((month / 12) * Math.PI * 2)
    const dailyVariation = Math.sin((day / 30) * Math.PI * 2) * 0.3
    
    // Rainfall varies significantly by season (monsoon patterns)
    let rainfall
    if (month >= 3 && month <= 8) { // Apr-Sep: Southwest monsoon
      rainfall = rainfallBase + seasonalFactor * 80 + Math.random() * 40
    } else { // Oct-Mar: Northeast monsoon (current season)
      rainfall = rainfallBase - seasonalFactor * 30 + Math.random() * 30
    }
    
    // Salinity inversely related to rainfall
    // const salinity = salinityBase + (rainfallBase - rainfall) / 15 + dailyVariation + Math.random() * 0.5 - 0.25
    
    // Temperature seasonal variation (air temperature)
    const temperature = temperatureBase + seasonalFactor * 2.5 + dailyVariation + Math.random() * 1.5 - 0.75
    
    // Water temperature (slightly cooler than air, less variation)
    const waterTemperature = waterTempBase + seasonalFactor * 2 + dailyVariation * 0.5 + Math.random() * 1 - 0.5
    
    // Humidity correlates with rainfall
    const humidity = humidityBase + (rainfall - rainfallBase) / 8 + dailyVariation * 2 + Math.random() * 3 - 1.5
    
    // Lagoon level (water level in meters, affected by rainfall)
    const lagoon = lagoonBase + (rainfall - rainfallBase) / 100 + dailyVariation * 0.2 + Math.random() * 0.1 - 0.05
    
    // OR (Outer Reservoir) brine level (salinity in °Bé)
    const orBrineLevel = brineBase + (rainfallBase - rainfall) / 20 + dailyVariation + Math.random() * 0.5 - 0.25
    
    // OR bund level (water level in meters)
    const orBundLevel = bundBase + (rainfall - rainfallBase) / 150 + dailyVariation * 0.15 + Math.random() * 0.08 - 0.04
    
    // IR (Inner Reservoir) brine level (salinity in °Bé, higher than OR)
    const irBrineLevel = brineBase + 2 + (rainfallBase - rainfall) / 18 + dailyVariation + Math.random() * 0.5 - 0.25
    
    // IR bund level (water level in meters)
    const irBundLevel = bundBase - 0.1 + (rainfall - rainfallBase) / 150 + dailyVariation * 0.15 + Math.random() * 0.08 - 0.04
    
    // East channel (water level in meters)
    const eastChannel = channelBase + (rainfall - rainfallBase) / 120 + dailyVariation * 0.18 + Math.random() * 0.09 - 0.045
    
    // West channel (water level in meters)
    const westChannel = channelBase + 0.1 + (rainfall - rainfallBase) / 120 + dailyVariation * 0.18 + Math.random() * 0.09 - 0.045
    
    // Sample every 3-5 days to keep data manageable for display
    if (i % 4 === 0 || !isHistorical) { // Show all future days, sample historical
      data.push({
        date: currentDate.toISOString().split('T')[0],
        period: currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        // salinity: Math.max(20, Math.min(28, parseFloat(salinity.toFixed(1)))),
        rainfall: Math.max(0, parseFloat(rainfall.toFixed(0))),
        temperature: Math.max(25, Math.min(32, parseFloat(temperature.toFixed(1)))),
        water_temperature: Math.max(23, Math.min(30, parseFloat(waterTemperature.toFixed(1)))),
        humidity: Math.max(60, Math.min(90, parseFloat(humidity.toFixed(0)))),
        lagoon: Math.max(0.5, Math.min(2.5, parseFloat(lagoon.toFixed(2)))),
        OR_brine_level: Math.max(18, Math.min(26, parseFloat(orBrineLevel.toFixed(1)))),
        OR_bund_level: Math.max(0.3, Math.min(1.5, parseFloat(orBundLevel.toFixed(2)))),
        IR_brine_level: Math.max(20, Math.min(28, parseFloat(irBrineLevel.toFixed(1)))),
        IR_bund_level: Math.max(0.2, Math.min(1.4, parseFloat(irBundLevel.toFixed(2)))),
        East_channel: Math.max(0.5, Math.min(2.0, parseFloat(eastChannel.toFixed(2)))),
        West_channel: Math.max(0.5, Math.min(2.0, parseFloat(westChannel.toFixed(2)))),
        type: isHistorical ? 'historical' : 'predicted'
      })
    }
  }
  
  return data
}

// Daily Environmental Data (6 months historical + 6 months predicted)
export const dailyEnvironmentalData = generateDailyEnvironmentalData()

// Get just historical data (past 6 months)
export const historicalEnvironmentalData = dailyEnvironmentalData.filter(d => d.type === 'historical')

// Get just predicted data (future 6 months)
export const predictedEnvironmentalData = dailyEnvironmentalData.filter(d => d.type === 'predicted')

// Historical Production Data (Past Years - Monthly basis)
export const historicalProduction = [
  { season: "Maha 2020/21", production: 7200, months: 6 },
  { season: "Yala 2021", production: 5800, months: 6 },
  { season: "Maha 2021/22", production: 7450, months: 6 },
  { season: "Yala 2022", production: 6100, months: 6 },
  { season: "Maha 2022/23", production: 7680, months: 6 },
  { season: "Yala 2023", production: 6350, months: 6 },
  { season: "Maha 2023/24", production: 7920, months: 6 },
  { season: "Yala 2024", production: 6580, months: 6 },
  { season: "Maha 2024/25", production: 8120, months: 6 },
  { season: "Maha 2025/26", production: 8360, months: 6, predicted: true },
]

// PSS Workmen
export const pssWorkmen = [
  "Sunil Perera",
  "Nimal Silva",
  "Kamal Fernando",
  "Priya Jayawardena",
  "Ranjith Kumar",
  "Lakshmi Perera",
  "Chaminda Bandara",
  "Sanduni Wijesinghe"
]

// Landowners
export const landowners = [
  "W.M. Silva",
  "K.P. Fernando",
  "R.D. Perera",
  "S.M. Jayasinghe",
  "H.L. Gunasekara",
  "A.N. Wijeratne",
  "M.R. Dissanayake",
  "T.K. Rajapakse"
]
