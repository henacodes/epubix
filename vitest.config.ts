import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use globals like `describe`, `it`, `expect` without imports
    globals: true,
    // Use 'jsdom' for DOM tests (React/Vue). Use 'node' for pure Node tests.
    environment: "jsdom",
    // Automatically run this file before tests (useful for setup & matchers)
    setupFiles: ["./src/setupTests.ts"],
    // Files to include as tests
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // Coverage config
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      all: true,
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: ["src/**/*.d.ts", "node_modules/**"],
    },
    watch: false,
  },
});
