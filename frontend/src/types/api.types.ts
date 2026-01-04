/**
 * API Type Definitions
 * Core TypeScript interfaces for API requests, responses, and errors
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    statusCode: number;
  };
  timestamp?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

/**
 * API Request Config
 */
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API Error Types
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Loading State
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * API Hook State
 */
export interface ApiHookState<T> extends LoadingState {
  data: T | null;
}
