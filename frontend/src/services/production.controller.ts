/**
 * Crystallization API Controller
 * Handles all crystallization-related API requests
 */

import { BaseController } from './base-controller';
import {
  ActualMonthlyProductionRequest,
  ActualMonthlyProductionResponse,
  CreateProductionRequest,
  UpdateProductionRequest,
  ProductionMutationResponse,
  DeleteProductionResponse,
} from '@/types/production.types';

/**
 * Crystallization controller class
 */
class ProductionController extends BaseController {
  constructor() {
    super('/saltproductions');
  }

  /**
   * Get actual monthly productions
   * @param request - Start and end month for actual production data
   * @returns Actual monthly production data
   */
  async getActualMonthlyProductions(
    request: ActualMonthlyProductionRequest
  ): Promise<ActualMonthlyProductionResponse> {
    return this.get<ActualMonthlyProductionResponse>(
      `/?startMonth=${request.startMonth}&endMonth=${request.endMonth}`
    );
  }

  /**
   * Create a new production record
   * @param request - Production data to create
   * @returns Created production record
   */
  async createProduction(
    request: CreateProductionRequest
  ): Promise<ProductionMutationResponse> {
    return this.post<ProductionMutationResponse>('/', request);
  }

  /**
   * Update an existing production record
   * @param id - Production record ID
   * @param request - Updated production data
   * @returns Updated production record
   */
  async updateProduction(
    id: string,
    request: UpdateProductionRequest
  ): Promise<ProductionMutationResponse> {
    return this.patch<ProductionMutationResponse>(`/${id}`, request);
  }

  /**
   * Delete a production record
   * @param id - Production record ID
   * @returns Deletion confirmation
   */
  async deleteProduction(id: string): Promise<DeleteProductionResponse> {
    return this.delete<DeleteProductionResponse>(`/${id}`);
  }
}

/**
 * Singleton instance
 */
export const productionController = new ProductionController();
