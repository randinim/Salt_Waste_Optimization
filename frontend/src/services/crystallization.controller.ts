/**
 * Crystallization API Controller
 * Handles all crystallization-related API requests
 */

import { BaseController } from './base-controller';
import {
  DailyMeasurementRequest,
  DailyMeasurementResponse,
  DailyMeasurementGetRequest,
  DailyMeasurementGetResponse,
  PredictedDailyMeasurementGetRequest,
  PredictedDailyMeasurementGetResponse,
  PredictedMonthlyProductionRequest,
  PredictedMonthlyProductionResponse,
} from '@/types/crystallization.types';

/**
 * Crystallization controller class
 */
class CrystallizationController extends BaseController {
  constructor() {
    super('/crystallization');
  }

  /**
   * Get predicted monthly productions
   * @param request - Start and end month for predictions
   * @returns Predicted monthly production data
   */
  async getPredictedMonthlyProductions(
    request: PredictedMonthlyProductionRequest
  ): Promise<PredictedMonthlyProductionResponse> {
    return this.get<PredictedMonthlyProductionResponse>(
      `/predicted-monthly-productions?startMonth=${request.startMonth}&endMonth=${request.endMonth}`
    );
  }

  /**
   * Create daily measurement
   * @param request - Daily measurement data
   * @returns Response with success status
   */
  async createDailyMeasurement(
    request: DailyMeasurementRequest
  ): Promise<DailyMeasurementResponse> {
    return this.post<DailyMeasurementResponse, DailyMeasurementRequest>(
      '/daily-measurement',
      request
    );
  }

  /**
   * Get daily measurements (historical data)
   * @param request - Start and end date for measurements
   * @returns Daily measurement data
   */
  async getDailyMeasurements(
    request: DailyMeasurementGetRequest
  ): Promise<DailyMeasurementGetResponse> {
    return this.get<DailyMeasurementGetResponse>(
      `/daily-measurement?startDate=${request.startDate}&endDate=${request.endDate}`
    );
  }

  /**
   * Get predicted daily measurements
   * @param request - Start and end date for predictions
   * @returns Predicted daily measurement data
   */
  async getPredictedDailyMeasurements(
    request: PredictedDailyMeasurementGetRequest
  ): Promise<PredictedDailyMeasurementGetResponse> {
    return this.get<PredictedDailyMeasurementGetResponse>(
      `/predicted-daily-measurement?startDate=${request.startDate}&endDate=${request.endDate}`
    );
  }
}

/**
 * Singleton instance
 */
export const crystallizationController = new CrystallizationController();
