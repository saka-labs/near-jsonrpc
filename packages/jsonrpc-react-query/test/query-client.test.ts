import { QueryClient } from "@tanstack/react-query";
import {
  createJsonRpcQueryClient,
  defaultJsonRpcQueryConfig,
  JsonRpcQueryCache,
} from "../src/query-client";
import { block, status } from "@saka-labs/jsonrpc-types/methods";

// Mock QueryClient
const mockInvalidateQueries = jest.fn();
const mockRemoveQueries = jest.fn();
const mockGetQueryData = jest.fn();
const mockSetQueryData = jest.fn();

jest.mocked(QueryClient).mockImplementation(
  () =>
    ({
      invalidateQueries: mockInvalidateQueries,
      removeQueries: mockRemoveQueries,
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
    } as any)
);

describe("defaultJsonRpcQueryConfig", () => {
  it("should have correct default configuration", () => {
    expect(defaultJsonRpcQueryConfig).toEqual({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 30 * 60 * 1000, // 30 minutes
          retry: 3,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  });
});

describe("createJsonRpcQueryClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create QueryClient with default config when no config provided", () => {
    createJsonRpcQueryClient();

    expect(QueryClient).toHaveBeenCalledWith({
      ...defaultJsonRpcQueryConfig,
      defaultOptions: {
        ...defaultJsonRpcQueryConfig.defaultOptions,
        queries: {
          ...defaultJsonRpcQueryConfig.defaultOptions.queries,
        },
        mutations: {
          ...defaultJsonRpcQueryConfig.defaultOptions.mutations,
        },
      },
    });
  });

  it("should merge custom config with defaults", () => {
    const customConfig = {
      defaultOptions: {
        queries: {
          staleTime: 10 * 60 * 1000, // 10 minutes
          retry: 5,
        },
        mutations: {
          retry: 2,
        },
      },
    };

    createJsonRpcQueryClient(customConfig);

    expect(QueryClient).toHaveBeenCalledWith({
      ...defaultJsonRpcQueryConfig,
      ...customConfig,
      defaultOptions: {
        ...defaultJsonRpcQueryConfig.defaultOptions,
        ...customConfig.defaultOptions,
        queries: {
          ...defaultJsonRpcQueryConfig.defaultOptions.queries,
          ...customConfig.defaultOptions.queries,
        },
        mutations: {
          ...defaultJsonRpcQueryConfig.defaultOptions.mutations,
          ...customConfig.defaultOptions.mutations,
        },
      },
    });
  });

  it("should preserve non-defaultOptions custom config", () => {
    const customConfig = {
      logger: {
        log: console.log,
        warn: console.warn,
        error: console.error,
      },
      defaultOptions: {
        queries: {
          staleTime: 15 * 60 * 1000,
        },
      },
    };

    createJsonRpcQueryClient(customConfig);

    expect(QueryClient).toHaveBeenCalledWith(
      expect.objectContaining({
        logger: customConfig.logger,
      })
    );
  });

  it("should handle partial config overrides", () => {
    const customConfig = {
      defaultOptions: {
        queries: {
          retry: 1,
          // staleTime should use default
        },
        // mutations should use defaults
      },
    };

    createJsonRpcQueryClient(customConfig);

    expect(QueryClient).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultOptions: expect.objectContaining({
          queries: expect.objectContaining({
            retry: 1,
            staleTime: 5 * 60 * 1000, // default
          }),
          mutations: expect.objectContaining({
            retry: 1, // default
          }),
        }),
      })
    );
  });
});

describe("JsonRpcQueryCache", () => {
  let queryClient: QueryClient;
  let cache: JsonRpcQueryCache;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient();
    cache = new JsonRpcQueryCache(queryClient);
  });

  describe("invalidateMethod", () => {
    it("should call invalidateQueries with correct queryKey", () => {
      cache.invalidateMethod("block");

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["jsonrpc", "block"],
      });
    });

    it("should handle different method names", () => {
      cache.invalidateMethod("status");

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["jsonrpc", "status"],
      });
    });
  });

  describe("invalidateAll", () => {
    it("should call invalidateQueries with jsonrpc base key", () => {
      cache.invalidateAll();

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["jsonrpc"],
      });
    });
  });

  describe("removeMethod", () => {
    it("should call removeQueries with correct queryKey", () => {
      cache.removeMethod("block");

      expect(mockRemoveQueries).toHaveBeenCalledWith({
        queryKey: ["jsonrpc", "block"],
      });
    });
  });

  describe("removeAll", () => {
    it("should call removeQueries with jsonrpc base key", () => {
      cache.removeAll();

      expect(mockRemoveQueries).toHaveBeenCalledWith({
        queryKey: ["jsonrpc"],
      });
    });
  });

  describe("prefetchMethod", () => {
    it("should throw error indicating prefetch is not implemented", async () => {
      await expect(
        cache.prefetchMethod(block, { finality: "final" })
      ).rejects.toThrow(
        "Prefetch functionality requires transporter access. Use useJsonRpcQuery with suspense instead."
      );
    });
  });

  describe("getMethodData", () => {
    it("should call getQueryData with correct queryKey for method with params", () => {
      const params = { finality: "final" as const };
      cache.getMethodData("block", params);

      expect(mockGetQueryData).toHaveBeenCalledWith([
        "jsonrpc",
        "block",
        params,
      ]);
    });

    it("should call getQueryData with correct queryKey for method without params", () => {
      cache.getMethodData("status");

      expect(mockGetQueryData).toHaveBeenCalledWith(["jsonrpc", "status"]);
    });

    it("should handle null params", () => {
      cache.getMethodData("status", null);

      expect(mockGetQueryData).toHaveBeenCalledWith(["jsonrpc", "status"]);
    });

    it("should handle undefined params", () => {
      cache.getMethodData("status", undefined);

      expect(mockGetQueryData).toHaveBeenCalledWith(["jsonrpc", "status"]);
    });
  });

  describe("setMethodData", () => {
    it("should call setQueryData with correct queryKey and data for method with params", () => {
      const params = { finality: "final" as const };
      const data = { header: { hash: "test-hash" } };

      cache.setMethodData("block", params, data);

      expect(mockSetQueryData).toHaveBeenCalledWith(
        ["jsonrpc", "block", params],
        data
      );
    });

    it("should call setQueryData with correct queryKey for method without params", () => {
      const data = { version: { version: "1.0.0" } };

      cache.setMethodData("status", undefined, data);

      expect(mockSetQueryData).toHaveBeenCalledWith(
        ["jsonrpc", "status"],
        data
      );
    });

    it("should handle null params", () => {
      const data = { version: { version: "1.0.0" } };

      cache.setMethodData("status", null, data);

      expect(mockSetQueryData).toHaveBeenCalledWith(
        ["jsonrpc", "status"],
        data
      );
    });
  });
});
