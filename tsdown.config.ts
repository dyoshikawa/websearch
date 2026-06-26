import { defineConfig } from "tsdown";

/**
 * Dual-format build: an ESM + CJS library entry (`src/index.ts`) plus the CLI
 * binary (`src/cli/index.ts`). tsdown emits matching `.d.ts`/`.d.cts`
 * declarations and externalizes `dependencies` automatically, so commander,
 * zod, and the MCP SDK are not bundled into the output.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/cli/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: false,
  outDir: "dist",
});
