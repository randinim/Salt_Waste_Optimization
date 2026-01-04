/**
 * Crystallization API Type Definitions
 */

/**
 * Predicted Monthly Production Request
 */
export interface PredictedMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string;   // Format: "YYYY-MM"
}

/**
 * Actual Monthly Production Request
 */
export interface ActualMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string;   // Format: "YYYY-MM"
}

/**
 * Predicted Monthly Production Data from API
 */
export interface PredictedMonthlyProductionData {
  _id: string;
  month: string; // Format: "YYYY-MM"
  monthNumber: number;
  productionForecast: number;
  lowerBound: number;
  upperBound: number;
  season: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chart Data Point for Monthly Production
 */
export interface PredictedMonthlyProduction {
  month: string;
  production: number | null;
  predicted: number | null;
  type: "historical" | "predicted" | "gap";
}

/**
 * Predicted Monthly Production Response
 */
export interface PredictedMonthlyProductionResponse {
  success: boolean;
  message: string;
  data: PredictedMonthlyProductionData[];
}

/**
 * Daily Measurement Request
 */
export interface DailyMeasurementRequest {
  date: string; // Format: "YYYY-MM-DD"
  waterTemperature: number;
  lagoon: number;
  orBrineLevel: number;
  orBoundLevel: number;
  irBrineLevel: number;
  irBoundLevel: number;
  eastChannel: number;
  westChannel: number;
}

/**
 * Daily Measurement Response (for POST)
 */
export interface DailyMeasurementResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Daily Measurement GET Request
 */
export interface DailyMeasurementGetRequest {
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string;   // Format: "YYYY-MM-DD"
}

/**
 * Daily Measurement Parameters from API
 */
export interface DailyMeasurementParameters {
  water_temperature: number;
  lagoon: number;
  OR_brine_level: number;
  OR_bund_level: number;
  IR_brine_level: number;
  IR_bound_level: number;
  East_channel: number;
  West_channel: number;
}

/**
 * Weather Data from API
 */
export interface WeatherData {
  temperature_mean: number;
  temperature_min: number;
  temperature_max: number;
  rain_sum: number;
  wind_speed_max: number;
  wind_gusts_max: number;
  relative_humidity_mean: number;
}

/**
 * Daily Measurement Data Item from API
 */
export interface DailyMeasurementDataItem {
  _id: {
    $oid: string;
  };
  date: string;
  dayNumber: number;
  parameters: DailyMeasurementParameters;
  weather: WeatherData;
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
}

/**
 * Daily Measurement GET Response
 */
export interface DailyMeasurementGetResponse {
  success: boolean;
  message: string;
  data: DailyMeasurementDataItem[];
}

/**
 * Predicted Daily Measurement GET Request
 */
export interface PredictedDailyMeasurementGetRequest {
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string;   // Format: "YYYY-MM-DD"
}

/**
 * Predicted Daily Measurement GET Response
 */
export interface PredictedDailyMeasurementGetResponse {
  success: boolean;
  message: string;
  data: DailyMeasurementDataItem[];
}

/**
 * Chart Data Point for Daily Environmental Data
 */
export interface DailyEnvironmentalChartData {
  date: string;
  period: string;
  water_temperature: number | null;
  lagoon: number | null;
  OR_brine_level: number | null;
  OR_bund_level: number | null;
  IR_brine_level: number | null;
  IR_bound_level: number | null;
  East_channel: number | null;
  West_channel: number | null;
  rainfall: number | null;
  temperature: number | null;
  humidity: number | null;
  type: 'historical' | 'predicted';
}
