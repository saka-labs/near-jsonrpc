import { useQuery } from "@tanstack/react-query";
import { createClientWithMethods } from "@saka-labs/jsonrpc-client";
import type {
  Method,
  RequestType,
  ResponseType,
  ErrorType,
} from "@saka-labs/jsonrpc-types/types";
import type {
  UseJsonRpcQueryOptions,
  JsonRpcQueryResult,
  MethodName,
} from "./types";
import { useJsonRpcQueryConfig } from "./context";
import { createMethodQueryKey } from "./query-keys";

/**
 * React Query hook for JSON-RPC method calls
 *
 * @param method - The JSON-RPC method definition
 * @param params - Parameters for the JSON-RPC method
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * import { useJsonRpcQuery } from '@saka-labs/jsonrpc-react-query';
 * import { block } from '@saka-labs/jsonrpc-types/methods';
 *
 * function BlockInfo() {
 *   const { data, error, isLoading } = useJsonRpcQuery(
 *     block,
 *     { finality: 'final' },
 *     {
 *       staleTime: 30 * 1000, // 30 seconds
 *       retry: 3,
 *     }
 *   );
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>Block Hash: {data?.result?.header.hash}</div>;
 * }
 * ```
 */
export function useJsonRpcQuery<
  TMethod extends Method<unknown, unknown, unknown, unknown>,
  TData = ResponseType<TMethod>
>(
  method: TMethod,
  params: RequestType<TMethod>,
  options?: UseJsonRpcQueryOptions<TMethod, TData>
): JsonRpcQueryResult<TData, ErrorType<TMethod>> {
  const config = useJsonRpcQueryConfig();

  // Create a client with just this method for type safety
  const client = createClientWithMethods({
    transporter: config.transporter,
    methods: { [method.methodName]: method } as {
      [K in MethodName<TMethod>]: TMethod;
    },
    runtimeValidation: config.runtimeValidation,
  });

  // Generate query key
  const queryKey =
    options?.queryKey ?? createMethodQueryKey(method.methodName, params);

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const clientMethod = client[
        method.methodName as keyof typeof client
      ] as any;
      return await clientMethod(params);
    },
    ...options,
  });

  return {
    data: (queryResult.data as any)?.result as TData | undefined,
    error: (queryResult.data as any)?.error ?? queryResult.error,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isSuccess: queryResult.isSuccess && !!(queryResult.data as any)?.result,
    isError: queryResult.isError || !!(queryResult.data as any)?.error,
    isStale: queryResult.isStale,
    refetch: queryResult.refetch,
  };
}
