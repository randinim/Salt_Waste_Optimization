import { HarvestPrediction, PricePrediction, DemandPrediction, ProfitProjection } from '@/dtos/compass/types';

// Generate realistic mock data for predictions
const getCurrentMonth = () => new Date().getMonth();
const getMonthName = (monthOffset: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = getCurrentMonth();
  const targetMonth = (currentMonth + monthOffset + 12) % 12;
  return months[targetMonth];
};

// Historical + Future Harvest Data (6 months past + 6 months future)
export const mockHarvestPredictions: HarvestPrediction[] = [
  // Historical data (past 6 months)
  { month: getMonthName(-6), tons: 42, isPrediction: false },
  { month: getMonthName(-5), tons: 48, isPrediction: false },
  { month: getMonthName(-4), tons: 55, isPrediction: false },
  { month: getMonthName(-3), tons: 52, isPrediction: false },
  { month: getMonthName(-2), tons: 47, isPrediction: false },
  { month: getMonthName(-1), tons: 50, isPrediction: false },
  // Future predictions (next 6 months)
  { month: getMonthName(0), tons: 53, isPrediction: true, confidence: 95 },
  { month: getMonthName(1), tons: 58, isPrediction: true, confidence: 90 },
  { month: getMonthName(2), tons: 62, isPrediction: true, confidence: 85 },
  { month: getMonthName(3), tons: 60, isPrediction: true, confidence: 80 },
  { month: getMonthName(4), tons: 55, isPrediction: true, confidence: 75 },
  { month: getMonthName(5), tons: 51, isPrediction: true, confidence: 70 },
];

// Price Predictions (historical + future)
export const mockPricePredictions: PricePrediction[] = [
  // Historical data
  { month: getMonthName(-6), avgPrice: 1650, minPrice: 1550, maxPrice: 1750, isPrediction: false },
  { month: getMonthName(-5), avgPrice: 1700, minPrice: 1600, maxPrice: 1800, isPrediction: false },
  { month: getMonthName(-4), avgPrice: 1750, minPrice: 1650, maxPrice: 1850, isPrediction: false },
  { month: getMonthName(-3), avgPrice: 1800, minPrice: 1700, maxPrice: 1900, isPrediction: false },
  { month: getMonthName(-2), avgPrice: 1820, minPrice: 1720, maxPrice: 1920, isPrediction: false },
  { month: getMonthName(-1), avgPrice: 1850, minPrice: 1750, maxPrice: 1950, isPrediction: false },
  // Future predictions
  { month: getMonthName(0), avgPrice: 1880, minPrice: 1750, maxPrice: 2000, isPrediction: true },
  { month: getMonthName(1), avgPrice: 1920, minPrice: 1780, maxPrice: 2050, isPrediction: true },
  { month: getMonthName(2), avgPrice: 1950, minPrice: 1800, maxPrice: 2100, isPrediction: true },
  { month: getMonthName(3), avgPrice: 1900, minPrice: 1750, maxPrice: 2050, isPrediction: true },
  { month: getMonthName(4), avgPrice: 1850, minPrice: 1700, maxPrice: 2000, isPrediction: true },
  { month: getMonthName(5), avgPrice: 1800, minPrice: 1650, maxPrice: 1950, isPrediction: true },
];

// Demand Predictions (historical + future)
export const mockDemandPredictions: DemandPrediction[] = [
  // Historical data
  { month: getMonthName(-6), demandTons: 180, isPrediction: false, trend: 'stable' },
  { month: getMonthName(-5), demandTons: 195, isPrediction: false, trend: 'increasing' },
  { month: getMonthName(-4), demandTons: 210, isPrediction: false, trend: 'increasing' },
  { month: getMonthName(-3), demandTons: 205, isPrediction: false, trend: 'stable' },
  { month: getMonthName(-2), demandTons: 215, isPrediction: false, trend: 'increasing' },
  { month: getMonthName(-1), demandTons: 220, isPrediction: false, trend: 'increasing' },
  // Future predictions
  { month: getMonthName(0), demandTons: 230, isPrediction: true, trend: 'increasing' },
  { month: getMonthName(1), demandTons: 245, isPrediction: true, trend: 'increasing' },
  { month: getMonthName(2), demandTons: 250, isPrediction: true, trend: 'increasing' },
  { month: getMonthName(3), demandTons: 240, isPrediction: true, trend: 'decreasing' },
  { month: getMonthName(4), demandTons: 225, isPrediction: true, trend: 'decreasing' },
  { month: getMonthName(5), demandTons: 210, isPrediction: true, trend: 'decreasing' },
];

// Profit Projections (based on predictions)
export const mockProfitProjections: ProfitProjection[] = [
  { month: getMonthName(0), projectedRevenue: 99640, projectedProfit: 71640, harvestRecommendation: 'good' },
  { month: getMonthName(1), projectedRevenue: 111360, projectedProfit: 83360, harvestRecommendation: 'optimal' },
  { month: getMonthName(2), projectedRevenue: 120900, projectedProfit: 92900, harvestRecommendation: 'optimal' },
  { month: getMonthName(3), projectedRevenue: 114000, projectedProfit: 86000, harvestRecommendation: 'optimal' },
  { month: getMonthName(4), projectedRevenue: 101750, projectedProfit: 73750, harvestRecommendation: 'good' },
  { month: getMonthName(5), projectedRevenue: 91800, projectedProfit: 63800, harvestRecommendation: 'fair' },
];

// Utility function to get optimal harvest month
export const getOptimalHarvestMonth = (): string => {
  const optimal = mockProfitProjections.reduce((best, current) => 
    current.projectedProfit > best.projectedProfit ? current : best
  );
  return optimal.month;
};

// Utility function to get profit range
export const getProfitRange = (): { min: number; max: number } => {
  const profits = mockProfitProjections.map(p => p.projectedProfit);
  return {
    min: Math.min(...profits),
    max: Math.max(...profits),
  };
};
