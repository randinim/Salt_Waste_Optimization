/**
 * useApi Hook
 * Generic hook for making API calls with loading, error, and data states
 */

'use client';

import { useState, useCallback } from 'react';
import { ApiError, ErrorHandler } from '@/lib/api-error';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T, P extends unknown[]> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Generic API hook
 */
export function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options?: UseApiOptions<T>
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError(String(err));
        const errorMessage = ErrorHandler.getUserMessage(apiError);
        
        setError(errorMessage);
        setData(null);

        if (options?.onError) {
          options.onError(apiError);
        }

        ErrorHandler.logError(apiError, 'useApi');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}
