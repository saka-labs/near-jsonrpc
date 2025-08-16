/**
 * NEAR JSON-RPC React Query Demo
 *
 * A beautiful showcase of type-safe NEAR blockchain data fetching
 * using @saka-labs/jsonrpc-react-query with React Query.
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  JsonRpcQueryProvider,
  useJsonRpcQuery,
  jsonRpcTransporter,
} from "@saka-labs/jsonrpc-react-query";
import {
  status,
  block,
  gasPrice,
  query,
} from "@saka-labs/jsonrpc-types/methods";
import { DiscriminateRpcQueryResponse } from "@saka-labs/jsonrpc-types";
import "./styles.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();
const transporter = jsonRpcTransporter({
  endpoint: "https://rpc.testnet.fastnear.com	",
});

function NetworkStatus() {
  const { data, isLoading, error } = useJsonRpcQuery(status, null, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3>🌐 Network Status</h3>
        <span className="badge">Live</span>
      </div>
      <div className="card-content">
        {isLoading && <div className="loading">Loading network status...</div>}
        {error && <div className="error">❌ {error.message}</div>}
        {data && (
          <div className="data-grid">
            <div className="data-item">
              <span className="label">Chain ID:</span>
              <span className="value">{data.chainId}</span>
            </div>
            <div className="data-item">
              <span className="label">Latest Block:</span>
              <span className="value highlight">
                {data.syncInfo?.latestBlockHeight?.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LatestBlock() {
  const { data, isLoading, error } = useJsonRpcQuery(
    block,
    { finality: "final" },
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
    }
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>🧱 Latest Block</h3>
        <span className="badge">Live</span>
      </div>
      <div className="card-content">
        {isLoading && <div className="loading">Fetching latest block...</div>}
        {error && <div className="error">❌ {error.message}</div>}
        {data && (
          <div className="data-grid">
            <div className="data-item">
              <span className="label">Height:</span>
              <span className="value highlight">
                {data.header?.height?.toLocaleString()}
              </span>
            </div>
            <div className="data-item full-width">
              <span className="label">Hash:</span>
              <span className="value hash">{data.header?.hash}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountViewer() {
  const [accountId, setAccountId] = React.useState("test.near");

  const { data, isLoading, error } = useJsonRpcQuery(
    query,
    {
      requestType: "view_account",
      finality: "final",
      accountId: accountId,
    },
    {
      enabled: !!accountId,
    }
  );

  const accountView = data
    ? DiscriminateRpcQueryResponse(data).AccountView
    : undefined;

  return (
    <div className="card">
      <div className="card-header">
        <h3>👤 Account Viewer</h3>
      </div>
      <div className="card-content">
        <div className="input-group">
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Enter account ID (e.g., near, vitalik.near)"
            className="account-input"
          />
        </div>

        {isLoading && <div className="loading">Looking up account...</div>}
        {error && <div className="error">❌ {error.message}</div>}
        {accountView && (
          <div className="data-grid">
            <div className="data-item">
              <span className="label">Balance:</span>
              <span className="value balance">
                {(BigInt(accountView.amount) / BigInt(10 ** 24)).toString()}{" "}
                NEAR
              </span>
            </div>
            <div className="data-item">
              <span className="label">Storage Used:</span>
              <span className="value">
                {accountView.storageUsage?.toLocaleString()} bytes
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GasPriceDisplay() {
  const { data, isLoading, refetch } = useJsonRpcQuery(gasPrice, {});

  return (
    <div className="card">
      <div className="card-header">
        <h3>⛽ Gas Price</h3>
      </div>
      <div className="card-content">
        {isLoading ? (
          <div className="loading">Fetching gas price...</div>
        ) : (
          <div className="data-grid">
            <div className="data-item">
              <span className="label">Current Price:</span>
              <span className="value gas-price">
                {data?.gasPrice} yoctoNEAR
              </span>
            </div>
            <button onClick={() => refetch()} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JsonRpcQueryProvider config={{ transporter, runtimeValidation: true }}>
        <div className="app">
          <header className="app-header">
            <h1>⚡ NEAR JSON-RPC</h1>
            <p>Real-time blockchain data with React Query</p>
          </header>

          <main className="grid-container">
            <NetworkStatus />
            <LatestBlock />
            <AccountViewer />
            <GasPriceDisplay />
          </main>

          <footer className="app-footer">
            <p>
              Powered by <strong>@saka-labs/jsonrpc-react-query</strong>
            </p>
          </footer>
        </div>
        <ReactQueryDevtools />
      </JsonRpcQueryProvider>
    </QueryClientProvider>
  );
}

export default App;
