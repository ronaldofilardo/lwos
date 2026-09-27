import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

// Sem VITE_ANALYTICS_ENDPOINT, o index.html vira src="/umami" e o Vite tenta
// bundlear um path local inexistente. Removemos a tag enquanto não há endpoint.
function stripEmptyAnalyticsScript() {
  return {
    name: "strip-empty-analytics-script",
    transformIndexHtml: {
      order: "pre" as const,
      handler: (html: string) =>
        html.replace(/<script\b[^>]*src="[^"]*umami"[^>]*><\/script>/g, ""),
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const allPlugins = env.VITE_ANALYTICS_ENDPOINT
    ? plugins
    : [...plugins, stripEmptyAnalyticsScript()];

  return {
    plugins: allPlugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    publicDir: path.resolve(import.meta.dirname, "client", "public"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
              return "react";
            if (
              /[\\/]node_modules[\\/]@tanstack[\\/]/.test(id) ||
              /[\\/]node_modules[\\/]@trpc[\\/]/.test(id)
            )
              return "query";
            if (
              /[\\/]node_modules[\\/](recharts|d3-[a-z-]+|victory-vendor)[\\/]/
                .test(id)
            )
              return "charts";
            if (/[\\/]node_modules[\\/]@radix-ui[\\/]/.test(id)) return "radix";
            return "vendor";
          },
        },
      },
    },
    server: {
      host: true,
      allowedHosts: ["localhost", "127.0.0.1"],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
