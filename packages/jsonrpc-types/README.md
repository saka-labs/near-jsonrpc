# @saka-labs/near-jsonrpc-types

TypeScript types and schemas for NEAR JSON-RPC API.

## Installation

```bash
npm install @saka-labs/near-jsonrpc-types
```

## Usage

### Import Types

```typescript
import type {
  AccountView,
  AccountId,
  ValidatorStakeView,
  BlockHeaderView,
  ExecutionOutcomeView,
  RpcBlockRequest,
  RpcBlockResponse,
  RpcQueryRequest,
  RpcQueryResponse,
} from "@saka-labs/near-jsonrpc-types";
```

### Import Method Definitions

```typescript
import {
  query,
  queryViewAccount,
  queryCallFunction,
  queryViewCode,
  block,
  status,
  validators,
  broadcastTxCommit,
  gasPrice,
  health,
  networkInfo,
  EXPERIMENTALProtocolConfig,
} from "@saka-labs/near-jsonrpc-types/methods";

const transporter = jsonRpcTransporter({
  endpoint: "https://rpc.testnet.near.org",
});

// Client with only specific methods
const client = createClientWithMethods({
  transporter,
  methods: { block, status, query, queryViewAccount, queryCallFunction },
  runtimeValidation: true,
});

const result - client.query({
  request_type: "view_account",
  account_id: "example.near",
  finality: "final",
})
```

### Import TypeScript Types and Schemas

```typescript
// TypeScript type definitions
import type {
  AccountView,
  ValidatorStakeView,
  BlockHeaderView,
} from "@saka-labs/near-jsonrpc-types/schemas";
```

### Import Zod Validation Schemas

```typescript
// Runtime validation schemas
import {
  AccountViewSchema,
  ValidatorStakeViewSchema,
  BlockHeaderViewSchema,
  RpcBlockRequestSchema,
  RpcBlockResponseSchema,
} from "@saka-labs/near-jsonrpc-types/zod-schemas";

// Validate API responses at runtime
const account = AccountViewSchema.parse(response);
const blockRequest = RpcBlockRequestSchema.parse(userInput);
```

### Import Property Mappings

```typescript
import { mappedSnakeCamelProperty } from "@saka-labs/near-jsonrpc-types/mapped-properties";

// Convert between snake_case and camelCase property names
const camelCase = mappedSnakeCamelProperty.get("account_id"); // "accountId"
```

### Import Discriminator Helpers

```typescript
import {
  DiscriminateRpcQueryResponse,
  DiscriminateRpcTransactionResponse,
} from "@saka-labs/near-jsonrpc-types";

// Type-safe discrimination of union response types
const { result } = await client.queryViewAccount({
  accountId: "example.near",
  syncCheckpoint: "earliest_available",
});

const discriminated = DiscriminateRpcQueryResponse(result);
if (discriminated.AccountView) {
  // TypeScript knows this is AccountView type
  console.log(`Balance: ${discriminated.AccountView.amount}`);
  console.log(`Storage: ${discriminated.AccountView.storageUsage}`);
} else if (discriminated.CallResult) {
  // TypeScript knows this is CallResult type
  console.log(`Result: ${discriminated.CallResult.result}`);
}
```

## Available Exports

- **`/methods`** - JSON-RPC method definitions with type parameters and validation schemas
- **`/schemas`** - TypeScript type definitions for all NEAR JSON-RPC types
- **`/zod-schemas`** - Runtime Zod validation schemas for type checking and parsing
- **`/mapped-properties`** - Property name conversion mappings between snake_case and camelCase
- **Main export** - Discriminator helper functions for type-safe union response handling

## Available Methods

The package includes all NEAR JSON-RPC methods:

**Core Methods:**

- `block` - Get block information
- `query` - Query account/contract state (generic method)
- `status` - Get node status
- `validators` - Get current validators
- `gasPrice` - Get current gas price
- `health` - Check node health
- `networkInfo` - Get network information

**Query Methods (Discriminated):**

- `queryViewAccount` - Query account information
- `queryViewCode` - Query contract code
- `queryCallFunction` - Call a view function
- `queryViewAccessKey` - Query access key information
- `queryViewAccessKeyList` - Query all access keys for an account
- `queryViewState` - Query contract state
- `queryViewGlobalContractCode` - Query global contract code
- `queryViewGlobalContractCodeByAccountId` - Query global contract code by account

**Transaction Methods:**

- `broadcastTxAsync` - Broadcast transaction asynchronously
- `broadcastTxCommit` - Broadcast transaction and wait for commit
- `sendTx` - Send transaction
- `tx` - Get transaction status

**Advanced Methods:**

- `chunk` - Get chunk information
- `changes` - Get state changes (generic method)
- `lightClientProof` - Get light client proof
- `nextLightClientBlock` - Get next light client block

**Changes Methods (Discriminated):**

- `changesAccountChanges` - Get account changes
- `changesSingleAccessKeyChanges` - Get single access key changes
- `changesSingleGasKeyChanges` - Get single gas key changes
- `changesAllAccessKeyChanges` - Get all access key changes
- `changesAllGasKeyChanges` - Get all gas key changes
- `changesContractCodeChanges` - Get contract code changes
- `changesDataChanges` - Get data changes

**Experimental Methods:**

- `EXPERIMENTALProtocolConfig` - Get protocol configuration
- `EXPERIMENTALValidatorsOrdered` - Get validators in order
- `EXPERIMENTALReceipt` - Get receipt information
- `EXPERIMENTALTxStatus` - Get transaction status
- `EXPERIMENTALChanges` - Get state changes
- `EXPERIMENTALChangesInBlock` - Get changes in block
- And more...

For complete method details, parameter types, and response schemas, see [`/methods`](./src/methods.ts).

## Features

- Complete TypeScript coverage of NEAR JSON-RPC API
- Discriminated method definitions for better type safety and developer experience
- Discriminator helper functions for type-safe union response handling
- Runtime validation with Zod schemas
- Tree-shakeable - import only what you need
- Auto-generated from OpenAPI specification
- Type-safe method definitions with request/response validation
- Property name conversion utilities
- Support for all NEAR JSON-RPC methods including experimental ones
- Automatic discriminator property handling (requestType, changesType, etc.)

## Related

- [`@saka-labs/near-jsonrpc-client`](../jsonrpc-client) - JSON-RPC client
- [`@saka-labs/near-jsonrpc-generator`](../jsonrpc-generator) - Code generator

## License

MIT
