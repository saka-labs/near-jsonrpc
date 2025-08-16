/**
 * View Account Example
 *
 * This example demonstrates how to view account information using the NEAR JSON-RPC client.
 * It shows account details, state, and code information.
 */

import {
  jsonRpcTransporter,
  createClient,
  type RpcClient,
} from "@saka-labs/jsonrpc-client";

/**
 * Display account information including balance and storage usage
 */
async function displayAccountInfo(
  client: RpcClient,
  accountId: string
): Promise<void> {
  console.log(`=== Account Information for: ${accountId} ===`);

  const { result, error } = await client.query({
    requestType: "view_account",
    finality: "final",
    accountId: accountId,
  });

  if (error) {
    console.error("❌ Error fetching account info:", error);
    return;
  }

  const account = result as any;
  console.log(`💰 Balance: ${account.amount} yoctoNEAR`);
  console.log(`🔒 Locked: ${account.locked} yoctoNEAR`);
  console.log(`📦 Storage used: ${account.storageUsage} bytes`);
  console.log(`🔢 Code hash: ${account.codeHash}`);
  console.log(`🏗️  Block height: ${account.blockHeight}`);
  console.log(`🕐 Block hash: ${account.blockHash}`);
  console.log();
}

/**
 * Display account code information
 */
async function displayAccountCode(
  client: RpcClient,
  accountId: string
): Promise<void> {
  console.log(`=== Contract Code for: ${accountId} ===`);

  const { result, error } = await client.query({
    requestType: "view_code",
    finality: "final",
    accountId: accountId,
  });

  if (error) {
    console.error("❌ Error fetching account code:", error);
    return;
  }

  const codeResult = result as any;
  const codeSize = codeResult.code?.length || 0;
  const hasContract = codeSize > 0;

  console.log(`📄 Has contract: ${hasContract ? "Yes" : "No"}`);
  console.log(`📏 Code size: ${codeSize} bytes`);
  console.log(`🔢 Code hash: ${codeResult.codeHash}`);
  console.log(`🏗️  Block height: ${codeResult.blockHeight}`);
  console.log(`🕐 Block hash: ${codeResult.blockHash}`);

  if (hasContract) {
    console.log(`✅ This account has a smart contract deployed`);
  } else {
    console.log(`ℹ️  This is a regular account (no contract)`);
  }
  console.log();
}

/**
 * Display account state (storage key-value pairs)
 */
async function displayAccountState(
  client: RpcClient,
  accountId: string
): Promise<void> {
  console.log(`=== Account State for: ${accountId} ===`);

  const { result, error } = await client.query({
    requestType: "view_state",
    finality: "final",
    accountId: accountId,
    prefixBase64: "", // Empty prefix to get all state
  });

  if (error) {
    console.error("❌ Error fetching account state:", error);
    return;
  }

  const stateResult = result as any;
  const values = stateResult.values || [];
  console.log(`🗂️  Total state entries: ${values.length}`);

  if (values.length > 0) {
    console.log("\n📋 Sample state entries (first 5):");
    values.slice(0, 5).forEach((entry: any, index: number) => {
      // Decode base64 key and value for display
      const key = Buffer.from(entry.key, "base64").toString("utf8");
      const value = Buffer.from(entry.value, "base64").toString("utf8");

      console.log(`  ${index + 1}. Key: "${key}"`);
      console.log(
        `     Value: "${
          value.length > 100 ? value.slice(0, 100) + "..." : value
        }"`
      );
      console.log();
    });

    if (values.length > 5) {
      console.log(`     ... and ${values.length - 5} more entries`);
    }
  } else {
    console.log("📭 No state entries found (empty storage)");
  }

  console.log(`🏗️  Block height: ${stateResult.blockHeight}`);
  console.log(`🕐 Block hash: ${stateResult.blockHash}`);
  console.log();
}

/**
 * Check if an account exists
 */
async function checkAccountExists(
  client: RpcClient,
  accountId: string
): Promise<boolean> {
  const { error } = await client.query({
    requestType: "view_account",
    finality: "final",
    accountId: accountId,
  });

  return !error;
}

/**
 * Main function that demonstrates account viewing functionality
 */
async function main(): Promise<void> {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  console.log("👁️  NEAR JSON-RPC Client - View Account Example\n");

  // Example accounts to demonstrate different scenarios
  const accounts = [
    "test.near", // Regular account
    "wrap.testnet", // Contract account
    "nonexistent.near", // Non-existent account
  ];

  try {
    for (const accountId of accounts) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🔍 Examining account: ${accountId}`);
      console.log(`${"=".repeat(60)}\n`);

      // First check if account exists
      const exists = await checkAccountExists(client, accountId);

      if (!exists) {
        console.log(`❌ Account "${accountId}" does not exist\n`);
        continue;
      }

      console.log(`✅ Account "${accountId}" exists\n`);

      // Display account information
      await displayAccountInfo(client, accountId);

      // Display contract code information
      await displayAccountCode(client, accountId);

      // Display account state (be careful with large contracts)
      await displayAccountState(client, accountId);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(
      "📝 Example completed! Try changing the account IDs to explore different accounts."
    );
    console.log(`${"=".repeat(60)}`);
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
