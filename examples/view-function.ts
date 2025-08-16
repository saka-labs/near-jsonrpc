/**
 * View Function Example
 *
 * This example demonstrates how to call a view function on a NEAR account.
 */

import { jsonRpcTransporter, createClient } from "@saka-labs/jsonrpc-client";

async function main() {
  const transporter = jsonRpcTransporter({
    endpoint: "https://rpc.testnet.near.org",
  });
  const client = createClient({ transporter });

  console.log("🔑 NEAR JSON-RPC Client - View Function Example\n");

  const { result: callFunctionResponse, error: callFunctionError } =
    await client.query({
      requestType: "call_function",
      accountId: "guest-book.testnet",
      methodName: "getMessages",
      argsBase64: Buffer.from(JSON.stringify({})).toString("base64"),
      finality: "final",
    });

  if (callFunctionError) {
    console.error("Error fetching gas price:", callFunctionError);
    return;
  }

  const { result: callFunctionResult } = callFunctionResponse as any;

  console.log(
    "View function response:",
    JSON.parse(Buffer.from(callFunctionResult).toString()),
    "\n"
  );
}

main().catch(console.error);
