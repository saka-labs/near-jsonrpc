/**
 * Network Example
 *
 * This example demonstrates how to query network status, network info, and validators
 * using the NEAR JSON-RPC client.
 */

import {
  jsonRpcTransporter,
  createClient,
  type RpcClient,
} from "@saka-labs/near-jsonrpc-client";

/**
 * Display network status information
 */
async function displayNetworkStatus(client: RpcClient): Promise<void> {
  console.log("=== Network Status ===");

  const { result: status, error } = await client.status(null);

  if (error) {
    console.error("❌ Error fetching network status:", error);
    return;
  }

  console.log(`📊 Chain ID: ${status.chainId}`);
  console.log(`🔗 Latest block height: ${status.syncInfo.latestBlockHeight}`);
  console.log(
    `⏰ Latest block time: ${new Date(
      status.syncInfo.latestBlockTime
    ).toISOString()}`
  );
  console.log(`📡 Version: ${status.version.version}`);
  console.log();
}

/**
 * Display network information including peers and producers
 */
async function displayNetworkInfo(client: RpcClient): Promise<void> {
  console.log("=== Network Info ===");

  const { result: networkInfo, error } = await client.networkInfo(null);

  if (error) {
    console.error("❌ Error fetching network info:", error);
    return;
  }

  // Basic network stats
  console.log(`📬 Active peers: ${networkInfo.numActivePeers}`);
  console.log(`👥 Max peer count: ${networkInfo.peerMaxCount}`);
  console.log(`📤 Sent bytes per second: ${networkInfo.sentBytesPerSec}`);
  console.log(
    `📥 Received bytes per second: ${networkInfo.receivedBytesPerSec}`
  );

  // Sample active peers
  if (networkInfo.activePeers && networkInfo.activePeers.length > 0) {
    console.log("\n🔗 Sample active peers:");
    networkInfo.activePeers.slice(0, 3).forEach((peer, index) => {
      console.log(`  ${index + 1}. ${peer.id} (${peer.addr || "N/A"})`);
      if (peer.accountId) {
        console.log(`     Account: ${peer.accountId}`);
      }
    });
  }

  // Sample known producers
  if (networkInfo.knownProducers && networkInfo.knownProducers.length > 0) {
    console.log(`\n🏭 Known producers: ${networkInfo.knownProducers.length}`);
    console.log("Sample known producers:");
    networkInfo.knownProducers.slice(0, 3).forEach((producer, index) => {
      console.log(
        `  ${index + 1}. ${producer.accountId} (Peer: ${producer.peerId})`
      );
    });
  }

  console.log();
}

/**
 * Display validator information for the current and next epochs
 */
async function displayValidators(client: RpcClient): Promise<void> {
  console.log("=== Current Validators ===");

  const { result: validators, error } = await client.validators("latest");

  if (error) {
    console.error("❌ Error fetching validators:", error);
    return;
  }

  // Epoch information
  console.log(`🏛 Current validators (epoch ${validators.epochHeight}):`);
  console.log(`📊 Epoch start height: ${validators.epochStartHeight}`);

  // Current validators
  if (validators.currentValidators && validators.currentValidators.length > 0) {
    console.log(
      `\n👥 Active validators (${validators.currentValidators.length}):`
    );

    validators.currentValidators.slice(0, 5).forEach((validator, index) => {
      console.log(`  ${index + 1}. ${validator.accountId}`);
      console.log(`     💰 Stake: ${validator.stake}`);
      console.log(`     📈 Shards: [${validator.shards.join(", ")}]`);
      console.log(`     🔧 Public Key: ${validator.publicKey}`);
      console.log();
    });

    if (validators.currentValidators.length > 5) {
      console.log(
        `     ... and ${
          validators.currentValidators.length - 5
        } more validators`
      );
    }
  }

  // Additional validator information
  const additionalInfo = [
    {
      label: "🔄 Next epoch validators",
      count: validators.nextValidators?.length,
    },
    {
      label: "📝 Current proposals",
      count: validators.currentProposals?.length,
    },
    {
      label: "🎣 Current fishermen",
      count: validators.currentFishermen?.length,
    },
  ];

  additionalInfo.forEach(({ label, count }) => {
    if (count && count > 0) {
      console.log(`${label}: ${count}`);
    }
  });
}

/**
 * Main function that demonstrates all network-related queries
 */
async function main(): Promise<void> {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  console.log("🌐 NEAR JSON-RPC Client - Network Example\n");

  try {
    await displayNetworkStatus(client);
    await displayNetworkInfo(client);
    await displayValidators(client);
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
