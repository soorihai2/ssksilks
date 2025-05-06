import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
  var env = loadEnv(mode, process.cwd(), "");
    return {
        plugins: [react()],
        resolve: {
            alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@contexts": path.resolve(__dirname, "./src/contexts"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@types": path.resolve(__dirname, "./src/types"),
            },
        },
        build: {
      outDir: "dist",
      assetsDir: "assets",
            sourcemap: false,
      minify: "terser",
            rollupOptions: {
                output: {
                    manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            mui: ["@mui/material", "@mui/icons-material"],
                    },
                },
            },
        },
    preview: {
      port: 4173,
            proxy: {
        "/api": {
          target: "http://localhost:3001",
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    server: {
      port: 3000,
      proxy: env.VITE_API_URL
        ? {
            "/api": {
              target: env.VITE_API_URL,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    };
});
