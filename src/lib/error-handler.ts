import { logger } from './logger';

// ============================================================================
// SIMPLIFIED ERROR HANDLING SERVICE
// ============================================================================

export interface UserFacingError {
  id: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'api' | 'database' | 'auth' | 'network' | 'ui' | 'unknown';
  action?: string;
  technicalDetails?: string;
  timestamp: number;
}

export interface ErrorHandlerContext {
  user?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  environment?: string;
  version?: string;
}

class ErrorHandler {
  private userFacingMessages: Map<string, string> = new Map();
  private suggestedActions: Map<string, string> = new Map();

  constructor() {
    this.initializeUserMessages();
  }

  /**
   * Handle an error with centralized processing
   */
  handleError(
    error: Error | string,
    context: Partial<ErrorHandlerContext> = {},
    metadata: Record<string, any> = {}
  ): UserFacingError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine category and severity
    const category = this.determineCategory(error);
    const severity = this.determineSeverity(error, category);
    
    // Generate user-facing error message
    const userMessage = this.generateUserMessage(error, category, severity);
    const action = this.getSuggestedAction(category);
    
    // Create user-facing error object
    const userFacingError: UserFacingError = {
      id: errorId,
      message: errorMessage,
      userMessage,
      severity,
      category,
      action,
      timestamp: Date.now()
    };

    // Add technical details in development
    if (process.env.NODE_ENV === 'development') {
      userFacingError.technicalDetails = error instanceof Error ? error.stack : errorMessage;
    }

    // Log the error
    logger.error('Error handled', {
      errorId: userFacingError.id,
      message: userFacingError.message,
      userMessage: userFacingError.userMessage,
      severity: userFacingError.severity,
      category: userFacingError.category,
      context,
      metadata
    });

    return userFacingError;
  }

  /**
   * Create a user-facing error without tracking (for known errors)
   */
  createUserError(
    id: string,
    message: string,
    userMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    category: UserFacingError['category'] = 'unknown',
    action?: string
  ): UserFacingError {
    return {
      id,
      message,
      userMessage,
      severity,
      category,
      action,
      timestamp: Date.now()
    };
  }

  /**
   * Determine error category
   */
  private determineCategory(error: Error | string): UserFacingError['category'] {
    if (typeof error === 'string') return 'unknown';
    
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    if (name.includes('fetch') || name.includes('network') || message.includes('network')) {
      return 'network';
    }
    if (name.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (name.includes('database') || message.includes('database') || message.includes('sql')) {
      return 'database';
    }
    if (name.includes('api') || message.includes('api')) {
      return 'api';
    }
    if (name.includes('render') || name.includes('component')) {
      return 'ui';
    }
    
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error | string, category: UserFacingError['category']): UserFacingError['severity'] {
    if (typeof error === 'string') return 'medium';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (message.includes('timeout') || message.includes('connection')) {
      return 'high';
    }
    if (category === 'auth' || category === 'database') {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Generate user-facing message based on error details
   */
  private generateUserMessage(error: Error | string, category: UserFacingError['category'], severity: UserFacingError['severity']): string {
    const errorType = typeof error === 'string' ? 'StringError' : error.name;
    
    // Check if we have a custom user message for this error type
    if (this.userFacingMessages.has(errorType)) {
      return this.userFacingMessages.get(errorType)!;
    }

    // Generate message based on category and severity
    switch (category) {
      case 'api':
        if (severity === 'critical') {
          return 'Серверна помилка. Спробуйте пізніше.';
        }
        return 'Помилка з\'єднання з сервером. Перевірте інтернет-з\'єднання.';
        
      case 'database':
        return 'Помилка бази даних. Спробуйте оновити сторінку.';
        
      case 'auth':
        if (severity === 'critical') {
          return 'Помилка автентифікації. Увійдіть знову.';
        }
        return 'Помилка доступу. Перевірте свої облікові дані.';
        
      case 'network':
        return 'Проблеми з мережею. Перевірте інтернет-з\'єднання.';
        
      case 'ui':
        return 'Помилка інтерфейсу. Спробуйте оновити сторінку.';
        
      default:
        // Generate message based on severity
        switch (severity) {
          case 'critical':
            return 'Критична помилка. Спробуйте пізніше.';
          case 'high':
            return 'Серйозна помилка. Спробуйте оновити сторінку.';
          case 'medium':
            return 'Помилка. Спробуйте повторити дію.';
          default:
            return 'Невідома помилка. Спробуйте оновити сторінку.';
        }
    }
  }

  /**
   * Get suggested action for user based on error details
   */
  private getSuggestedAction(category: UserFacingError['category']): string | undefined {
    switch (category) {
      case 'api':
        return 'Оновити сторінку';
      case 'auth':
        return 'Увійти знову';
      case 'network':
        return 'Перевірити з\'єднання';
      case 'ui':
        return 'Оновити сторінку';
      default:
        return 'Спробувати знову';
    }
  }

  /**
   * Initialize common user-facing error messages
   */
  private initializeUserMessages(): void {
    // API errors
    this.userFacingMessages.set('FetchError', 'Помилка з\'єднання з сервером.');
    this.userFacingMessages.set('TimeoutError', 'Час очікування вичерпано. Спробуйте пізніше.');
    
    // Auth errors
    this.userFacingMessages.set('AuthError', 'Помилка автентифікації. Увійдіть знову.');
    this.userFacingMessages.set('PermissionError', 'Недостатньо прав для виконання дії.');
    
    // Network errors
    this.userFacingMessages.set('NetworkError', 'Проблеми з мережею. Перевірте інтернет-з\'єднання.');
    
    // Database errors
    this.userFacingMessages.set('DatabaseError', 'Помилка бази даних. Спробуйте пізніше.');
    
    // UI errors
    this.userFacingMessages.set('RenderError', 'Помилка відображення. Оновіть сторінку.');
    
    // Suggested actions
    this.suggestedActions.set('FetchError', 'Перевірити з\'єднання');
    this.suggestedActions.set('TimeoutError', 'Спробувати знову');
    this.suggestedActions.set('AuthError', 'Увійти знову');
    this.suggestedActions.set('PermissionError', 'Перевірити права доступу');
    this.suggestedActions.set('NetworkError', 'Перевірити з\'єднання');
    this.suggestedActions.set('DatabaseError', 'Оновити сторінку');
    this.suggestedActions.set('RenderError', 'Оновити сторінку');
  }

  /**
   * Add custom user-facing message for an error type
   */
  addUserMessage(errorType: string, message: string, action?: string): void {
    this.userFacingMessages.set(errorType, message);
    if (action) {
      this.suggestedActions.set(errorType, action);
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Convenience function for handling errors in async functions
export async function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  context?: Partial<ErrorHandlerContext>,
  metadata?: Record<string, any>
): Promise<T | UserFacingError> {
  try {
    return await asyncFn();
  } catch (error) {
    return errorHandler.handleError(error as Error | string, context, metadata);
  }
}

// Convenience function for handling errors in sync functions
export function handleSyncError<T>(
  syncFn: () => T,
  context?: Partial<ErrorHandlerContext>,
  metadata?: Record<string, any>
): T | UserFacingError {
  try {
    return syncFn();
  } catch (error) {
    return errorHandler.handleError(error as Error | string, context, metadata);
  }
}

