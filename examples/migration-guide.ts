/**
 * Migration Guide: Old vs New Patterns
 *
 * Simple comparison between old generic methods and new discriminated methods.
 */

import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";
import { DiscriminateRpcQueryResponse } from "@saka-labs/near-jsonrpc-types";

async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  console.log("=== Migration Guide ===\n");

  // ❌ OLD: Generic query method
  console.log("OLD PATTERN:");
  const oldResult = await client.query({
    requestType: "view_account",
    accountId: "near.testnet",
    finality: "final",
  });
  console.log(`Balance: ${(oldResult.result as any).amount} yoctoNEAR\n`);

  // ✅ NEW: Discriminated method + helper
  console.log("NEW PATTERN:");
  const { result, error } = await client.queryViewAccount({
    accountId: "near.testnet",
    finality: "final",
  });

  if (!error) {
    const account = DiscriminateRpcQueryResponse(result).AccountView;
    if (account) {
      console.log(`Balance: ${account.amount} yoctoNEAR`);
      console.log(`Storage: ${account.storageUsage} bytes`);
    }
  }

  console.log("\n✅ Benefits:");
  console.log("• Better type safety");
  console.log("• Auto-completion support");
  console.log("• Less boilerplate code");
  console.log("• Automatic discriminator handling");
}

main().catch(console.error);
