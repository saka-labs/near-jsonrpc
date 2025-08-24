/**
 * Gas Price Example
 *
 * This example demonstrates how to get the gas price for a NEAR account.
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

  console.log("🔑 NEAR JSON-RPC Client - Gas Price Example\n");

  const { result: gasPriceResponse, error: gasPriceError } =
    await client.gasPrice({});

  if (gasPriceError) {
    console.error("Error fetching gas price:", gasPriceError);
    return;
  }

  const { gasPrice } = gasPriceResponse;

  console.log("Gas price:", gasPrice, "\n");
}

main().catch(console.error);
