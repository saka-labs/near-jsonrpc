import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import {
  createClientWithMethods,
  jsonRpcTransporter,
  NearRpcEndpoint,
} from "@saka-labs/near-jsonrpc-client";
import { block, status } from "@saka-labs/near-jsonrpc-types/methods";
import { useJsonRpcQuery } from "../src/use-jsonrpc-query";
import { JsonRpcQueryProvider } from "../src/context";
import type { JsonRpcQueryConfig } from "../src/types";

const createMockQueryResult = (overrides = {}) =>
  ({
    data: { result: { header: { hash: "test-hash" } } },
    error: null,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    isStale: false,
    refetch: jest.fn(),
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: "idle" as const,
    status: "success" as const,
    isFetched: true,
    isFetchedAfterMount: true,
    isInitialLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useQuery>);

jest.mocked(useQuery).mockImplementation(() => createMockQueryResult());

jest.mocked(createClientWithMethods).mockImplementation(
  () =>
    ({
      block: jest
        .fn()
        .mockResolvedValue({ result: { header: { hash: "test-hash" } } }),
      status: jest
        .fn()
        .mockResolvedValue({ result: { version: { version: "1.0.0" } } }),
    } as any)
);

describe("useJsonRpcQuery", () => {
  const mockTransporter = jsonRpcTransporter({
    endpoint: NearRpcEndpoint.Testnet,
  });

  const mockConfig: JsonRpcQueryConfig = {
    transporter: mockTransporter,
    runtimeValidation: true,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <JsonRpcQueryProvider config={mockConfig}>{children}</JsonRpcQueryProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call useQuery with correct parameters", () => {
    const blockParams = { finality: "final" as const };

    renderHook(() => useJsonRpcQuery(block, blockParams), { wrapper });

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["jsonrpc", "block", blockParams],
      queryFn: expect.any(Function),
    });
  });

  it("should create client with correct configuration", () => {
    const blockParams = { finality: "final" as const };

    renderHook(() => useJsonRpcQuery(block, blockParams), { wrapper });

    expect(createClientWithMethods).toHaveBeenCalledWith({
      transporter: mockTransporter,
      methods: { block },
      runtimeValidation: true,
    });
  });

  it("should return correct data structure for successful query", () => {
    const blockParams = { finality: "final" as const };

    const { result } = renderHook(() => useJsonRpcQuery(block, blockParams), {
      wrapper,
    });

    expect(result.current).toEqual({
      data: { header: { hash: "test-hash" } },
      error: null,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      isStale: false,
      refetch: expect.any(Function),
    });
  });

  it("should handle error in response data", () => {
    jest.mocked(useQuery).mockReturnValueOnce(
      createMockQueryResult({
        data: { error: { message: "RPC error", code: -32000 } },
        isSuccess: true,
        isError: false,
      })
    );

    const blockParams = { finality: "final" as const };

    const { result } = renderHook(() => useJsonRpcQuery(block, blockParams), {
      wrapper,
    });

    expect(result.current).toEqual({
      data: undefined,
      error: { message: "RPC error", code: -32000 },
      isLoading: false,
      isFetching: false,
      isSuccess: false,
      isError: true,
      isStale: false,
      refetch: expect.any(Function),
    });
  });

  it("should handle loading state", () => {
    jest.mocked(useQuery).mockReturnValueOnce(
      createMockQueryResult({
        data: undefined,
        isLoading: true,
        isFetching: true,
        isSuccess: false,
        isError: false,
        isPending: true,
        status: "pending" as const,
      })
    );

    const blockParams = { finality: "final" as const };

    const { result } = renderHook(() => useJsonRpcQuery(block, blockParams), {
      wrapper,
    });

    expect(result.current).toEqual({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: true,
      isSuccess: false,
      isError: false,
      isStale: false,
      refetch: expect.any(Function),
    });
  });

  it("should handle React Query error", () => {
    const queryError = new Error("Network error");
    jest.mocked(useQuery).mockReturnValueOnce(
      createMockQueryResult({
        data: undefined,
        error: queryError,
        isLoading: false,
        isFetching: false,
        isSuccess: false,
        isError: true,
        status: "error" as const,
      })
    );

    const blockParams = { finality: "final" as const };

    const { result } = renderHook(() => useJsonRpcQuery(block, blockParams), {
      wrapper,
    });

    expect(result.current).toEqual({
      data: undefined,
      error: queryError,
      isLoading: false,
      isFetching: false,
      isSuccess: false,
      isError: true,
      isStale: false,
      refetch: expect.any(Function),
    });
  });

  it("should accept custom query options", () => {
    const blockParams = { finality: "final" as const };
    const customOptions = {
      staleTime: 30000,
      retry: 3,
      enabled: false,
    };

    renderHook(() => useJsonRpcQuery(block, blockParams, customOptions), {
      wrapper,
    });

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["jsonrpc", "block", blockParams],
      queryFn: expect.any(Function),
      ...customOptions,
    });
  });

  it("should use custom query key when provided", () => {
    const blockParams = { finality: "final" as const };
    const customQueryKey = ["custom", "block", "key"];

    renderHook(
      () => useJsonRpcQuery(block, blockParams, { queryKey: customQueryKey }),
      { wrapper }
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: customQueryKey,
      queryFn: expect.any(Function),
    });
  });

  it("should work with different method types", () => {
    const statusParams = null;

    renderHook(() => useJsonRpcQuery(status, statusParams), { wrapper });

    expect(createClientWithMethods).toHaveBeenCalledWith({
      transporter: mockTransporter,
      methods: { status },
      runtimeValidation: true,
    });

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["jsonrpc", "status"],
      queryFn: expect.any(Function),
    });
  });
});
