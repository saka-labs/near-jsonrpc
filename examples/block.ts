/**
 * Block Example
 *
 * This example demonstrates how to fetch the latest block information from NEAR.
 */

import {
  jsonRpcTransporter,
  createClient,
} from "@saka-labs/near-jsonrpc-client";

async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  console.log("🧱 NEAR JSON-RPC Client - Block Example\n");

  // Query the latest block
  const { result: blockResponse, error: blockError } = await client.block({
    finality: "final",
  });

  if (blockError) {
    console.error("Error fetching block:", blockError);
    return;
  }

  // Display block information
  const block = blockResponse;
  if (block && block.header) {
    console.log("📊 Block Information:");
    console.log(`  Hash: ${block.header.hash}`);
    console.log(`  Height: ${block.header.height}`);
    const timestampMs = Math.floor(
      Number(block.header.timestampNanosec) / 1000000
    );
    const timestamp = isNaN(timestampMs)
      ? "Invalid timestamp"
      : new Date(timestampMs).toISOString();
    console.log(`  Timestamp: ${timestamp}`);
    console.log(`  Author: ${block.author}`);
    console.log(`  Gas Price: ${block.header.gasPrice}`);
    console.log(`  Total Supply: ${block.header.totalSupply}`);
    console.log(`  Previous Hash: ${block.header.prevHash}`);
    console.log(`  Previous Height: ${block.header.prevHeight}`);
    console.log(`  Chunks Included: ${block.header.chunksIncluded}`);
    console.log(`  Protocol Version: ${block.header.latestProtocolVersion}`);

    console.log("\n🔗 Chunks Information:");
    if (block.chunks && Array.isArray(block.chunks)) {
      block.chunks.forEach((chunk, index) => {
        console.log(`  Chunk ${index + 1}:`);
        console.log(`    Hash: ${chunk.chunkHash}`);
        console.log(`    Shard ID: ${chunk.shardId}`);
        console.log(`    Gas Limit: ${chunk.gasLimit}`);
        console.log(`    Gas Used: ${chunk.gasUsed}`);
        console.log(`    Height Created: ${chunk.heightCreated}`);
        console.log(`    Height Included: ${chunk.heightIncluded}`);
        if (chunk.congestionInfo) {
          console.log(
            `    Allowed Shard: ${chunk.congestionInfo.allowedShard}`
          );
          console.log(
            `    Receipt Bytes: ${chunk.congestionInfo.receiptBytes}`
          );
        }
        console.log();
      });
    }

    console.log(`Total chunks in block: ${block.chunks?.length || 0}`);
  } else {
    console.log("No block data found or unexpected response structure");
  }
}

main().catch(console.error);
``;
