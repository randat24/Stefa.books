import { ErrorMetrics, ErrorDetails } from '@/lib/error-tracker';

// Error tracking API client
class ErrorTrackingClient {
  private baseUrl = '/api/errors';

  /**
   * Get error metrics and statistics
   */
  async getMetrics(): Promise<ErrorMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}?action=metrics`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch error metrics');
      }
      return result.data;
    } catch (error) {
      console.error('Error fetching error metrics:', error);
      throw error;
    }
  }

  /**
   * Get all errors
   */
  async getAllErrors(): Promise<ErrorDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=all`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch all errors');
      }
      return result.data;
    } catch (error) {
      console.error('Error fetching all errors:', error);
      throw error;
    }
  }

  /**
   * Get errors by category
   */
  async getErrorsByCategory(category: string): Promise<ErrorDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=by-category&category=${encodeURIComponent(category)}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch errors by category');
      }
      return result.data;
    } catch (error) {
      console.error('Error fetching errors by category:', error);
      throw error;
    }
  }

  /**
   * Get errors by severity
   */
  async getErrorsBySeverity(severity: string): Promise<ErrorDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=by-severity&severity=${encodeURIComponent(severity)}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch errors by severity');
      }
      return result.data;
    } catch (error) {
      console.error('Error fetching errors by severity:', error);
      throw error;
    }
  }

  /**
   * Get specific error details
   */
  async getErrorDetails(errorId: string): Promise<ErrorDetails | null> {
    try {
      const response = await fetch(`${this.baseUrl}?action=details&id=${encodeURIComponent(errorId)}`);
      const result = await response.json();
      if (!result.success) {
        if (result.error === 'Error not found') {
          return null;
        }
        throw new Error(result.error || 'Failed to fetch error details');
      }
      return result.data;
    } catch (error) {
      console.error('Error fetching error details:', error);
      throw error;
    }
  }

  /**
   * Track a new error
   */
  async trackError(
    error: string | { message: string; stack?: string }, 
    context?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({ error, context, metadata }) });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to track error');
      }
      return result.data.errorId;
    } catch (error) {
      console.error('Error tracking error:', error);
      throw error;
    }
  }

  /**
   * Clear all errors
   */
  async clearAllErrors(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?action=clear-all`, {
        method: 'DELETE' });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear errors');
      }
    } catch (error) {
      console.error('Error clearing errors:', error);
      throw error;
    }
  }

  /**
   * Export all errors as CSV
   */
  async exportErrors(): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}?action=export`);
      if (!response.ok) {
        throw new Error('Failed to export errors');
      }
      return await response.blob();
    } catch (error) {
      console.error('Error exporting errors:', error);
      throw error;
    }
  }
}

export const errorClient = new ErrorTrackingClient();