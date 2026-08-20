import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

/**
 * Unit tests only: pure logic, no DOM and no server.
 *
 * The bugs this suite exists to catch were all silent — a price key that did
 * not match a branch id, a display name that collapsed two different tests into
 * one, a validator that rejected a valid FIN. None of them threw; all of them
 * shipped and were found by eye.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
