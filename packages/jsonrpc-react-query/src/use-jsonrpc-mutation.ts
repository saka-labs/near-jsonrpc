import { useMutation } from "@tanstack/react-query";
import { createClientWithMethods } from "@saka-labs/near-jsonrpc-client";
import type {
  Method,
  RequestType,
  ResponseType,
  ErrorType,
} from "@saka-labs/near-jsonrpc-types/types";
import type {
  UseJsonRpcMutationOptions,
  JsonRpcMutationResult,
  MethodName,
} from "./types";
import { useJsonRpcQueryConfig } from "./context";

/**
 * React Query hook for JSON-RPC mutations
 *
 * @param method - The JSON-RPC method definition
 * @param options - Additional React Query mutation options
 *
 * @example
 * ```tsx
 * import { useJsonRpcMutation } from '@saka-labs/near-jsonrpc-react-query';
 * import { broadcastTxCommit } from '@saka-labs/near-jsonrpc-types/methods';
 *
 * function SendTransaction() {
 *   const { mutate, isPending, error } = useJsonRpcMutation(
 *     broadcastTxCommit,
 *     {
 *       onSuccess: (data) => {
 *         console.log('Transaction sent:', data.result?.transaction.hash);
 *       },
 *       onError: (error) => {
 *         console.error('Transaction failed:', error);
 *       },
 *     }
 *   );
 *
 *   const handleSendTransaction = (signedTransaction: string) => {
 *     mutate([signedTransaction]);
 *   };
 *
 *   return (
 *     <button
 *       onClick={() => handleSendTransaction(signedTx)}
 *       disabled={isPending}
 *     >
 *       {isPending ? 'Sending...' : 'Send Transaction'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useJsonRpcMutation<
  TMethod extends Method<unknown, unknown, unknown, unknown>,
  TData = ResponseType<TMethod>,
  TVariables = RequestType<TMethod>
>(
  method: TMethod,
  options?: UseJsonRpcMutationOptions<
    TMethod,
    TData,
    ErrorType<TMethod>,
    TVariables
  >
): JsonRpcMutationResult<TData, ErrorType<TMethod>, TVariables> {
  const config = useJsonRpcQueryConfig();

  // Create a client with just this method for type safety
  const client = createClientWithMethods({
    transporter: config.transporter,
    methods: { [method.methodName]: method } as {
      [K in MethodName<TMethod>]: TMethod;
    },
    runtimeValidation: config.runtimeValidation,
  });

  const mutationResult = useMutation({
    mutationKey: options?.mutationKey ?? [
      "jsonrpc",
      "mutation",
      method.methodName,
    ],
    mutationFn: async (variables: TVariables) => {
      const clientMethod = client[
        method.methodName as keyof typeof client
      ] as any;
      return await clientMethod(variables);
    },
    ...options,
  });

  return {
    mutate: mutationResult.mutate,
    mutateAsync: async (variables: TVariables) => {
      const result = await mutationResult.mutateAsync(variables);
      if (result.error) {
        throw result.error;
      }
      return result.result as TData;
    },
    isPending: mutationResult.isPending,
    isSuccess:
      mutationResult.isSuccess && !!(mutationResult.data as any)?.result,
    isError: mutationResult.isError || !!(mutationResult.data as any)?.error,
    data: (mutationResult.data as any)?.result as TData | undefined,
    error: (mutationResult.data as any)?.error ?? mutationResult.error,
    reset: mutationResult.reset,
  };
}
