# Code Generator Documentation

## Overview

The `@saka-labs/jsonrpc-generator` automatically creates TypeScript types and Zod validation schemas for NEAR's JSON-RPC API from OpenAPI specifications. It fetches the latest API spec from nearcore, processes it into clean TypeScript types, and generates runtime validation schemas to ensure type safety.

## Quick Start

```bash
# Generate types from the latest NEAR API
yarn generate
```

This creates 5 files in `packages/jsonrpc-types/src/` with everything needed for type-safe JSON-RPC calls.

## How It Works

### 1. Source: NEAR's OpenAPI Specification

The generator fetches the official OpenAPI spec from nearcore's repository:

```
https://raw.githubusercontent.com/near/nearcore/refs/heads/master/chain/jsonrpc/openapi/openapi.json
```

This spec contains:

- All JSON-RPC method definitions (block, query, broadcast_tx_commit, etc.)
- Request/response types for each method
- Error types and validation rules
- Complex nested data structures

### 2. Generation Pipeline

```
OpenAPI Spec → TypeScript Generation → AST Parsing → File Building → Zod Generation → Validation → Output
```

**Step 1: TypeScript Generation**

- Uses `openapi-typescript` library to convert OpenAPI JSON to TypeScript types
- Produces raw TypeScript with all the types and interfaces

**Step 2: AST Parsing**

- Parses the generated TypeScript using `ts-morph` (TypeScript AST manipulation)
- Extracts JSON-RPC method information (names, request/response types, error types)
- Extracts schema types and identifies property name mappings (snake_case → camelCase)

**Step 3: File Building**

- Five separate builders create the final output files
- Each builder formats the data appropriately for its specific purpose

**Step 4: Zod Generation**

- Converts TypeScript types to equivalent Zod validation schemas
- Handles circular dependencies with `z.lazy()`
- Maintains 1:1 correspondence with TypeScript types

**Step 5: Validation**

- Uses `expect-type` to ensure Zod schemas produce identical types to TypeScript
- Prevents runtime/compile-time mismatches

## Generated Output

The generator produces 5 files in `packages/jsonrpc-types/src/`:

### `types.ts`

Core utilities for method definitions:

```typescript
export type Method<TRequest, TResponse, TError> = {
  readonly methodName: string;
  readonly zodRequest: z.ZodType<TRequest>;
  readonly zodResponse: z.ZodType<TResponse>;
  readonly zodError: z.ZodType<TError>;
};

export function defineMethod<TRequest, TResponse, TError>(
  methodName: string,
  zodRequest: z.ZodType<TRequest>,
  zodResponse: z.ZodType<TResponse>,
  zodError: z.ZodType<TError>
): Method<TRequest, TResponse, TError>;

// Type helpers to extract types from method definitions
export type RequestType<T extends Method<any, any, any>> = ...;
export type ResponseType<T extends Method<any, any, any>> = ...;
export type ErrorType<T extends Method<any, any, any>> = ...;
```

### `schemas.ts`

All TypeScript type definitions from the OpenAPI spec:

```typescript
export type AccessKey = {
  nonce: number;
  permission: AccessKeyPermission;
};

export type RpcBlockRequest =
  | {
      blockId: BlockId;
    }
  | {
      finality: Finality;
    }
  | {
      syncCheckpoint: SyncCheckpoint;
    };

export type RpcBlockResponse = {
  author: AccountId;
  chunks: ChunkHeaderView[];
  header: BlockHeaderView;
};
// ... hundreds more types
```

### `methods.ts`

Method definitions for all JSON-RPC endpoints:

```typescript
/** Method definition for block RPC call */
export const block = defineMethod<RpcBlockRequest, RpcBlockResponse, RpcError>(
  "block",
  RpcBlockRequestSchema,
  RpcBlockResponseSchema,
  RpcErrorSchema
);

/** Method definition for broadcast_tx_async RPC call */
export const broadcastTxAsync = defineMethod<
  RpcSendTransactionRequest,
  CryptoHash,
  RpcError
>(
  "broadcast_tx_async",
  RpcSendTransactionRequestSchema,
  CryptoHashSchema,
  RpcErrorSchema
);

// ... all other JSON-RPC methods
```

### `zod-schemas.ts`

Zod validation schemas matching the TypeScript types:

```typescript
export const AccessKeySchema = z.object({
  nonce: z.number(),
  permission: z.lazy(() => AccessKeyPermissionSchema),
});

export const RpcBlockRequestSchema = z.union([
  z.object({ blockId: z.lazy(() => BlockIdSchema) }),
  z.object({ finality: z.lazy(() => FinalitySchema) }),
  z.object({ syncCheckpoint: z.lazy(() => SyncCheckpointSchema) }),
]);
// ... all schemas with runtime validation
```

### `mapped-properties.ts`

Property name mappings for snake_case ↔ camelCase conversion:

```typescript
export const mappedSnakeCamelProperty = new Map<string, string>([
  ["access_key", "accessKey"],
  ["block_hash", "blockHash"],
  ["final_execution_outcome", "finalExecutionOutcome"],
  // ... 500+ property mappings
]);
```

## Key Features

### ✅ **Automatic Synchronization**

- Fetches latest API spec from nearcore repository
- Daily GitHub Actions workflow creates PRs when API changes
- No manual updates needed

### ✅ **Type Safety**

- Full TypeScript support with IDE autocomplete
- Runtime validation with Zod schemas
- Guaranteed consistency between compile-time and runtime types

### ✅ **Property Transformation**

- Automatically converts between JSON-RPC's snake_case and TypeScript's camelCase
- Comprehensive mapping prevents edge cases
- Single source of truth for all property name transformations

### ✅ **Zero Configuration**

- Works out of the box with sensible defaults
- Handles all NEAR JSON-RPC methods automatically
- No manual configuration required

## Usage Example

```typescript
import { query, broadcast_tx_commit } from "@saka-labs/jsonrpc-types";
import type { RequestType, ResponseType } from "@saka-labs/jsonrpc-types";

// Type-safe method calls
const queryRequest: RequestType<typeof query> = {
  requestType: "view_account",
  accountId: "near",
  finality: "final",
};

// Runtime validation
try {
  const validatedRequest = query.zodRequest.parse(queryRequest);
  const response = await client.call(query.methodName, validatedRequest);
  const validatedResponse = query.zodResponse.parse(response);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Validation failed:", error.issues);
  }
}
```

## Technical Architecture

### Core Dependencies

- `openapi-typescript@7.8.0` - Converts OpenAPI to TypeScript
- `ts-morph@^26.0.0` - TypeScript AST manipulation
- `zod/v4` - Runtime schema validation
- `expect-type@^1.2.2` - Compile-time type validation

### Main Components

**📁 `src/index.ts`** - Main orchestrator

- Coordinates the entire generation pipeline
- Handles file I/O and error management

**📁 `src/utils/`** - Utilities

- `index.ts` - Fetches OpenAPI spec from nearcore
- `openapi-ts.ts` - Converts OpenAPI to TypeScript using openapi-typescript

**📁 `src/openapi-typescript-parser/`** - AST Processing

- `index.ts` - Main parser coordinator
- `parse-method.ts` - Extracts JSON-RPC method definitions
- `parse-schema.ts` - Extracts TypeScript types and property mappings

**📁 `src/builder/`** - File Builders

- `build-types.ts` - Generates the core Method type and utilities
- `build-schemas.ts` - Formats TypeScript schema definitions
- `build-methods.ts` - Creates method definitions using defineMethod
- `build-mapped-properties.ts` - Formats property name mappings
- `build-zod-schema.ts` - Assembles final Zod schema file

**📁 `src/zod-generator/`** - Zod Schema Generation

- `generator.ts` - Converts TypeScript types to Zod schemas
- `utils.ts` - Handles circular dependency detection and resolution
- `node-handler.ts` - Processes specific TypeScript AST node types

**📁 `src/zod-validator/`** - Type Safety Validation

- `index.ts` - Validates Zod schemas match TypeScript types exactly
- Uses temporary files and TypeScript compiler for validation

### Generation Process Details

1. **Fetch**: Downloads latest OpenAPI spec from nearcore
2. **Convert**: Uses openapi-typescript to generate TypeScript types
3. **Parse**: Extracts methods and schemas using TypeScript AST manipulation
4. **Build**: Five builders create formatted output for each file type
5. **Generate**: Creates Zod schemas from TypeScript types
6. **Validate**: Ensures 1:1 compatibility between TypeScript and Zod
7. **Write**: Saves all files to `packages/jsonrpc-types/src/`

### Error Handling

- Network failures fall back to local OpenAPI spec copy
- AST parsing errors provide detailed diagnostics
- Zod generation handles circular dependencies automatically
- Validation errors specify exact type and location mismatches

## Automation

### GitHub Actions

- **Schedule**: Daily at 00:00 UTC
- **Trigger**: Manual workflow dispatch available
- **Process**: Fetch spec → Generate → Create PR if changes detected
- **Output**: Auto-assigned reviewers and proper labeling

### Release Integration

- Generated changes trigger automated releases via `release-please`
- Semantic versioning based on API changes
- Automated NPM publishing when releases are created

## Development

### Local Development

```bash
cd packages/jsonrpc-generator
yarn generate     # Full generation
yarn test         # Run tests
yarn build        # Build package
```

### Debugging Common Issues

**Problem: Circular Dependencies**

```bash
# Check zod-generator/utils.ts for cycle detection
yarn generate  # Look for z.lazy() usage in output
```

**Problem: Type Mismatches**

```bash
# Run validation with detailed output
yarn generate  # Check validation errors
```

**Problem: Property Mapping Issues**

```bash
# Verify mappings in mapped-properties.ts
grep "property_name" packages/jsonrpc-types/src/mapped-properties.ts
```

### Making Changes

1. **Parser Changes**: Modify `src/openapi-typescript-parser/` for new OpenAPI features
2. **Builder Changes**: Update `src/builder/` to change output format
3. **Zod Changes**: Extend `src/zod-generator/` for new type patterns
4. **Validation Changes**: Modify `src/zod-validator/` for validation logic

### Testing

```bash
yarn test                    # Unit tests
yarn test:coverage          # Coverage report
yarn test test/_integration/ # Integration tests
```

## Contributing

The generator is designed to be self-maintaining for API changes. For improvements:

1. Make focused changes with comprehensive tests
2. Verify generation still works: `yarn generate`
3. Ensure validation passes
4. Update documentation for significant changes
5. Submit PR with detailed description

---

This generator ensures NEAR's JSON-RPC API consumers always have access to accurate, up-to-date type definitions and runtime validation, significantly improving developer experience and reducing integration errors.
