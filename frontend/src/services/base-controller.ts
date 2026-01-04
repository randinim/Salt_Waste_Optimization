/**
 * Base API Controller
 * Abstract base class providing common functionality for all API controllers
 */

import { httpClient } from '@/lib/http-client';
import { AxiosRequestConfig } from 'axios';

/**
 * Base controller class
 */
export abstract class BaseController {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build full URL with base path
   */
  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * GET request
   */
  protected async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.get<T>(this.buildUrl(path), config);
  }

  /**
   * POST request
   */
  protected async post<T, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return httpClient.post<T, D>(this.buildUrl(path), data, config);
  }

  /**
   * PUT request
   */
  protected async put<T, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return httpClient.put<T, D>(this.buildUrl(path), data, config);
  }

  /**
   * PATCH request
   */
  protected async patch<T, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return httpClient.patch<T, D>(this.buildUrl(path), data, config);
  }

  /**
   * DELETE request
   */
  protected async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.delete<T>(this.buildUrl(path), config);
  }
}
