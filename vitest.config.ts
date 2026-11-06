import { defineConfig } from 'vitest/config';
export default defineConfig({
  // PGlite suites own a PostgreSQL WASM instance each; serialize to bound memory.
  test: { include: ['tests/**/*.test.{ts,mjs}'], testTimeout: 30000, hookTimeout: 120000, maxWorkers: 1 },
});
