import type { Method, RequestType } from "@saka-labs/near-jsonrpc-types/types";
import type { JsonRpcQueryKeys, MethodName } from "./types";

export const jsonRpcQueryKeys: JsonRpcQueryKeys = {
  all: ["jsonrpc"] as const,
  method: <T extends Method<unknown, unknown, unknown, unknown>>(
    methodName: MethodName<T>,
    params?: RequestType<T>
  ) => {
    if (params === undefined || params === null) {
      return ["jsonrpc", methodName] as const;
    }
    return ["jsonrpc", methodName, params] as const;
  },
};

export function createMethodQueryKey<
  T extends Method<unknown, unknown, unknown, unknown>
>(methodName: MethodName<T>, params?: RequestType<T>) {
  return jsonRpcQueryKeys.method(methodName, params);
}

export function getMethodQueryKeys<
  T extends Method<unknown, unknown, unknown, unknown>
>(methodName: MethodName<T>) {
  return ["jsonrpc", methodName] as const;
}
