# @saka-labs/jsonrpc-react-query

A type-safe React Query wrapper for the NEAR JSON-RPC client that provides powerful data fetching, caching, and state management capabilities.

## Installation

```bash
npm install @saka-labs/jsonrpc-react-query @tanstack/react-query
# or
yarn add @saka-labs/jsonrpc-react-query @tanstack/react-query
```

## Quick Start

### 1. Setup the Provider

```tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  JsonRpcQueryProvider,
  createJsonRpcQueryClient,
  jsonRpcTransporter,
  NearRpcEndpoint,
} from "@saka-labs/jsonrpc-react-query";

// Create a query client optimized for JSON-RPC
const queryClient = createJsonRpcQueryClient();

// Create a transporter
const transporter = jsonRpcTransporter({
  endpoint: NearRpcEndpoint.Mainnet,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JsonRpcQueryProvider config={{ transporter, runtimeValidation: true }}>
        <YourAppComponents />
        <ReactQueryDevtools initialIsOpen={false} />
      </JsonRpcQueryProvider>
    </QueryClientProvider>
  );
}
```

### 2. Use Query Hooks

```tsx
import React from "react";
import { useJsonRpcQuery } from "@saka-labs/jsonrpc-react-query";
import { block, status } from "@saka-labs/jsonrpc-types/methods";

function BlockInfo() {
  // Fetch the latest block
  const {
    data: blockData,
    isLoading,
    error,
  } = useJsonRpcQuery(
    block,
    { finality: "final" },
    {
      staleTime: 30 * 1000, // Consider data fresh for 30 seconds
      refetchInterval: 60 * 1000, // Refetch every minute
    }
  );

  // Fetch network status
  const { data: statusData } = useJsonRpcQuery(status, null);

  if (isLoading) return <div>Loading block info...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Latest Block</h2>
      <p>Hash: {blockData?.header?.hash}</p>
      <p>Height: {blockData?.header?.height}</p>
      <p>Timestamp: {blockData?.header?.timestamp}</p>

      <h2>Network Status</h2>
      <p>Chain ID: {statusData?.chain_id}</p>
      <p>Latest Block Height: {statusData?.sync_info?.latest_block_height}</p>
    </div>
  );
}
```

### 3. Use Mutation Hooks

```tsx
import React from "react";
import { useJsonRpcMutation } from "@saka-labs/jsonrpc-react-query";
import { broadcastTxCommit } from "@saka-labs/jsonrpc-types/methods";

function SendTransaction() {
  const { mutate, isPending, data, error } = useJsonRpcMutation(
    broadcastTxCommit,
    {
      onSuccess: (data) => {
        console.log("Transaction successful:", data?.transaction?.hash);
      },
      onError: (error) => {
        console.error("Transaction failed:", error);
      },
    }
  );

  const handleSendTransaction = (signedTransaction: string) => {
    mutate([signedTransaction]);
  };

  return (
    <div>
      <button
        onClick={() => handleSendTransaction(yourSignedTransaction)}
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Send Transaction"}
      </button>

      {error && <div>Error: {error.message}</div>}
      {data && <div>Success! Hash: {data.transaction?.hash}</div>}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useJsonRpcQuery(method, params, options?)`

A hook for fetching data using JSON-RPC methods.

**Parameters:**

- `method`: JSON-RPC method definition from `@saka-labs/jsonrpc-types/methods`
- `params`: Parameters for the method
- `options`: Optional React Query options

**Returns:**

- `data`: The response data (undefined while loading)
- `error`: Error object if the query failed
- `isLoading`: True when the query is loading for the first time
- `isFetching`: True when the query is fetching
- `isSuccess`: True when the query succeeded
- `isError`: True when the query failed
- `isStale`: True when the data is stale
- `refetch`: Function to manually refetch the data

#### `useJsonRpcMutation(method, options?)`

A hook for performing mutations using JSON-RPC methods.

**Parameters:**

- `method`: JSON-RPC method definition
- `options`: Optional React Query mutation options

**Returns:**

- `mutate`: Function to trigger the mutation
- `mutateAsync`: Async version of mutate
- `isPending`: True when the mutation is in progress
- `isSuccess`: True when the mutation succeeded
- `isError`: True when the mutation failed
- `data`: The mutation result data
- `error`: Error object if the mutation failed
- `reset`: Function to reset mutation state

### Components

#### `JsonRpcQueryProvider`

Provider component that configures the JSON-RPC client for all child components.

**Props:**

- `config`: Configuration object with `transporter` and optional `runtimeValidation`
- `children`: React child components

### Utilities

#### `createJsonRpcQueryClient(config?)`

Creates a pre-configured QueryClient optimized for JSON-RPC operations.

#### `JsonRpcQueryCache`

Utility class for advanced cache management operations.

**Methods:**

- `invalidateMethod(methodName)`: Invalidate all queries for a method
- `invalidateAll()`: Invalidate all JSON-RPC queries
- `removeMethod(methodName)`: Remove all queries for a method from cache
- `removeAll()`: Remove all JSON-RPC queries from cache
- `getMethodData(methodName, params?)`: Get cached data for a method
- `setMethodData(methodName, params, data)`: Set cached data for a method

## Configuration

### Default Query Options

The package comes with sensible defaults optimized for blockchain data:

```tsx
const defaultConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};
```

### Custom Configuration

```tsx
const customQueryClient = createJsonRpcQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 5,
    },
    mutations: {
      retry: 2,
    },
  },
});
```

## Contributing

See the [contributing guide](../../CONTRIBUTING.md) for information on how to contribute to this package.

## License

MIT
