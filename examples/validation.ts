/**
 * Type-Safe and Zod Validation Example
 *
 * This example demonstrates how to use the NEAR JSON-RPC client with runtime
 * validation enabled, showcasing type safety and Zod schema validation.
 */

import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";
import type { RpcClient } from "@saka-labs/near-jsonrpc-client";
import type { AccountInfo } from "@saka-labs/near-jsonrpc-types/schemas";

async function validBlockRequestExample(client: RpcClient) {
  console.log("📋 Example 1: Valid Block Request");
  console.log("Making a valid block request...");

  const validBlockRequest = await client.block({
    finality: "final",
  });

  if (validBlockRequest.error) {
    if (validBlockRequest.error.validation) {
      const { runtimeValidation, error } = validBlockRequest.error.validation;
      console.log("❌ Validation Error:", JSON.stringify(error, null, 2));
      console.log(`   Runtime Validation: ${runtimeValidation}`);
    } else if (validBlockRequest.error.rpc) {
      console.log("❌ RPC Error:", validBlockRequest.error.rpc);
    }
  } else {
    const { header } = validBlockRequest.result;
    console.log("✅ Valid request successful!");
    console.log(`   Block Height: ${header.height}`);
    console.log(`   Block Hash: ${header.hash}`);
  }
}

async function validAccountQueryExample(client: RpcClient) {
  console.log("📋 Example 2: Valid Account Query");
  console.log("Making a valid account query...");

  const validAccountQuery = await client.query({
    requestType: "view_account",
    finality: "final",
    accountId: "test.near",
  });

  if (validAccountQuery.error) {
    if (validAccountQuery.error.validation) {
      const { runtimeValidation, error } = validAccountQuery.error.validation;
      console.log("❌ Validation Error:", JSON.stringify(error, null, 2));
      console.log(`   Runtime Validation: ${runtimeValidation}`);
    } else if (validAccountQuery.error.rpc) {
      console.log("❌ RPC Error:", validAccountQuery.error.rpc);
    }
  } else {
    console.log("✅ Valid query successful!");
    const account = validAccountQuery.result as unknown as AccountInfo;
    console.log(`   Account ID: ${account.accountId}`);
    console.log(`   Balance: ${account.amount}`);
  }
}

async function invalidRequestExample(client: RpcClient) {
  console.log("📋 Example 3: Invalid Request (Missing Required Field)");
  console.log("Making an invalid query request (missing accountId)...");

  try {
    // @ts-expect-error - Intentionally invalid request for demonstration
    const invalidQuery = await client.query({
      requestType: "view_account",
      finality: "final",
      // Missing required accountId field
    });

    if (invalidQuery.error?.validation) {
      const { runtimeValidation, error } = invalidQuery.error.validation;
      console.log("❌ Validation Error Caught:");
      console.log(`   Runtime Validation: ${runtimeValidation}`);
      console.log("   Error Details:", JSON.stringify(error, null, 2));
    } else {
      console.log("🤔 Expected validation error but got:", invalidQuery);
    }
  } catch (error) {
    console.log("❌ TypeScript/Runtime Error:", error);
  }
}

async function invalidFinalityExample(client: RpcClient) {
  console.log("📋 Example 4: Invalid Finality Value");
  console.log("Making a request with invalid finality value...");

  try {
    // @ts-expect-error - Intentionally invalid finality for demonstration
    const invalidFinalityQuery = await client.query({
      requestType: "view_account",
      finality: "invalid_finality_value",
      accountId: "test.near",
    });

    if (invalidFinalityQuery.error?.validation) {
      const { runtimeValidation, error } =
        invalidFinalityQuery.error.validation;
      console.log("❌ Validation Error Caught:");
      console.log(`   Runtime Validation: ${runtimeValidation}`);
      console.log("   Error Details:", JSON.stringify(error, null, 2));
    } else {
      console.log(
        "🤔 Expected validation error but got:",
        invalidFinalityQuery
      );
    }
  } catch (error) {
    console.log("❌ TypeScript/Runtime Error:", error);
  }
}

function typeSafetyDemonstrationExample() {
  console.log("📋 Example 5: Type Safety Demonstration");
  console.log(
    "The following code would cause TypeScript errors (commented out):"
  );
  console.log(`
  // ❌ This would fail TypeScript compilation:
  // const badRequest = await client.block({
  //   finality: "invalid_value",  // Not assignable to type "optimistic" | "near-final" | "final"
  //   someInvalidField: "value"   // Object literal may only specify known properties
  // });
  
  // ❌ This would also fail TypeScript compilation:
  // const badQuery = await client.query({
  //   requestType: "invalid_type",  // Not assignable to union of valid request types
  //   finality: "final"
  // });
  `);

  console.log("✅ Type safety prevents these errors at compile time!");
}

async function typeSafeResponseHandlingExample(client: RpcClient) {
  console.log("📋 Example 6: Type-Safe Response Handling");
  console.log("Demonstrating proper typing of response objects...");

  const statusResponse = await client.status(null);

  if (statusResponse.error) {
    console.log("❌ Error getting status:", statusResponse.error);
  } else {
    // TypeScript knows the exact shape of the response
    const status = statusResponse.result;
    console.log("✅ Status retrieved with full type safety:");
    console.log(`   Chain ID: ${status.chainId}`);
    console.log(`   Protocol Version: ${status.protocolVersion}`);
    console.log(`   Latest Protocol Version: ${status.latestProtocolVersion}`);
    console.log(`   Latest Block Height: ${status.syncInfo.latestBlockHeight}`);
    console.log(`   Latest Block Hash: ${status.syncInfo.latestBlockHash}`);
    console.log(`   Node Public Key: ${status.nodePublicKey}`);
    console.log(`   Syncing: ${status.syncInfo.syncing}`);
  }
}

function printSummary() {
  console.log("\n🎉 Validation and Type Safety Demo Complete!");
  console.log("Key Benefits:");
  console.log(
    "  • Runtime validation catches invalid requests before they're sent"
  );
  console.log("  • TypeScript provides compile-time type checking");
  console.log("  • Zod schemas ensure data integrity");
  console.log(
    "  • Structured error handling for both validation and RPC errors"
  );
}

function printSeparator() {
  console.log("\n" + "=".repeat(60) + "\n");
}

async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });

  // Create client with runtime validation enabled for all types
  const client = createClient({
    transporter,
    runtimeValidation: { request: true, response: true, error: true },
  });

  console.log("🛡️ NEAR JSON-RPC Client - Type-Safe & Zod Validation Example\n");

  // Run all examples
  await validBlockRequestExample(client);
  printSeparator();

  await validAccountQueryExample(client);
  printSeparator();

  await invalidRequestExample(client);
  printSeparator();

  await invalidFinalityExample(client);
  printSeparator();

  typeSafetyDemonstrationExample();
  printSeparator();

  await typeSafeResponseHandlingExample(client);

  printSummary();
}

main().catch(console.error);
