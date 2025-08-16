import {
  jsonRpcQueryKeys,
  createMethodQueryKey,
  getMethodQueryKeys,
} from "../src/query-keys";
import {
  block,
  status,
  broadcastTxCommit,
} from "@saka-labs/jsonrpc-types/methods";

describe("jsonRpcQueryKeys", () => {
  describe("all", () => {
    it("should return base query key", () => {
      expect(jsonRpcQueryKeys.all).toEqual(["jsonrpc"]);
    });
  });

  describe("method", () => {
    it("should create query key with method name only when params is undefined", () => {
      const result = jsonRpcQueryKeys.method("status", undefined);
      expect(result).toEqual(["jsonrpc", "status"]);
    });

    it("should create query key with method name only when params is null", () => {
      const result = jsonRpcQueryKeys.method("status", null);
      expect(result).toEqual(["jsonrpc", "status"]);
    });

    it("should create query key with method name and params when params is provided", () => {
      const blockParams = { finality: "final" as const };
      const result = jsonRpcQueryKeys.method("block", blockParams);
      expect(result).toEqual(["jsonrpc", "block", blockParams]);
    });

    it("should handle complex params object", () => {
      const queryParams = {
        request_type: "view_account" as const,
        account_id: "test.near",
        finality: "final" as const,
      };
      const result = jsonRpcQueryKeys.method("query", queryParams);
      expect(result).toEqual(["jsonrpc", "query", queryParams]);
    });

    it("should handle empty object params", () => {
      const emptyParams = {};
      const result = jsonRpcQueryKeys.method("block", emptyParams);
      expect(result).toEqual(["jsonrpc", "block", emptyParams]);
    });

    it("should handle array params", () => {
      const txParams = ["signed-transaction-string"];
      const result = jsonRpcQueryKeys.method("broadcast_tx_commit", txParams);
      expect(result).toEqual(["jsonrpc", "broadcast_tx_commit", txParams]);
    });
  });
});

describe("createMethodQueryKey", () => {
  it("should create query key using method object with no params", () => {
    const result = createMethodQueryKey(status.methodName, null);
    expect(result).toEqual(["jsonrpc", "status"]);
  });

  it("should create query key using method object with params", () => {
    const blockParams = { finality: "final" as const };
    const result = createMethodQueryKey(block.methodName, blockParams);
    expect(result).toEqual(["jsonrpc", "block", blockParams]);
  });

  it("should create query key for transaction method", () => {
    const txParams = ["signed-tx"];
    const result = createMethodQueryKey(broadcastTxCommit.methodName, txParams);
    expect(result).toEqual(["jsonrpc", "broadcast_tx_commit", txParams]);
  });

  it("should handle undefined params", () => {
    const result = createMethodQueryKey(status.methodName, undefined);
    expect(result).toEqual(["jsonrpc", "status"]);
  });
});

describe("getMethodQueryKeys", () => {
  it("should return query key pattern for method", () => {
    const result = getMethodQueryKeys(block.methodName);
    expect(result).toEqual(["jsonrpc", "block"]);
  });

  it("should return query key pattern for status method", () => {
    const result = getMethodQueryKeys(status.methodName);
    expect(result).toEqual(["jsonrpc", "status"]);
  });

  it("should return query key pattern for transaction method", () => {
    const result = getMethodQueryKeys(broadcastTxCommit.methodName);
    expect(result).toEqual(["jsonrpc", "broadcast_tx_commit"]);
  });

  it("should always return the same pattern regardless of params", () => {
    // This function doesn't take params, so it should always return the same pattern
    const result1 = getMethodQueryKeys(block.methodName);
    const result2 = getMethodQueryKeys(block.methodName);
    expect(result1).toEqual(result2);
    expect(result1).toEqual(["jsonrpc", "block"]);
  });
});
