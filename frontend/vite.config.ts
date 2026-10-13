import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * The FastAPI backend has no CORS middleware, so the browser cannot call it
 * cross-origin. In development and preview the app therefore talks to a
 * same-origin `/api` prefix that Vite proxies to the backend. Point
 * VITE_API_PROXY_TARGET at a different host if the backend moves, or set
 * VITE_API_BASE_URL to an absolute URL to bypass the proxy entirely.
 */
const backendTarget = process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8001";

const proxy = {
  "/api": {
    target: backendTarget,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy,
  },
  preview: {
    port: 4173,
    proxy,
  },
});
