/**
 * Access Keys Example
 *
 * This example demonstrates how to list access keys for a NEAR account.
 */

import { jsonRpcTransporter, createClient } from "@saka-labs/jsonrpc-client";
import { AccessKeyList } from "@saka-labs/jsonrpc-types/schemas";

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
  const { result: accessKeyResponse, error: accessKeyError } =
    await client.query({
      requestType: "view_access_key_list",
      finality: "final",
      accountId: accountId,
    });

  if (accessKeyError) {
    console.error("Error fetching access keys:", accessKeyError);
    return;
  }

  // Display the access keys
  const accessKeyList = accessKeyResponse as AccessKeyList;
  if (accessKeyList && accessKeyList.keys) {
    const accessKeys = accessKeyList.keys;
    for (const accessKey of accessKeys) {
      console.log(`🗝 [${accessKey.publicKey}]`);
      console.log(` ↳ nonce: ${accessKey.accessKey.nonce}`);
      console.log(
        ` ↳ permission: ${JSON.stringify(
          accessKey.accessKey.permission,
          null,
          2
        )}`
      );
      console.log();
    }
    console.log(`\nTotal access keys found: ${accessKeys.length}`);
  } else {
    console.log("No access keys found or unexpected response structure");
  }
}

main().catch(console.error);
