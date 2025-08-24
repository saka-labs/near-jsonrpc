import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@saka-labs/near-jsonrpc-react-query": path.resolve(
        "../../packages/jsonrpc-react-query/src"
      ),
      "@saka-labs/near-jsonrpc-client": path.resolve(
        "../../packages/jsonrpc-client/src"
      ),
      "@saka-labs/near-jsonrpc-types": path.resolve(
        "../../packages/jsonrpc-types/src"
      ),
    },
  },
});
