/**
 * Transactions Example
 *
 * This example demonstrates how to sign and send transactions using the NEAR JSON-RPC client.
 * It covers transaction creation, signing with a keypair, and sending signed_tx_base64 to the network.
 */

import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";
import type { AccessKey } from "@saka-labs/near-jsonrpc-types/schemas";
import { transactions, utils, KeyPairSigner } from "near-api-js";

// Configuration
const RPC_URL = "https://rpc.testnet.near.org";
const SENDER_ACCOUNT_ID = "sender.testnet";
const RECEIVER_ACCOUNT_ID = "receiver.testnet";

// Private key - set this in your environment: export NEAR_PRIVATE_KEY="ed25519:..."
const PRIVATE_KEY = (process.env.NEAR_PRIVATE_KEY ||
  "ed25519:your-private-key-here") as any;

/**
 * Main transaction example: Create, sign, and send a transaction
 */
async function sendTransactionExample() {
  try {
    // 1. Create JSON-RPC client
    const transporter = jsonRpcTransporter({ endpoint: RPC_URL });
    const client = createClient({ transporter });

    // 2. Setup keypair for signing
    const keyPair = KeyPairSigner.fromSecretKey(PRIVATE_KEY);
    const publicKey = await keyPair.getPublicKey();

    console.log(
      `📝 Sending 0.1 NEAR from ${SENDER_ACCOUNT_ID} to ${RECEIVER_ACCOUNT_ID}\n`
    );

    // 3. Get current nonce and recent block hash
    console.log("1️⃣ Fetching transaction requirements...");

    const [accessKeyResponse, statusResponse] = await Promise.all([
      client.query({
        requestType: "view_access_key",
        finality: "final",
        accountId: SENDER_ACCOUNT_ID,
        publicKey: publicKey.toString(),
      }),
      client.status(null),
    ]);

    if (accessKeyResponse.error || (accessKeyResponse.result as any)?.error) {
      throw new Error(
        `Access key error: ${
          accessKeyResponse.error?.rpc?.message ||
          (accessKeyResponse.result as any)?.error
        }`
      );
    }
    if (statusResponse.error?.rpc) {
      throw new Error(`Status error: ${statusResponse.error.rpc?.message}`);
    }
    if (statusResponse.error?.validation) {
      throw new Error(
        `Status error: ${statusResponse.error.validation?.error}`
      );
    }

    if (statusResponse.error) {
      console.error("Error fetching status:", statusResponse.error);
      throw new Error("Error fetching status");
    }

    const {
      result: {
        syncInfo: { latestBlockHash },
      },
    } = statusResponse;

    const accessKey = accessKeyResponse.result as AccessKey;
    const nonce = accessKey.nonce + 1;
    const recentBlockHash = utils.serialize.base_decode(latestBlockHash);

    console.log(
      `   ✓ Nonce: ${nonce}, Block hash: ${latestBlockHash.slice(0, 10)}...`
    );

    // 4. Create and sign transaction
    console.log("2️⃣ Creating and signing transaction...");

    const actions = [
      transactions.transfer(BigInt("100000000000000000000000")), // 0.1 NEAR
    ];

    const transaction = transactions.createTransaction(
      SENDER_ACCOUNT_ID,
      publicKey,
      RECEIVER_ACCOUNT_ID,
      nonce,
      actions,
      recentBlockHash
    );

    // Sign the transaction
    const [, signedTransaction] = await keyPair.signTransaction(transaction);
    console.log("   ✓ Transaction signed successfully");

    // 5. Serialize to base64 and send via JSON-RPC client
    console.log("3️⃣ Sending transaction to network...");

    const signedTxBase64 = Buffer.from(signedTransaction.encode()).toString(
      "base64"
    );

    const result = await client.sendTx({
      signedTxBase64,
      waitUntil: "FINAL",
    });

    if (result.error) {
      console.error("❌ Transaction failed:", result.error);
      return;
    }

    const hash = result.result.transaction.hash;
    const gasBurnt = result.result.transactionOutcome.outcome.gasBurnt;

    // Get transaction status
    const { result: txStatus, error: txError } = await client.tx({
      txHash: hash,
      senderAccountId: SENDER_ACCOUNT_ID,
      waitUntil: "FINAL",
    });

    if (txError) {
      console.error("❌ Error getting transaction status:", txError);
      return;
    }

    console.log("   ✓ Transaction status confirmed");
    // console.log(txStatus);

    // 6. Display results
    console.log("✅ Transaction successful!\n");
    console.log("📊 Results:");
    console.log(`   Transaction ID: ${hash}`);
    console.log(`   Gas used: ${gasBurnt}`);
    console.log(`   Explorer: https://testnet.nearblocks.io/txns/${hash}`);

    console.log("\n💡 This example demonstrates:");
    console.log("   • Creating transactions with near-api-js");
    console.log("   • Signing with keypair");
    console.log(
      "   • Sending signed_tx_base64 via @saka-labs/near-jsonrpc-client"
    );
  } catch (error) {
    console.error("❌ Error:", error.message || error);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("🔗 NEAR JSON-RPC Client - Transaction Example\n");

  if (PRIVATE_KEY !== "ed25519:your-private-key-here") {
    await sendTransactionExample();
  } else {
    console.log(
      "🔧 Transaction Example (SKIPPED - Set NEAR_PRIVATE_KEY to run)\n"
    );
  }
}

// Run the example
main().catch(console.error);
