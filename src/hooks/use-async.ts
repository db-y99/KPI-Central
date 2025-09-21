'use client';

import { useState, useEffect, useCallback } from 'react';
import { errorHandler } from '@/lib/error-handler';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  context?: {
    component?: string;
    action?: string;
    userId?: string;
  };
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      // Log error using our error handler
      errorHandler.logError(error, options.context);
      
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Hook for managing multiple async operations
export function useAsyncQueue<T>() {
  const [queue, setQueue] = useState<Array<{
    id: string;
    promise: Promise<T>;
    status: 'pending' | 'resolved' | 'rejected';
    result?: T;
    error?: Error;
  }>>([]);

  const addToQueue = useCallback(async (
    asyncFunction: () => Promise<T>,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
    }
  ): Promise<T | null> => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const promise = asyncFunction();
    
    const queueItem = {
      id,
      promise,
      status: 'pending' as const,
    };
    
    setQueue(prev => [...prev, queueItem]);

    try {
      const result = await promise;
      setQueue(prev => prev.map(item => 
        item.id === id 
          ? { ...item, status: 'resolved' as const, result }
          : item
      ));
      return result;
    } catch (error) {
      const err = error as Error;
      setQueue(prev => prev.map(item => 
        item.id === id 
          ? { ...item, status: 'rejected' as const, error: err }
          : item
      ));
      
      errorHandler.logError(err, context);
      return null;
    }
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    queue,
    addToQueue,
    clearQueue,
    removeFromQueue,
    pendingCount: queue.filter(item => item.status === 'pending').length,
    resolvedCount: queue.filter(item => item.status === 'resolved').length,
    rejectedCount: queue.filter(item => item.status === 'rejected').length,
  };
}

// Hook for debounced async operations
export function useDebouncedAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  delay: number = 300,
  options: UseAsyncOptions = {}
): UseAsyncState<T> {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const asyncState = useAsync(asyncFunction, { ...options, immediate: false });

  const debouncedExecute = useCallback((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      asyncState.execute(...args);
    }, delay);

    setDebounceTimer(timer);
  }, [asyncState.execute, delay]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    ...asyncState,
    execute: debouncedExecute,
  };
}

// Hook for retry logic
export function useRetryableAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  options: UseAsyncOptions = {}
): UseAsyncState<T> & { retryCount: number; retry: () => void } {
  const [retryCount, setRetryCount] = useState(0);
  const asyncState = useAsync(asyncFunction, options);

  const executeWithRetry = useCallback(async (...args: any[]): Promise<T | null> => {
    let currentRetryCount = 0;
    
    while (currentRetryCount <= maxRetries) {
      try {
        const result = await asyncFunction(...args);
        setRetryCount(0);
        return result;
      } catch (error) {
        currentRetryCount++;
        setRetryCount(currentRetryCount);
        
        if (currentRetryCount > maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetryCount));
      }
    }
    
    return null;
  }, [asyncFunction, maxRetries, retryDelay]);

  const retry = useCallback(() => {
    if (asyncState.error) {
      executeWithRetry();
    }
  }, [asyncState.error, executeWithRetry]);

  return {
    ...asyncState,
    execute: executeWithRetry,
    retryCount,
    retry,
  };
}
