import { useState, useEffect, useCallback } from 'react';
import { PaginatedDataService, PaginationOptions, PaginatedResult } from '@/lib/paginated-data-service';

export interface UsePaginatedDataOptions extends PaginationOptions {
  autoFetch?: boolean;
  initialPageSize?: number;
}

export function usePaginatedData<T>(
  dataType: 'employees' | 'kpiRecords' | 'kpis',
  options: UsePaginatedDataOptions = {}
) {
  const {
    autoFetch = true,
    initialPageSize = 20,
    pageSize = initialPageSize,
    orderBy,
    orderDirection,
    filters
  } = options;

  const [data, setData] = useState<PaginatedResult<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (overrideOptions?: Partial<PaginationOptions>) => {
    setLoading(true);
    setError(null);

    try {
      const fetchOptions = {
        pageSize,
        orderBy,
        orderDirection,
        filters,
        ...overrideOptions
      };

      let result: PaginatedResult<T>;

      switch (dataType) {
        case 'employees':
          result = await PaginatedDataService.getEmployees(fetchOptions);
          break;
        case 'kpiRecords':
          result = await PaginatedDataService.getKpiRecords(fetchOptions);
          break;
        case 'kpis':
          result = await PaginatedDataService.getKpis(fetchOptions);
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching paginated data:', err);
    } finally {
      setLoading(false);
    }
  }, [dataType, pageSize, orderBy, orderDirection, filters]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const goToNextPage = useCallback(async () => {
    if (!data?.nextCursor) return;

    await fetchData({
      pageSize,
      orderBy,
      orderDirection,
      filters,
      cursor: data.nextCursor
    });
  }, [data, fetchData, pageSize, orderBy, orderDirection, filters]);

  const goToPreviousPage = useCallback(async () => {
    if (!data?.prevCursor) return;

    await fetchData({
      pageSize,
      orderBy,
      orderDirection,
      filters,
      cursor: data.prevCursor
    });
  }, [data, fetchData, pageSize, orderBy, orderDirection, filters]);

  const changePageSize = useCallback(async (newPageSize: number) => {
    await fetchData({
      pageSize: newPageSize,
      orderBy,
      orderDirection,
      filters
    });
  }, [fetchData, orderBy, orderDirection, filters]);

  const applyFilters = useCallback(async (newFilters: Record<string, any>) => {
    await fetchData({
      pageSize,
      orderBy,
      orderDirection,
      filters: newFilters
    });
  }, [fetchData, pageSize, orderBy, orderDirection]);

  // Auto fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    applyFilters,
    fetchData
  };
}
