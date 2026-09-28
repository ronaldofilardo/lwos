import { mergeConfig, defineConfig } from "vitest/config";
import viteConfigExport from "./vite.config";

// vite.config.ts exporta uma função (precisa do mode para ler .env);
// resolvemos para objeto antes de mesclar.
const viteConfig =
  typeof viteConfigExport === "function"
    ? viteConfigExport({ mode: "test", command: "serve" })
    : viteConfigExport;

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: import.meta.dirname,
    test: {
      environment: "node",
      include: [
        "server/**/*.test.ts",
        "shared/**/*.test.ts",
        "client/**/*.test.ts",
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "json-summary", "html", "lcov"],
        reportsDirectory: "coverage",
        all: true,
        include: ["server/**/*.ts", "shared/**/*.ts"],
        exclude: [
          "**/*.test.ts",
          "**/*.d.ts",
          "server/_core/index.ts",
          "server/_core/vite.ts",
          "server/api.ts",
        ],
        thresholds: {
          lines: 81,
          statements: 81,
          branches: 92,
          functions: 80,
        },
      },
    },
  })
);
