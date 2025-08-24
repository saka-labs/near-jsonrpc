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

  const { result, error } = await client.queryViewAccount({
    accountId: "near.testnet",
    syncCheckpoint: "earliest_available",
  });
  if (error) {
    throw new Error("Error getting account!!");
  }

  const viewAccount = DiscriminateRpcQueryResponse(result).AccountView;
  if (viewAccount) {
    console.log(viewAccount.amount);
  }
}

main();
