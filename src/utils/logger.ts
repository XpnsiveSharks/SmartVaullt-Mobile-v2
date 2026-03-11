/**
 * Centralized Logging System
 *
 * Provides consistent logging across the application with different log levels
 * and context-aware logging for better debugging and monitoring.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  timestamp: string;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  minLevel: LogLevel;
  contextFilter?: string[];
}

class Logger {
  private config: LoggerConfig = {
    enableConsole: true,
    enableRemoteLogging: false,
    minLevel: __DEV__ ? 'debug' : 'warn',
  };

  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a log level should be processed
   */
  private shouldLog(level: LogLevel, context: string): boolean {
    // Check minimum level
    if (this.logLevels[level] < this.logLevels[this.config.minLevel]) {
      return false;
    }

    // Check context filter
    if (this.config.contextFilter && !this.config.contextFilter.includes(context)) {
      return false;
    }

    return true;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(level: LogLevel, context: string, message: string, data?: any): LogEntry {
    return {
      level,
      context,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process a log entry
   */
  private async processLog(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level, entry.context)) {
      return;
    }

    const formattedMessage = `[${entry.context}] ${entry.message}`;
    const logData = entry.data ? { data: entry.data } : {};

    // Console logging
    if (this.config.enableConsole) {
      switch (entry.level) {
        case 'debug':
          console.log(`🐛 ${formattedMessage}`, logData);
          break;
        case 'info':
          console.log(`ℹ️ ${formattedMessage}`, logData);
          break;
        case 'warn':
          console.warn(`⚠️ ${formattedMessage}`, logData);
          break;
        case 'error':
          console.error(`❌ ${formattedMessage}`, logData);
          break;
      }
    }

    // Remote logging (future implementation)
    if (this.config.enableRemoteLogging) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Send log to remote service (future implementation)
   */
  private sendToRemote(entry: LogEntry): void {
    // TODO: Implement remote logging service
    // This could send logs to a service like Sentry, LogRocket, or custom API
  }

  /**
   * Debug level logging
   */
  async debug(context: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('debug', context, message, data);
    await this.processLog(entry);
  }

  /**
   * Info level logging
   */
  async info(context: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('info', context, message, data);
    await this.processLog(entry);
  }

  /**
   * Warning level logging
   */
  async warn(context: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('warn', context, message, data);
    await this.processLog(entry);
  }

  /**
   * Error level logging
   */
  async error(context: string, message: string, error?: any): Promise<void> {
    const entry = this.createLogEntry('error', context, message, error);
    await this.processLog(entry);
  }

  /**
   * Log API requests
   */
  apiRequest(method: string, url: string, data?: any): void {
    this.debug('API', `${method} ${url}`, data);
  }

  /**
   * Log API responses
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : 'debug';
    this[level]('API', `${method} ${url} - ${status}`, data);
  }

  /**
   * Log user actions
   */
  userAction(action: string, context?: any): void {
    this.info('USER', action, context);
  }

  /**
   * Log service operations
   */
  serviceOperation(service: string, operation: string, data?: any): void {
    this.debug('SERVICE', `${service}.${operation}`, data);
  }

  /**
   * Log component lifecycle
   */
  componentLifecycle(component: string, lifecycle: string, data?: any): void {
    this.debug('COMPONENT', `${component}.${lifecycle}`, data);
  }

  /**
   * Log navigation events
   */
  navigation(from: string, to: string, params?: any): void {
    this.debug('NAVIGATION', `${from} → ${to}`, params);
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, context?: any): void {
    this.info('PERFORMANCE', `${operation} took ${duration}ms`, context);
  }
}

// Create singleton instance
const logger = new Logger();

// Export the logger instance
export { logger };

// Export convenience functions
export const log = {
  debug: async (context: string, message: string, data?: any) => await logger.debug(context, message, data),
  info: async (context: string, message: string, data?: any) => await logger.info(context, message, data),
  warn: async (context: string, message: string, data?: any) => await logger.warn(context, message, data),
  error: async (context: string, message: string, error?: any) => await logger.error(context, message, error),
  api: {
    request: (method: string, url: string, data?: any) => logger.apiRequest(method, url, data),
    response: (method: string, url: string, status: number, data?: any) => logger.apiResponse(method, url, status, data),
  },
  user: (action: string, context?: any) => logger.userAction(action, context),
  service: (service: string, operation: string, data?: any) => logger.serviceOperation(service, operation, data),
  component: (component: string, lifecycle: string, data?: any) => logger.componentLifecycle(component, lifecycle, data),
  navigation: (from: string, to: string, params?: any) => logger.navigation(from, to, params),
  performance: (operation: string, duration: number, context?: any) => logger.performance(operation, duration, context),
};

// Export logger instance for configuration
export { logger as Logger };
