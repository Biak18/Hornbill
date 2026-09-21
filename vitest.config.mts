// Vitest config (AGENTS.md §35: test important dictionary behavior).
// Node environment + `@` alias only. Native modules (expo-sqlite,
// expo-speech, expo-network) are untestable here by design — suites cover
// pure layers: normalization, ranking/pagination, row mapping, and the
// import validator CLI. UI/stores stay manual until a device runner exists.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
  },
});
