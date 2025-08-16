/**
 * Access Keys Example
 *
 * This example demonstrates how to using runtime validation to access error properties.
 */

import { jsonRpcTransporter, createClient } from "@saka-labs/jsonrpc-client";

async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  console.log("🔑 NEAR JSON-RPC Client - Access Keys Example\n");

  // You can change this to any account ID you want to inspect
  const accountId = "test.near";
  console.log(`Account ID whose keys we're listing: ${accountId}\n`);

  // Query access keys for the account
  const { error: accessKeyError } = await client.query({
    requestType: "view_access_key_list",
    finality: "final",
    accountId: accountId,
  });

  if (accessKeyError) {
    // if it's a rpc error, print the rpc error
    if (accessKeyError.rpc) {
      console.error("Error fetching access keys:", accessKeyError.rpc);
    }

    // if it's a validation error, print the validation error
    if (accessKeyError.validation) {
      if (accessKeyError.validation.runtimeValidation === "request") {
        console.error(
          "Error fetching access keys:",
          accessKeyError.validation.error.properties?.requestType
        );
      }
      if (accessKeyError.validation.runtimeValidation === "response") {
        console.error(
          "Error fetching access keys:",
          accessKeyError.validation.error.properties?.blockHash
        );
      }
      if (accessKeyError.validation.runtimeValidation === "error") {
        console.error(
          "Error fetching access keys:",
          accessKeyError.validation.error.properties?.code
        );
      }
    }
  }
}

main().catch(console.error);
