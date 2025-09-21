/**
 * Centralized error handling utilities
 */

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogs: ErrorLog[] = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Log an error with context
   */
  public logError(
    error: Error | string,
    context?: {
      userId?: string;
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      ...context,
    };

    this.errorLogs.push(errorLog);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(errorLog);
    }
  }

  /**
   * Log a warning
   */
  public logWarning(
    message: string,
    context?: {
      userId?: string;
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warning',
      message,
      ...context,
    };

    this.errorLogs.push(warningLog);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning logged:', warningLog);
    }
  }

  /**
   * Log an info message
   */
  public logInfo(
    message: string,
    context?: {
      userId?: string;
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      ...context,
    };

    this.errorLogs.push(infoLog);
    
    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', infoLog);
    }
  }

  /**
   * Get error logs
   */
  public getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  public clearLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Handle API errors
   */
  public handleApiError(error: any, endpoint: string): void {
    this.logError(error, {
      component: 'API',
      action: `Call to ${endpoint}`,
      metadata: {
        endpoint,
        status: error.status || error.statusCode,
        response: error.response?.data || error.message,
      },
    });
  }

  /**
   * Handle Firebase errors
   */
  public handleFirebaseError(error: any, operation: string): void {
    this.logError(error, {
      component: 'Firebase',
      action: operation,
      metadata: {
        code: error.code,
        message: error.message,
      },
    });
  }

  /**
   * Handle validation errors
   */
  public handleValidationError(error: any, formName: string): void {
    this.logError(error, {
      component: 'Validation',
      action: `Form validation for ${formName}`,
      metadata: {
        formName,
        validationErrors: error.errors || error.message,
      },
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send to external logging service
   */
  private async sendToLoggingService(errorLog: ErrorLog): Promise<void> {
    try {
      // In production, you would send to services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Custom logging endpoint
      
      // For now, we'll just store in localStorage for persistence
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs.slice(-100))); // Keep last 100 logs
    } catch (err) {
      console.error('Failed to send error to logging service:', err);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error handling patterns
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
  }
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    errorHandler.logError(error as Error, context);
    return null;
  }
};

export const handleSyncError = <T>(
  syncFn: () => T,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
  }
): T | null => {
  try {
    return syncFn();
  } catch (error) {
    errorHandler.logError(error as Error, context);
    return null;
  }
};

// React error boundary helper
export const createErrorBoundary = (componentName: string) => {
  return (error: Error, errorInfo: any) => {
    errorHandler.logError(error, {
      component: componentName,
      action: 'React Error Boundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  };
};
