import {
  jsonRpcTransporter,
  NearRpcEndpoint,
  JSON_RPC_TRANSPORTER_ERROR_CODE,
} from "../../src/transporter";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("jsonRpcTransporter", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("makes successful RPC calls", async () => {
    const mockResponse = {
      jsonrpc: "2.0",
      id: "dontcare",
      result: { success: true },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const transporter = jsonRpcTransporter({
      endpoint: NearRpcEndpoint.Testnet,
    });

    const result = await transporter("status", {});

    expect(mockFetch).toHaveBeenCalledWith(
      NearRpcEndpoint.Testnet,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "dontcare",
          method: "status",
          params: {},
        }),
      })
    );

    expect(result).toEqual({
      result: { success: true },
      error: undefined,
    });
  });

  it("handles RPC errors", async () => {
    const mockResponse = {
      jsonrpc: "2.0",
      id: "dontcare",
      error: { code: -32602, message: "Invalid params" },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const transporter = jsonRpcTransporter({
      endpoint: NearRpcEndpoint.Testnet,
    });

    const result = await transporter("invalid_method", {});

    expect(result).toEqual({
      result: undefined,
      error: { code: -32602, message: "Invalid params" },
    });
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failed"));

    const transporter = jsonRpcTransporter({
      endpoint: NearRpcEndpoint.Testnet,
    });

    const result = await transporter("status", {});

    expect(result).toEqual({
      result: undefined,
      error: {
        code: JSON_RPC_TRANSPORTER_ERROR_CODE,
        message: "Network failed",
        data: undefined,
      },
    });
  });

  it("handles HTTP errors and captures response text", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal server error"),
    });

    const transporter = jsonRpcTransporter({
      endpoint: NearRpcEndpoint.Testnet,
    });

    const result = await transporter("status", {});

    expect(result.error).toEqual({
      code: JSON_RPC_TRANSPORTER_ERROR_CODE,
      message: "HTTP error! Status: 500",
      data: {
        statusCode: 500,
        responseText: "Internal server error",
      },
    });
  });
});
