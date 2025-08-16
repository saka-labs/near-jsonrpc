import { QueryClient } from "@tanstack/react-query";
import type { Method } from "@saka-labs/jsonrpc-types/types";
import { jsonRpcQueryKeys, getMethodQueryKeys } from "./query-keys";

/**
 * Default configuration for JSON-RPC Query Client
 */
export const defaultJsonRpcQueryConfig = {
  defaultOptions: {
    queries: {
      // Consider data stale after 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 30 minutes after component unmount
      gcTime: 30 * 60 * 1000,
      // Retry failed queries 3 times with exponential backoff
      retry: 3,
      // Don't refetch on window focus by default (can be overridden)
      refetchOnWindowFocus: false,
      // Refetch on network reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
};

/**
 * Create a pre-configured QueryClient for JSON-RPC operations
 *
 * @param config - Optional configuration overrides
 * @returns A QueryClient instance with JSON-RPC optimized defaults
 *
 * @example
 * ```tsx
 * import { createJsonRpcQueryClient } from '@saka-labs/jsonrpc-react-query';
 * import { QueryClientProvider } from '@tanstack/react-query';
 *
 * const queryClient = createJsonRpcQueryClient({
 *   defaultOptions: {
 *     queries: {
 *       staleTime: 5 * 60 * 1000, // 5 minutes
 *     },
 *   },
 * });
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourAppComponents />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export function createJsonRpcQueryClient(
  config?: ConstructorParameters<typeof QueryClient>[0]
) {
  return new QueryClient({
    ...defaultJsonRpcQueryConfig,
    ...config,
    defaultOptions: {
      ...defaultJsonRpcQueryConfig.defaultOptions,
      ...config?.defaultOptions,
      queries: {
        ...defaultJsonRpcQueryConfig.defaultOptions.queries,
        ...config?.defaultOptions?.queries,
      },
      mutations: {
        ...defaultJsonRpcQueryConfig.defaultOptions.mutations,
        ...config?.defaultOptions?.mutations,
      },
    },
  });
}

/**
 * Utility class for managing JSON-RPC query cache operations
 *
 * @example
 * ```tsx
 * import { useQueryClient } from '@tanstack/react-query';
 * import { JsonRpcQueryCache } from '@saka-labs/jsonrpc-react-query';
 * import { block, status } from '@saka-labs/jsonrpc-types/methods';
 *
 * function CacheManagement() {
 *   const queryClient = useQueryClient();
 *   const cache = new JsonRpcQueryCache(queryClient);
 *
 *   const handleInvalidateBlocks = () => {
 *     cache.invalidateMethod('block');
 *   };
 *
 *   const handlePrefetchStatus = () => {
 *     cache.prefetchMethod(status, null);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleInvalidateBlocks}>Invalidate Blocks</button>
 *       <button onClick={handlePrefetchStatus}>Prefetch Status</button>
 *     </div>
 *   );
 * }
 * ```
 */
export class JsonRpcQueryCache {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate all queries for a specific method
   */
  invalidateMethod(methodName: string) {
    return this.queryClient.invalidateQueries({
      queryKey: getMethodQueryKeys(methodName),
    });
  }

  /**
   * Invalidate all JSON-RPC queries
   */
  invalidateAll() {
    return this.queryClient.invalidateQueries({
      queryKey: jsonRpcQueryKeys.all,
    });
  }

  /**
   * Remove all queries for a specific method from cache
   */
  removeMethod(methodName: string) {
    return this.queryClient.removeQueries({
      queryKey: getMethodQueryKeys(methodName),
    });
  }

  /**
   * Remove all JSON-RPC queries from cache
   */
  removeAll() {
    return this.queryClient.removeQueries({
      queryKey: jsonRpcQueryKeys.all,
    });
  }

  /**
   * Prefetch a query for a specific method
   */
  async prefetchMethod<T extends Method<unknown, unknown, unknown, unknown>>(
    method: T,
    params: any,
    options?: { staleTime?: number; gcTime?: number }
  ) {
    // This would require the transporter to be available
    // For now, this is a placeholder for the API
    throw new Error(
      "Prefetch functionality requires transporter access. Use useJsonRpcQuery with suspense instead."
    );
  }

  /**
   * Get cached data for a specific method and parameters
   */
  getMethodData(methodName: string, params?: any) {
    const queryKey = jsonRpcQueryKeys.method(methodName, params);
    return this.queryClient.getQueryData(queryKey);
  }

  /**
   * Set cached data for a specific method and parameters
   */
  setMethodData(methodName: string, params: any | undefined, data: any) {
    const queryKey = jsonRpcQueryKeys.method(methodName, params);
    return this.queryClient.setQueryData(queryKey, data);
  }
}
