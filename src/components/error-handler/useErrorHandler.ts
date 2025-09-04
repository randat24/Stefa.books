"use client";

import { useState, useCallback } from 'react';
import type { UserFacingError } from '@/lib/error-handler';

export function useErrorHandler() {
  const [error, setError] = useState<UserFacingError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((userError: UserFacingError) => {
    setError(userError);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        clearError();
        const result = await asyncFn();
        setIsLoading(false);
        return result;
      } catch (err) {
        // In a real implementation, you would convert the error to UserFacingError
        // For now, we'll just log it
        console.error('Unhandled error in withErrorHandling:', err);
        setIsLoading(false);
        return undefined;
      }
    },
    [clearError]
  );

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling
  };
}