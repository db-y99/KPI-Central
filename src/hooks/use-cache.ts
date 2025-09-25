import { useState, useEffect, useCallback, useMemo } from 'react';

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache class for client-side caching
class ClientCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? Date.now() <= entry.expiresAt : false;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const globalCache = new ClientCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  globalCache.cleanup();
}, 5 * 60 * 1000);

// Custom hook for cached data fetching
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    refetchOnMount?: boolean;
  } = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refetchOnMount = true
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cachedData = globalCache.get<T>(key);
    if (cachedData && !refetchOnMount) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      globalCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttl, enabled, refetchOnMount]);

  const refetch = useCallback(async () => {
    globalCache.delete(key);
    await fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
}

// Hook for paginated data with caching
export function usePaginatedData<T>(
  key: string,
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  options: {
    pageSize?: number;
    ttl?: number;
    enabled?: boolean;
  } = {}
): {
  data: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const {
    pageSize = 10,
    ttl = 5 * 60 * 1000,
    enabled = true
  } = options;

  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    if (!enabled) return;

    const cacheKey = `${key}_page_${pageNum}_size_${pageSize}`;
    const cachedData = globalCache.get<{ data: T[]; total: number; hasMore: boolean }>(cacheKey);
    
    if (cachedData && !append) {
      setData(cachedData.data);
      setTotal(cachedData.total);
      setHasMore(cachedData.hasMore);
      setPage(pageNum);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(pageNum, pageSize);
      
      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
      
      globalCache.set(cacheKey, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, pageSize, ttl, enabled]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchPage(page + 1, true);
    }
  }, [hasMore, loading, page, fetchPage]);

  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum !== page && !loading) {
      await fetchPage(pageNum);
    }
  }, [page, loading, fetchPage]);

  const refetch = useCallback(async () => {
    // Clear all cached pages for this key
    for (let i = 1; i <= page; i++) {
      globalCache.delete(`${key}_page_${i}_size_${pageSize}`);
    }
    await fetchPage(1);
  }, [key, page, pageSize, fetchPage]);

  const invalidate = useCallback(() => {
    // Clear all cached pages for this key
    for (let i = 1; i <= page; i++) {
      globalCache.delete(`${key}_page_${i}_size_${pageSize}`);
    }
    setData([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
  }, [key, page, pageSize]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    page,
    total,
    hasMore,
    loadMore,
    goToPage,
    refetch,
    invalidate
  };
}

// Hook for debounced search
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
): {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  loading: boolean;
  error: Error | null;
} {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFn(query);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, searchFn, delay]);

  return {
    query,
    setQuery,
    results,
    loading,
    error
  };
}

// Hook for virtual scrolling (for large lists)
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Add buffer
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log if render takes more than 100ms
        console.warn(`Performance: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
}

// Export cache utilities
export { globalCache };
export type { CacheEntry };
