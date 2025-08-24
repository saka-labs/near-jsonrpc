import * as methods from "@saka-labs/near-jsonrpc-types/methods";
import { z } from "zod/v4";
import type {
  DefaultRequestType,
  ErrorType,
  Method,
  RequestType,
  ResponseType,
} from "@saka-labs/near-jsonrpc-types/types";

export type RuntimeValidationType = "request" | "response" | "error";

/**
 * Runtime validation configuration
 */
export interface RuntimeValidationConfig {
  /** Enable request validation */
  request: boolean;
  /** Enable response validation */
  response: boolean;
  /** Enable error validation */
  error: boolean;
}

/**
 * Runtime validation setting - can be boolean for backward compatibility or object for granular control
 */
export type RuntimeValidationSetting = boolean | RuntimeValidationConfig;

export type RuntimeValidation<T, RuntimeValidationType> = {
  runtimeValidation: RuntimeValidationType;
  error: z.core.$ZodErrorTree<T>;
};

/**
 * Common return type for all JSON-RPC client methods
 */
export type ClientMethodReturnType<TRequest, TResponse, TError> = Promise<
  {
    result?: TResponse;
    error?: {
      rpc?: TError;
      validation?:
        | RuntimeValidation<TRequest, "request">
        | RuntimeValidation<TResponse, "response">
        | RuntimeValidation<TError, "error">;
    };
  } & (
    | {
        result: TResponse;
        error?: never;
      }
    | {
        result?: never;
        error: {
          rpc: TError;
          validation?: never;
        };
      }
    | {
        result?: never;
        error: {
          rpc?: never;
          validation:
            | RuntimeValidation<TRequest, "request">
            | RuntimeValidation<TResponse, "response">
            | RuntimeValidation<TError, "error">;
        };
      }
  )
>;

export type RpcClient = {
  [K in keyof typeof methods]: (typeof methods)[K] extends Method<
    RequestType<(typeof methods)[K]>,
    ResponseType<(typeof methods)[K]>,
    ErrorType<(typeof methods)[K]>,
    DefaultRequestType<(typeof methods)[K]>
  >
    ? (
        request: RequestType<(typeof methods)[K]>,
        defaultRequestType?: DefaultRequestType<(typeof methods)[K]>
      ) => ClientMethodReturnType<
        RequestType<(typeof methods)[K]>,
        ResponseType<(typeof methods)[K]>,
        ErrorType<(typeof methods)[K]>
      >
    : never;
};

/**
 * Type for a client with selected methods
 */
export type SelectiveRpcClient<
  T extends Record<string, Method<unknown, unknown, unknown, unknown>>
> = {
  [K in keyof T]: T[K] extends Method<
    infer TRequest,
    infer TResponse,
    infer TError
  >
    ? (request: TRequest) => ClientMethodReturnType<TRequest, TResponse, TError>
    : never;
};

export type Transporter = (
  methodName: string,
  request: unknown
) => Promise<{ result: unknown; error: unknown }>;

/**
 * Configuration for creating a selective JSON-RPC client
 */
export interface CreateClientWithMethodsConfig<
  T extends Record<string, Method<unknown, unknown, unknown, unknown>>
> {
  /** The transport function to use for sending requests */
  transporter: Transporter;
  /** Object containing the specific methods to include from "@saka-labs/near-jsonrpc-types/methods" */
  methods: T;
  /** Runtime validation configuration (optional, defaults to false for all) */
  runtimeValidation?: RuntimeValidationSetting;
}

/**
 * Configuration for creating a full JSON-RPC client
 */
export interface CreateClientConfig {
  /** The transport function to use for sending requests */
  transporter: Transporter;
  /** Runtime validation configuration (optional, defaults to false for all) */
  runtimeValidation?: RuntimeValidationSetting;
}
