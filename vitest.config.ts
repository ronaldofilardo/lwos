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
        reporter: ["text", "json-summary", "html"],
        reportsDirectory: "coverage",
        all: false,
        include: [
          "server/_core/auth.ts",
          "server/_core/storageProxy.ts",
          "server/features/access/family-access.ts",
          "server/features/people/person-repository.ts",
          "server/lib/family-storage-migration.ts",
          "server/lib/family-storage-path.ts",
          "server/storage.ts",
        ],
        exclude: [
          "**/*.test.ts",
          "server/_core/index.ts",
          "server/_core/vite.ts",
        ],
      },
    },
  })
);
