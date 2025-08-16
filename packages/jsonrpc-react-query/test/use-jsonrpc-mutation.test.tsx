import React from "react";
import { renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createClientWithMethods,
  jsonRpcTransporter,
  NearRpcEndpoint,
} from "@saka-labs/jsonrpc-client";
import { broadcastTxCommit } from "@saka-labs/jsonrpc-types/methods";
import { useJsonRpcMutation } from "../src/use-jsonrpc-mutation";
import { JsonRpcQueryProvider } from "../src/context";
import type { JsonRpcQueryConfig } from "../src/types";

const mockMutate = jest.fn();
const mockMutateAsync = jest.fn();
const mockReset = jest.fn();

const createMockMutationResult = (overrides = {}) =>
  ({
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
    isPending: false,
    isSuccess: true,
    isError: false,
    data: { result: { transaction: { hash: "tx-hash" } } },
    error: null,
    reset: mockReset,
    variables: undefined,
    isIdle: false,
    status: "success" as const,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    isPaused: false,
    ...overrides,
  } as ReturnType<typeof useMutation>);

jest.mocked(useMutation).mockImplementation(() => createMockMutationResult());

const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
  removeQueries: jest.fn(),
} as unknown as ReturnType<typeof useQueryClient>;

jest.mocked(useQueryClient).mockReturnValue(mockQueryClient);

jest.mocked(createClientWithMethods).mockImplementation(
  () =>
    ({
      broadcast_tx_commit: jest.fn().mockResolvedValue({
        result: { transaction: { hash: "tx-hash" } },
      }),
    } as any)
);

describe("useJsonRpcMutation", () => {
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

  it("should call useMutation with correct parameters", () => {
    renderHook(() => useJsonRpcMutation(broadcastTxCommit), { wrapper });

    expect(useMutation).toHaveBeenCalledWith({
      mutationKey: ["jsonrpc", "mutation", "broadcast_tx_commit"],
      mutationFn: expect.any(Function),
    });
  });

  it("should create client with correct configuration", () => {
    renderHook(() => useJsonRpcMutation(broadcastTxCommit), { wrapper });

    expect(createClientWithMethods).toHaveBeenCalledWith({
      transporter: mockTransporter,
      methods: { broadcast_tx_commit: broadcastTxCommit },
      runtimeValidation: true,
    });
  });

  it("should return correct data structure for successful mutation", () => {
    const { result } = renderHook(() => useJsonRpcMutation(broadcastTxCommit), {
      wrapper,
    });

    expect(result.current).toEqual({
      mutate: mockMutate,
      mutateAsync: expect.any(Function),
      isPending: false,
      isSuccess: true,
      isError: false,
      data: { transaction: { hash: "tx-hash" } },
      error: null,
      reset: mockReset,
    });
  });

  it("should handle pending state", () => {
    jest.mocked(useMutation).mockReturnValueOnce(
      createMockMutationResult({
        isPending: true,
        isSuccess: false,
        isIdle: false,
        status: "pending" as const,
        data: undefined,
      })
    );

    const { result } = renderHook(() => useJsonRpcMutation(broadcastTxCommit), {
      wrapper,
    });

    expect(result.current).toEqual({
      mutate: mockMutate,
      mutateAsync: expect.any(Function),
      isPending: true,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
      reset: mockReset,
    });
  });

  it("should handle error in response data", () => {
    jest.mocked(useMutation).mockReturnValueOnce(
      createMockMutationResult({
        data: { error: { message: "Transaction failed", code: -32000 } },
        isSuccess: true,
        isError: false,
      })
    );

    const { result } = renderHook(() => useJsonRpcMutation(broadcastTxCommit), {
      wrapper,
    });

    expect(result.current).toEqual({
      mutate: mockMutate,
      mutateAsync: expect.any(Function),
      isPending: false,
      isSuccess: false,
      isError: true,
      data: undefined,
      error: { message: "Transaction failed", code: -32000 },
      reset: mockReset,
    });
  });

  it("should handle React Query error", () => {
    const mutationError = new Error("Network error");
    jest.mocked(useMutation).mockReturnValueOnce(
      createMockMutationResult({
        isSuccess: false,
        isError: true,
        data: undefined,
        error: mutationError,
        status: "error" as const,
      })
    );

    const { result } = renderHook(() => useJsonRpcMutation(broadcastTxCommit), {
      wrapper,
    });

    expect(result.current).toEqual({
      mutate: mockMutate,
      mutateAsync: expect.any(Function),
      isPending: false,
      isSuccess: false,
      isError: true,
      data: undefined,
      error: mutationError,
      reset: mockReset,
    });
  });

  it("should accept custom mutation options", () => {
    const customOptions = {
      onSuccess: jest.fn(),
      onError: jest.fn(),
      retry: 2,
    };

    renderHook(() => useJsonRpcMutation(broadcastTxCommit, customOptions), {
      wrapper,
    });

    expect(useMutation).toHaveBeenCalledWith({
      mutationKey: ["jsonrpc", "mutation", "broadcast_tx_commit"],
      mutationFn: expect.any(Function),
      ...customOptions,
    });
  });

  it("should use custom mutation key when provided", () => {
    const customMutationKey = ["custom", "tx", "key"];

    renderHook(
      () =>
        useJsonRpcMutation(broadcastTxCommit, {
          mutationKey: customMutationKey,
        }),
      { wrapper }
    );

    expect(useMutation).toHaveBeenCalledWith({
      mutationKey: customMutationKey,
      mutationFn: expect.any(Function),
    });
  });

  describe("mutateAsync wrapper", () => {
    it("should throw error when response contains error", async () => {
      const mockMutateAsyncOriginal = jest.fn().mockResolvedValue({
        error: { message: "RPC error", code: -32000 },
      });

      jest.mocked(useMutation).mockReturnValueOnce(
        createMockMutationResult({
          mutateAsync: mockMutateAsyncOriginal,
          isSuccess: false,
          isError: false,
          data: undefined,
          status: "idle" as const,
          isIdle: true,
        })
      );

      const { result } = renderHook(
        () => useJsonRpcMutation(broadcastTxCommit),
        { wrapper }
      );

      const txParams = {
        signedTxBase64: "signed-tx",
        waitUntil: "INCLUDED" as const,
      };
      await expect(result.current.mutateAsync(txParams)).rejects.toEqual({
        message: "RPC error",
        code: -32000,
      });
    });

    it("should return result data when successful", async () => {
      const mockMutateAsyncOriginal = jest.fn().mockResolvedValue({
        result: { transaction: { hash: "success-hash" } },
      });

      jest.mocked(useMutation).mockReturnValueOnce(
        createMockMutationResult({
          mutateAsync: mockMutateAsyncOriginal,
        })
      );

      const { result } = renderHook(
        () => useJsonRpcMutation(broadcastTxCommit),
        { wrapper }
      );

      const txParams = {
        signedTxBase64: "signed-tx",
        waitUntil: "INCLUDED" as const,
      };
      const resultData = await result.current.mutateAsync(txParams);
      expect(resultData).toEqual({ transaction: { hash: "success-hash" } });
    });
  });
});
