import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const repo = fileURLToPath(new URL("../", import.meta.url));
const reviewData = new Map([
  ["/data/catalog.json", "data/catalog.json"],
  ["/data/price-history.json", "data/price-history.json"],
]);

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "review-catalog-local-read-only",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const name = reviewData.get(
            new URL(request.url || "/", "http://localhost").pathname,
          );
          if (!name) return next();
          try {
            const body = await readFile(new URL(name, "file://" + repo));
            response.setHeader(
              "Content-Type",
              "application/json; charset=utf-8",
            );
            response.setHeader("Cache-Control", "no-store");
            response.end(body);
          } catch {
            response.statusCode = 503;
            response.end("{}");
          }
        });
      },
    },
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { fs: { allow: [repo] } },
  test: {
    maxWorkers: 2,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
