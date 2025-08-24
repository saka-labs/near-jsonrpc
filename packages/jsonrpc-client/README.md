# @saka-labs/near-jsonrpc-client

Type-safe JSON-RPC client for NEAR Protocol.

## Installation

```bash
npm install @saka-labs/near-jsonrpc-client
```

## Quick Start

```typescript
import {
  jsonRpcTransporter,
  createClientWithMethods,
} from "@saka-labs/near-jsonrpc-client";
import { block, gasPrice, query } from "@saka-labs/near-jsonrpc-types/methods";

const transporter = jsonRpcTransporter({
  endpoint: "https://rpc.testnet.near.org",
});
const client = createClientWithMethods({
  transporter,
  methods: { block, gasPrice, query }, // Only these methods are available
  runtimeValidation: { request: true, response: true, error: false },
});

const { result: blockResponse, blockError } = await client.block({
  accountId: "example.testnet",
  finality: "final",
});

if (blockError) {
  console.error("Error fetching block:", blockError);
  return;
}
console.log(blockResult);

const viewAccountResult = await client.query({
  requestType: "view_account",
  finality: "final",
  accountId: "example.testnet",
});
console.log(viewAccountResult);

const gasPriceResult = await client.gasPrice({});
console.log(gasPriceResult);
```

## API

### `jsonRpcTransporter(config)`

Creates a transporter function for making JSON-RPC requests to NEAR Protocol.

#### Parameters

- `config.endpoint: string | NearRpcEndpoint` - The RPC endpoint URL or predefined endpoint

#### Example

```typescript
import {
  jsonRpcTransporter,
  NearRpcEndpoint,
} from "@saka-labs/near-jsonrpc-client";

// Using predefined endpoints
const transporter = jsonRpcTransporter({
  endpoint: NearRpcEndpoint.Mainnet, // or Testnet, Betanet, Localnet
});

// Using custom endpoint
const customTransporter = jsonRpcTransporter({
  endpoint: "https://my-custom-rpc.com",
});
```

### `createClient(config)`

Creates a type-safe JSON-RPC client with all available NEAR Protocol methods.

#### Parameters

- `config.transporter: Transporter` - The transport layer for making JSON-RPC requests
- `config.runtimeValidation?: boolean | RuntimeValidationConfig` - Optional configuration to enable runtime validation. Can be `true` for all validation or an object for granular control

#### Example

```typescript
import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";

const transporter = jsonRpcTransporter({
  endpoint: "https://rpc.testnet.near.org",
});

// Basic client
const client = createClient({ transporter });

// Client with runtime validation (all types)
const validatedClient = createClient({
  transporter,
  runtimeValidation: true,
});

// Client with granular validation control
const granularClient = createClient({
  transporter,
  runtimeValidation: { request: true, response: true, error: false },
});
```

### `createClientWithMethods(config)`

Creates a type-safe JSON-RPC client with only specific methods. This is useful for reducing bundle size and creating more focused clients.

#### Parameters

- `config.transporter: Transporter` - The transport layer for making JSON-RPC requests
- `config.methods: object` - Object containing specific methods from `@saka-labs/near-jsonrpc-types/methods`
- `config.runtimeValidation?: boolean | RuntimeValidationConfig` - Optional configuration to enable runtime validation. Can be `true` for all validation or an object for granular control

#### Example

```typescript
import {
  jsonRpcTransporter,
  createClientWithMethods,
} from "@saka-labs/near-jsonrpc-client";
import { block, status, query } from "@saka-labs/near-jsonrpc-types/methods";

const transporter = jsonRpcTransporter({
  endpoint: "https://rpc.testnet.near.org",
});

// Client with only specific methods and full validation
const selectiveClient = createClientWithMethods({
  transporter,
  methods: { block, status, query },
  runtimeValidation: true,
});

// Client with selective methods and granular validation
const granularSelectiveClient = createClientWithMethods({
  transporter,
  methods: { block, status, query },
  runtimeValidation: { request: true, response: false, error: true },
});

// Only these methods are available (TypeScript enforced):
const blockData = await selectiveClient.block({ finality: "final" });
const statusData = await selectiveClient.status(null);
// selectiveClient.gasPrice() // ❌ TypeScript error - method not included

// Use cases:
// 1. Monitoring client (read-only operations)
const monitoringClient = createClientWithMethods({
  transporter,
  methods: { status, block, gasPrice, query },
});

// 2. Transaction client (transaction operations)
import {
  broadcastTxAsync,
  broadcastTxCommit,
  tx,
} from "@saka-labs/near-jsonrpc-types/methods";
const txClient = createClientWithMethods({
  transporter,
  methods: { broadcastTxAsync, broadcastTxCommit, tx },
  runtimeValidation: true,
});
```

## Discriminated Methods

The client now supports discriminated methods that provide better type safety and developer experience for specific operations. These methods automatically set the discriminator properties (like `requestType`) for you.

### Query Methods

Instead of using the generic `query` method with a `requestType` parameter, you can now use specific methods:

```typescript
import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";
import { DiscriminateRpcQueryResponse } from "@saka-labs/near-jsonrpc-types";

const transporter = jsonRpcTransporter({
  endpoint: "https://rpc.testnet.near.org",
});
const client = createClient({ transporter });

// Use specific discriminated methods
const { result, error } = await client.queryViewAccount({
  accountId: "example.testnet",
  finality: "final",
  // requestType: "view_account" is automatically set
});

// Or use generic method
await client.query({
  requestType: "view_account",
  accountId: "example.testnet",
  finality: "final",
});
```

### Changes Methods

Similar discriminated methods are available for state changes:

```typescript
// Specific change type methods
await client.changesAccountChanges({
  accountIds: ["example.testnet"],
  finality: "final",
  // changesType: "account_changes" is automatically set
});

// Or use generic changes method
await client.changes({
  accountIds: ["example.testnet"],
  finality: "final",
  changesType: "account_changes",
});
```

### Discriminator Helper Functions

Use discriminator helpers to safely handle union response types:

```typescript
import {
  DiscriminateRpcQueryResponse,
  DiscriminateRpcTransactionResponse,
} from "@saka-labs/near-jsonrpc-types";

// For query responses
const { result } = await client.queryViewAccount({
  accountId: "example.testnet",
});

const discriminated = DiscriminateRpcQueryResponse(result);
if (discriminated.AccountView) {
  // TypeScript knows this is AccountView type
  console.log(discriminated.AccountView.amount);
} else if (discriminated.CallResult) {
  // TypeScript knows this is CallResult type
  console.log(discriminated.CallResult.result);
}
```

#### Runtime Validation

The client supports runtime validation using Zod schemas to validate requests, responses, and errors. You can configure validation in two ways:

##### Boolean Configuration (Simple)

Set `runtimeValidation: true` to enable all validation types:

```typescript
import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";

const client = createClient({
  transporter: jsonRpcTransporter({ endpoint: "https://rpc.testnet.near.org" }),
  runtimeValidation: true, // Enables request, response, and error validation
});
```

##### Object Configuration (Granular Control)

Use an object to control which validation types are enabled:

```typescript
import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";

// Only validate requests (catch invalid input before sending)
const clientRequestOnly = createClient({
  transporter: jsonRpcTransporter({ endpoint: "https://rpc.testnet.near.org" }),
  runtimeValidation: { request: true, response: false, error: false },
});
```

##### RuntimeValidationConfig Interface

```typescript
interface RuntimeValidationConfig {
  /** Enable request validation */
  request: boolean;
  /** Enable response validation */
  response: boolean;
  /** Enable error validation */
  error: boolean;
}
```

##### Using Validation

When validation is enabled and fails, the client returns validation errors:

```typescript
const result = await client.query({
  requestType: "view_account",
  finality: "final",
  accountId: "example.testnet",
});

// Check for validation errors
if ("error" in result && "validation" in result.error) {
  console.error("Validation error:", result.error.validation);
  return;
}

// Safe to use the result
console.log(result.result);
```

#### Validation Error Format

When runtime validation is enabled and validation fails, the client returns an error object with the following structure:

```typescript
{
  error: {
    validation: {
      runtimeValidation: "request" | "response" | "error",
      error: // Zod validation error details
    }
  }
}
```

For a comprehensive example of how to handle different types of validation errors and access specific error properties, see the [accessing-error.ts example](../../examples/accessing-error.ts).

## Examples

See the [examples directory](../../examples) for more usage patterns:

- [View Account](../../examples/view-account.ts) - Traditional query method usage
- [Query View Account](../../examples/query-view-account.ts) - Discriminated method usage
- [Discriminated Helper](../../examples/discriminated-helper.ts) - Using discriminator helpers
- [Transactions](../../examples/transactions.ts)
- [Gas Price](../../examples/gas.ts)
- [Selective Methods](../../examples/selective-methods.ts)

## Related

- [`@saka-labs/near-jsonrpc-types`](../jsonrpc-types) - TypeScript types
- [NEAR JSON-RPC Docs](https://docs.near.org/api/rpc/introduction)

## License

MIT
