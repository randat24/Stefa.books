"use client";

import { useCallback } from 'react';
import { errorTracker, ErrorDetails } from '@/lib/error-tracker';

export function useErrorTracking() {
  /**
   * Track an error with context and metadata
   */
  const trackError = useCallback((
    error: Error | string, 
    context?: Record<string, any>,
    metadata?: Record<string, any>
  ): string => {
    return errorTracker.addError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      metadata,
      severity: 'medium',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    });
  }, []);

  /**
   * Get error metrics and statistics
   */
  const getErrorMetrics = useCallback(() => {
    return errorTracker.getMetrics();
  }, []);

  /**
   * Get specific error details
   */
  const getErrorDetails = useCallback((errorId: string): ErrorDetails | undefined => {
    return errorTracker.getErrors().find(error => error.id === errorId);
  }, []);

  /**
   * Get errors by category
   */
  const getErrorsByCategory = useCallback((category: string): ErrorDetails[] => {
    return errorTracker.getErrors().filter(error => error.category === category);
  }, []);

  /**
   * Get errors by severity
   */
  const getErrorsBySeverity = useCallback((severity: string): ErrorDetails[] => {
    return errorTracker.getErrors().filter(error => error.severity === severity);
  }, []);

  /**
   * Clear all errors (not implemented in current ErrorTracker)
   */
  const clearErrors = useCallback(() => {
    // ErrorTracker doesn't have a clear method, so this is a no-op
    console.warn('clearErrors is not implemented in the current ErrorTracker');
  }, []);

  return {
    trackError,
    getErrorMetrics,
    getErrorDetails,
    getErrorsByCategory,
    getErrorsBySeverity,
    clearErrors
  };
}
