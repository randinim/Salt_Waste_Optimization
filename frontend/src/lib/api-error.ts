/**
 * API Error Handling
 * Custom error classes and utilities for consistent error management
 */

import { ApiErrorType } from '@/types/api.types';
import { HTTP_STATUS } from './api.config';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Error factory - creates appropriate error based on status code
 */
export class ApiErrorFactory {
  static createFromResponse(
    statusCode: number,
    message: string,
    details?: Record<string, unknown>
  ): ApiError {
    switch (statusCode) {
      case HTTP_STATUS.BAD_REQUEST:
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return new ApiError(
          message || 'Invalid request data',
          ApiErrorType.VALIDATION_ERROR,
          statusCode,
          details
        );

      case HTTP_STATUS.UNAUTHORIZED:
        return new ApiError(
          message || 'Authentication required',
          ApiErrorType.AUTHENTICATION_ERROR,
          statusCode,
          details
        );

      case HTTP_STATUS.FORBIDDEN:
        return new ApiError(
          message || 'Access forbidden',
          ApiErrorType.AUTHORIZATION_ERROR,
          statusCode,
          details
        );

      case HTTP_STATUS.NOT_FOUND:
        return new ApiError(
          message || 'Resource not found',
          ApiErrorType.NOT_FOUND_ERROR,
          statusCode,
          details
        );

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return new ApiError(
          message || 'Server error occurred',
          ApiErrorType.SERVER_ERROR,
          statusCode,
          details
        );

      default:
        return new ApiError(
          message || 'An unexpected error occurred',
          ApiErrorType.UNKNOWN_ERROR,
          statusCode,
          details
        );
    }
  }

  static createNetworkError(message?: string): ApiError {
    return new ApiError(
      message || 'Network error - please check your connection',
      ApiErrorType.NETWORK_ERROR,
      0
    );
  }

  static createTimeoutError(message?: string): ApiError {
    return new ApiError(
      message || 'Request timeout - please try again',
      ApiErrorType.TIMEOUT_ERROR,
      408
    );
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ApiError): string {
    const messages: Record<ApiErrorType, string> = {
      [ApiErrorType.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
      [ApiErrorType.TIMEOUT_ERROR]: 'Request took too long. Please try again.',
      [ApiErrorType.VALIDATION_ERROR]: error.message || 'Please check your input and try again.',
      [ApiErrorType.AUTHENTICATION_ERROR]: 'Please log in to continue.',
      [ApiErrorType.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
      [ApiErrorType.NOT_FOUND_ERROR]: 'The requested resource was not found.',
      [ApiErrorType.SERVER_ERROR]: 'Server error. Please try again later.',
      [ApiErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    };

    return messages[error.type] || error.message;
  }

  /**
   * Log error (in development)
   */
  static logError(error: ApiError, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 API Error${context ? ` - ${context}` : ''}`);
      console.error('Type:', error.type);
      console.error('Status:', error.statusCode);
      console.error('Message:', error.message);
      if (error.details) {
        console.error('Details:', error.details);
      }
      console.error('Timestamp:', error.timestamp);
      console.groupEnd();
    }
  }

  /**
   * Check if error should trigger logout
   */
  static shouldLogout(error: ApiError): boolean {
    return error.type === ApiErrorType.AUTHENTICATION_ERROR;
  }
}
