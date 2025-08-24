/**
 * Selective Methods Example
 *
 * This example demonstrates how to create JSON-RPC clients with only specific methods
 * using createClientWithMethods. This reduces bundle size and creates focused clients.
 */

import {
  createClientWithMethods,
  jsonRpcTransporter,
} from "@saka-labs/near-jsonrpc-client";
import { block, status, gasPrice } from "@saka-labs/near-jsonrpc-types/methods";

async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });

  // Create client with only specific methods
  const client = createClientWithMethods({
    transporter,
    methods: { block, status, gasPrice }, // Only these methods are available
    runtimeValidation: { request: true, response: true, error: false },
  });

  console.log("🎯 NEAR JSON-RPC Client - Selective Methods Example\n");

  const { result: statusResult, error: statusError } = await client.status(
    null
  );

  const { result: blockResult, error: blockError } = await client.block({
    finality: "final",
  });

  const { result: gasPriceResult, error: gasPriceError } =
    await client.gasPrice({});

  if (statusError || blockError || gasPriceError) {
    console.error("Error occurred:", {
      statusError,
      blockError,
      gasPriceError,
    });
    return;
  }

  console.log("✅ Available methods:");
  console.log(`   Status: ${statusResult.chainId}`);
  console.log(`   Block height: ${blockResult.header.height}`);
  console.log(`   Gas price: ${gasPriceResult.gasPrice}`);

  // client.query() would cause TypeScript error - method not included!
  console.log("\n💡 Only included methods are available (TypeScript enforced)");
}

main().catch(console.error);
