import { logger } from '@/lib/logger';

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn() };

// Mock process.env
const originalEnv = process.env.NODE_ENV;

beforeAll(() => {
  global.console = mockConsole as any;
});

afterAll(() => {
  // Restore original NODE_ENV by deleting and re-setting
  delete (process.env as any).NODE_ENV;
  if (originalEnv) {
    (process.env as any).NODE_ENV = originalEnv;
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Logger', () => {
  describe('Development environment', () => {
    beforeEach(() => {
      delete (process.env as any).NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
    });

    it('should log debug messages in development', () => {
      logger.debug('Test debug message', { data: 'test' });
      
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG'),
        { data: 'test' }
      );
    });

    it('should format messages with timestamp and level', () => {
      logger.info('Test info message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO Test info message/)
      );
    });

    it('should include context when provided', () => {
      logger.search('Search performed', { query: 'test' });
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[Search]'),
        { query: 'test' }
      );
    });
  });

  describe('Production environment', () => {
    beforeEach(() => {
      delete (process.env as any).NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      jest.clearAllMocks();
    });

    it('should not log debug messages in production', () => {
      logger.debug('Debug message that should not appear');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should log info, warn, and error messages in production', () => {
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Specialized logging methods', () => {
    beforeEach(() => {
      delete (process.env as any).NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      jest.clearAllMocks();
    });

    it('should use correct context for search logging', () => {
      logger.search('Search completed', { results: 5 });
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[Search]'),
        { results: 5 }
      );
    });

    it('should use correct context for analytics logging', () => {
      logger.analytics('Analytics event', { event: 'click' });
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics]'),
        { event: 'click' }
      );
    });

    it('should use correct context for storage logging', () => {
      logger.storage('Storage error', new Error('Failed'));
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[Storage]'),
        expect.any(Error)
      );
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      delete (process.env as any).NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      jest.clearAllMocks();
    });

    it('should handle messages without data', () => {
      logger.info('Simple message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Simple message')
      );
    });

    it('should handle error objects properly', () => {
      const testError = new Error('Test error');
      logger.error('Error occurred', testError);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred'),
        testError
      );
    });
  });
});