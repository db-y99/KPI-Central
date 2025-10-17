'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorHandler } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Ensure we have a valid error object
    const errorToLog = error || new Error('Unknown error caught by ErrorBoundary');
    
    // Log error using our error handler with more context
    errorHandler.logError(errorToLog, {
      component: 'ErrorBoundary',
      action: 'React Error Boundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: errorInfo.errorBoundary,
        },
        originalError: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          toString: error?.toString?.(),
        },
      },
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(errorToLog, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Đã xảy ra lỗi
              </CardTitle>
              <CardDescription className="text-gray-600">
                Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-gray-100 p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Chi tiết lỗi:</h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Tải lại trang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: {
    component?: string;
    action?: string;
    userId?: string;
  }) => {
    errorHandler.logError(error, context);
  }, []);

  const handleAsyncError = React.useCallback(
    <T,>(
      asyncFn: () => Promise<T>,
      context?: {
        component?: string;
        action?: string;
        userId?: string;
      }
    ): Promise<T | null> => {
      return (async () => {
        try {
          return await asyncFn();
        } catch (error) {
          errorHandler.logError(error as Error, context);
          return null;
        }
      })();
    },
    []
  );

  return {
    handleError,
    handleAsyncError,
  };
};
