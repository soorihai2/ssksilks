import { createProxyMiddleware } from "http-proxy-middleware";

export default function setupProxy(app) {
  // Proxy API requests to the backend
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
    })
  );

  // Proxy image requests to the backend
  app.use(
    "/images",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
    })
  );
}
