import * as methods from "@saka-labs/near-jsonrpc-types/methods";
import { z } from "zod/v4";
import type {
  RpcClient,
  RuntimeValidation,
  SelectiveRpcClient,
  CreateClientWithMethodsConfig,
  CreateClientConfig,
  RuntimeValidationConfig,
  RuntimeValidationSetting,
} from "./types";
import { RuntimeValidationType } from "./types";
import {
  transformCamelToSnake,
  transformSnakeToCamel,
} from "./transform-property";
import {
  ErrorType,
  RequestType,
  ResponseType,
  Method,
} from "@saka-labs/near-jsonrpc-types/types";
import { JSON_RPC_TRANSPORTER_ERROR_CODE } from "./transporter";

/**
 * Normalize runtime validation setting to a config object
 */
function normalizeRuntimeValidation(
  runtimeValidation?: RuntimeValidationSetting
): RuntimeValidationConfig {
  if (typeof runtimeValidation === "boolean") {
    return {
      request: runtimeValidation,
      response: runtimeValidation,
      error: runtimeValidation,
    };
  }

  if (runtimeValidation) {
    return runtimeValidation;
  }

  return {
    request: false,
    response: false,
    error: false,
  };
}

function preProces(request: any) {
  return transformCamelToSnake(request);
}

function postProcess(response: any) {
  return transformSnakeToCamel(response);
}

function parseZod<T>(
  type: RuntimeValidationType,
  schema: z.ZodType<T>,
  data: T
):
  | {
      error: {
        validation: RuntimeValidation<T, RuntimeValidationType>;
      };
    }
  | undefined {
  const validate = schema.safeParse(data);
  if (validate.error) {
    const error = z.treeifyError(validate.error);

    return {
      error: {
        validation: {
          runtimeValidation: type,
          error,
        },
      },
    };
  }
}

/**
 * Create a JSON-RPC client with only specific methods
 * @param config - Configuration object
 *
 * @example
 * ```typescript
 * import { createClientWithMethods, jsonRpcTransporter, NearRpcEndpoint } from "@saka-labs/near-jsonrpc-client";
 * import { block, status, query, tx } from "@saka-labs/near-jsonrpc-types/methods";
 *
 * const transporter = jsonRpcTransporter({ endpoint: NearRpcEndpoint.Mainnet });
 * const client = createClientWithMethods({
 *   transporter,
 *   methods: { block, status, query, tx },
 *   runtimeValidation: { request: true, response: true, error: false }
 * });
 *
 * // Only these methods are available:
 * const blockData = await client.block({ finality: "final" });
 * const statusData = await client.status(null);
 * ```
 */
export function createClientWithMethods<
  T extends Record<string, Method<unknown, unknown, unknown, unknown>>
>(config: CreateClientWithMethodsConfig<T>): SelectiveRpcClient<T> {
  const { transporter, methods: selectedMethods, runtimeValidation } = config;
  const validationConfig = normalizeRuntimeValidation(runtimeValidation);

  return Object.entries(selectedMethods).reduce((acc, [key, method]) => {
    acc[key] = async (request: RequestType<typeof method>) => {
      if (method.defaultRequest) {
        request = {
          ...method.defaultRequest,
          ...(request as object),
        };
      }

      if (validationConfig.request) {
        const requestValidation = parseZod<RequestType<typeof method>>(
          "request",
          method.zodRequest,
          request
        );

        if (requestValidation) {
          return requestValidation;
        }
      }

      const response = await transporter(method.methodName, preProces(request));
      const result = postProcess(response) as { result: unknown; error: any };

      if (validationConfig.response && result.result) {
        const resultValidation = parseZod<ResponseType<typeof method>>(
          "response",
          method.zodResponse,
          result.result
        );
        if (resultValidation) {
          return resultValidation;
        }
      }

      if (
        validationConfig.error &&
        result.error &&
        result.error.code !== JSON_RPC_TRANSPORTER_ERROR_CODE
      ) {
        const errorValidation = parseZod<ErrorType<typeof method>>(
          "error",
          method.zodError,
          result.error
        );
        if (errorValidation) {
          return errorValidation;
        }
      }

      // handling error from the json rpc transporter
      if (result.error) {
        return {
          error: {
            rpc: result.error,
          },
        };
      }

      return result;
    };
    return acc;
  }, {} as any);
}

/**
 * Create a JSON-RPC client with all available methods
 * @param config - Configuration object
 *
 * @example
 * ```typescript
 * import { createClient, jsonRpcTransporter, NearRpcEndpoint } from "@saka-labs/near-jsonrpc-client";
 *
 * const transporter = jsonRpcTransporter({ endpoint: NearRpcEndpoint.Mainnet });
 * const client = createClient({
 *   transporter,
 *   runtimeValidation: { request: true, response: true, error: true }
 * });
 *
 * // All methods are available:
 * const blockData = await client.block({ finality: "final" });
 * const statusData = await client.status(null);
 * const queryData = await client.query({ requestType: "view_account", finality: "final", accountId: "near" });
 * ```
 */
export function createClient(config: CreateClientConfig): RpcClient {
  return createClientWithMethods({
    transporter: config.transporter,
    methods,
    runtimeValidation: config.runtimeValidation,
  }) as RpcClient;
}
