type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// interface LogEntry {
//   level: LogLevel;
//   message: string;
//   data?: any;
//   timestamp: string;
//   context?: string;
// }

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private enabledLevels: Set<LogLevel> = new Set(['info', 'warn', 'error']);

  constructor() {
    if (this.isDevelopment) {
      this.enabledLevels.add('debug');
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, context);
      if (data) {
        console.debug(formatted, data);
      } else {
        console.debug(formatted);
      }
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, context);
      if (data) {
        console.info(formatted, data);
      } else {
        console.info(formatted);
      }
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, context);
      if (data) {
        console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  }

  error(message: string, error?: any, context?: string): void {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message, context);
      if (error) {
        console.error(formatted, error);
      } else {
        console.error(formatted);
      }
    }
  }

  search(message: string, data?: any): void {
    this.debug(message, data, 'Search');
  }

  analytics(message: string, data?: any): void {
    this.debug(message, data, 'Analytics');
  }

  storage(message: string, error?: any): void {
    this.warn(message, error, 'Storage');
  }
}

export const logger = new Logger();