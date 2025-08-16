import type {
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  MutationKey,
} from "@tanstack/react-query";
import type {
  Transporter,
  ClientMethodReturnType,
  RuntimeValidationSetting,
} from "@saka-labs/jsonrpc-client";
import type {
  Method,
  RequestType,
  ResponseType,
  ErrorType,
} from "@saka-labs/jsonrpc-types/types";

/**
 * Extract the method name from a method object
 */
export type MethodName<T extends Method<unknown, unknown, unknown, unknown>> =
  T["methodName"];

/**
 * Base configuration for React Query hooks
 */
export interface JsonRpcQueryConfig {
  /** The transporter to use for requests */
  transporter: Transporter;
  /** Whether to enable runtime validation */
  runtimeValidation?: RuntimeValidationSetting;
}

/**
 * Configuration for useJsonRpcQuery hook
 */
export interface UseJsonRpcQueryOptions<
  TMethod extends Method<unknown, unknown, unknown, unknown>,
  TData = ResponseType<TMethod>,
  TError = ErrorType<TMethod>
> extends Omit<
    UseQueryOptions<
      ClientMethodReturnType<
        RequestType<TMethod>,
        ResponseType<TMethod>,
        ErrorType<TMethod>
      >,
      TError,
      TData,
      QueryKey
    >,
    "queryKey" | "queryFn"
  > {
  /** Custom query key override */
  queryKey?: QueryKey;
}

/**
 * Configuration for useJsonRpcMutation hook
 */
export interface UseJsonRpcMutationOptions<
  TMethod extends Method<unknown, unknown, unknown, unknown>,
  TData = ResponseType<TMethod>,
  TError = ErrorType<TMethod>,
  TVariables = RequestType<TMethod>
> extends Omit<
    UseMutationOptions<
      ClientMethodReturnType<
        RequestType<TMethod>,
        ResponseType<TMethod>,
        ErrorType<TMethod>
      >,
      TError,
      TVariables
    >,
    "mutationKey" | "mutationFn"
  > {
  /** Custom mutation key override */
  mutationKey?: MutationKey;
}

/**
 * Query key factory for JSON-RPC methods
 */
export interface JsonRpcQueryKeys {
  /** Base key for all JSON-RPC queries */
  all: readonly ["jsonrpc"];
  /** Key for specific method queries */
  method: <T extends Method<unknown, unknown, unknown, unknown>>(
    methodName: MethodName<T>,
    params?: RequestType<T>
  ) => readonly ["jsonrpc", MethodName<T>, RequestType<T>?];
}

/**
 * Result type for useJsonRpcQuery with proper error handling
 */
export interface JsonRpcQueryResult<TData, TError = unknown> {
  /** The query data */
  data: TData | undefined;
  /** Error from the query */
  error: TError | null;
  /** Whether the query is currently loading */
  isLoading: boolean;
  /** Whether the query is currently fetching */
  isFetching: boolean;
  /** Whether the query has succeeded */
  isSuccess: boolean;
  /** Whether the query has failed */
  isError: boolean;
  /** Whether the query data is stale */
  isStale: boolean;
  /** Refetch function */
  refetch: () => void;
}

/**
 * Result type for useJsonRpcMutation
 */
export interface JsonRpcMutationResult<
  TData,
  TError = unknown,
  TVariables = unknown
> {
  /** The mutation function */
  mutate: (variables: TVariables) => void;
  /** Async version of the mutation function */
  mutateAsync: (variables: TVariables) => Promise<TData>;
  /** Whether the mutation is currently pending */
  isPending: boolean;
  /** Whether the mutation has succeeded */
  isSuccess: boolean;
  /** Whether the mutation has failed */
  isError: boolean;
  /** The mutation data */
  data: TData | undefined;
  /** Error from the mutation */
  error: TError | null;
  /** Reset the mutation state */
  reset: () => void;
}

/**
 * Provider props for JsonRpcQueryProvider
 */
export interface JsonRpcQueryProviderProps {
  /** The transporter configuration */
  config: JsonRpcQueryConfig;
  /** Children components */
  children: React.ReactNode;
}
