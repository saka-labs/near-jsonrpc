import { jsonRpcTransporter, createClient } from "@saka-labs/jsonrpc-client";
async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  const result = await client.queryViewAccount({
    accountId: "near.testnet",
    syncCheckpoint: "earliest_available",
  });

  console.log(result);
}

main();
