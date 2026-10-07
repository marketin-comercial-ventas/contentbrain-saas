import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    name: "security",
    environment: "node",
    include: ["tests/security/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
    reporters: ["default"],
  },
});
