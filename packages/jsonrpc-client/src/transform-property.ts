/**
 * credits: https://github.com/craftgear/snake-camel/blob/master/src/index.ts
 */

import { mappedSnakeCamelProperty } from "@saka-labs/jsonrpc-types/mapped-properties";

const mappedCamelSnakeProperty = new Map<string, string>();
for (const [key, value] of mappedSnakeCamelProperty) {
  mappedCamelSnakeProperty.set(value, key);
}

type AnyObject = {
  [key: string]: any;
};

const detectObject = (obj: unknown) => {
  if (Object.prototype.toString.call(obj) === "[object Object]") {
    return true;
  }
  return false;
};

const transformPropertyName =
  (converterFn: (s: string) => string) =>
  (data: AnyObject): object => {
    const recursive = (obj: AnyObject): AnyObject => {
      if (!detectObject(data)) {
        return data;
      }
      const keys = Object.keys(obj);
      return keys.reduce((accum: object, propName: string) => {
        const propValue = obj[propName];
        return {
          ...accum,
          [converterFn(propName)]: Array.isArray(propValue)
            ? propValue.map((x) => (detectObject(x) ? recursive(x) : x))
            : detectObject(propValue)
            ? recursive(propValue)
            : propValue,
        };
      }, {});
    };
    return recursive(data);
  };

export const transformSnakeToCamel = transformPropertyName((s: string) =>
  mappedSnakeCamelProperty.has(s) ? mappedSnakeCamelProperty.get(s)! : s
);

export const transformCamelToSnake = transformPropertyName((s: string) =>
  mappedCamelSnakeProperty.has(s) ? mappedCamelSnakeProperty.get(s)! : s
);
