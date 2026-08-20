import { defineConfig } from "vitest/config"

/**
 * Unit tests only: pure logic, no DOM and no server.
 *
 * The bugs this suite exists to catch were all silent — a price key that did
 * not match a branch id, a display name that collapsed two different tests into
 * one, a translation that dropped its {count} placeholder. None of them threw;
 * all of them would ship.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
