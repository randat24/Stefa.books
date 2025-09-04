import { errorHandler, handleAsyncError, handleSyncError } from './error-handler';

describe('ErrorHandler', () => {
  // Note: clearErrors method not available in current ErrorHandler implementation

  describe('handleError', () => {
    it('should handle string errors', () => {
      const error = 'Test error message';
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toBe(error);
      expect(result.userMessage).toContain('Невідома помилка');
      expect(result.id).toBeDefined();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error object');
      const result = errorHandler.handleError(error);
      
      expect(result).toBeDefined();
      expect(result.message).toBe(error.message);
      expect(result.userMessage).toContain('Невідома помилка');
      expect(result.id).toBeDefined();
    });

    it('should generate appropriate user messages for API errors', () => {
      const error = new Error('Network request failed');
      const result = errorHandler.handleError(error, {}, { category: 'api' });
      
      expect(result.userMessage).toContain('з\'єднання з сервером');
    });

    it('should generate appropriate user messages for auth errors', () => {
      const error = new Error('Authentication failed');
      const result = errorHandler.handleError(error, {}, { category: 'auth' });
      
      expect(result.userMessage).toContain('Помилка доступу');
    });

    it('should include suggested actions', () => {
      const error = new Error('Network error');
      const result = errorHandler.handleError(error, {}, { category: 'network' });
      
      expect(result.action).toBe('Перевірити з\'єднання');
    });
  });

  describe('createUserError', () => {
    it('should create user-facing error with custom message', () => {
      const result = errorHandler.createUserError(
        'test-id',
        'Technical error message',
        'User-friendly message',
        'high',
        'api',
        'Try again'
      );
      
      expect(result.id).toBe('test-id');
      expect(result.message).toBe('Technical error message');
      expect(result.userMessage).toBe('User-friendly message');
      expect(result.severity).toBe('high');
      expect(result.category).toBe('api');
      expect(result.action).toBe('Try again');
    });
  });

  describe('handleAsyncError', () => {
    it('should return result for successful async function', async () => {
      const asyncFn = async () => 'success';
      const result = await handleAsyncError(asyncFn);
      
      expect(result).toBe('success');
    });

    it('should return UserFacingError for failed async function', async () => {
      const asyncFn = async () => { throw new Error('Test error'); };
      const result = await handleAsyncError(asyncFn);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      if (typeof result === 'object' && result !== null && 'userMessage' in result) {
        expect(result.userMessage).toContain('Невідома помилка');
      }
    });
  });

  describe('handleSyncError', () => {
    it('should return result for successful sync function', () => {
      const syncFn = () => 'success';
      const result = handleSyncError(syncFn);
      
      expect(result).toBe('success');
    });

    it('should return UserFacingError for failed sync function', () => {
      const syncFn = () => { throw new Error('Test error'); };
      const result = handleSyncError(syncFn);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      if (typeof result === 'object' && result !== null && 'userMessage' in result) {
        expect(result.userMessage).toContain('Невідома помилка');
      }
    });
  });

  // Note: getErrorMetrics method not available in current ErrorHandler implementation
});