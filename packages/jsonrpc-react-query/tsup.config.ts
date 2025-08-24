import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  minify: true,
  clean: true,
  outDir: "dist",
  external: [
    "@saka-labs/near-jsonrpc-client",
    "@saka-labs/near-jsonrpc-types",
    "@tanstack/react-query",
    "react",
  ],
});
