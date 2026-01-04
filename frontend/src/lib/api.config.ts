/**
 * API Configuration
 * Central configuration for all API-related settings
 */

export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3400/api/v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // milliseconds
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  },
  
  // Token configuration
  TOKEN: {
    STORAGE_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_PREFIX: 'Bearer',
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      VALIDATE: '/auth/validate',
    },
    USER: {
      CREATE: '/user/create',
      UPDATE: '/user/update',
      DELETE: '/user/delete',
      GET: '/user',
    },
    // Add more endpoints as needed
  },
  
  // Headers
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json',
  },
} as const;

/**
 * Environment-specific settings
 */
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * API Response Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
