import React, { createContext, useContext } from "react";
import type { JsonRpcQueryConfig, JsonRpcQueryProviderProps } from "./types";

/**
 * Context for JSON-RPC Query configuration
 */
const JsonRpcQueryContext = createContext<JsonRpcQueryConfig | null>(null);

/**
 * Provider component for JSON-RPC Query configuration
 *
 * @example
 * ```tsx
 * import { JsonRpcQueryProvider, jsonRpcTransporter, NearRpcEndpoint } from '@saka-labs/jsonrpc-react-query';
 *
 * const transporter = jsonRpcTransporter({ endpoint: NearRpcEndpoint.Mainnet });
 *
 * function App() {
 *   return (
 *     <JsonRpcQueryProvider config={{ transporter, runtimeValidation: true }}>
 *       <YourAppComponents />
 *     </JsonRpcQueryProvider>
 *   );
 * }
 * ```
 */
export function JsonRpcQueryProvider({
  config,
  children,
}: JsonRpcQueryProviderProps) {
  return (
    <JsonRpcQueryContext.Provider value={config}>
      {children}
    </JsonRpcQueryContext.Provider>
  );
}

/**
 * Hook to access the JSON-RPC Query configuration
 * @internal
 */
export function useJsonRpcQueryConfig(): JsonRpcQueryConfig {
  const config = useContext(JsonRpcQueryContext);

  if (!config) {
    throw new Error(
      "useJsonRpcQueryConfig must be used within a JsonRpcQueryProvider. " +
        "Make sure to wrap your app with <JsonRpcQueryProvider config={...}>."
    );
  }

  return config;
}
