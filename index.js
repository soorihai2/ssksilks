import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors());

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, "dist")));

// Proxy API requests to the backend
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/api",
    },
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

// For any other GET request, send back the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`Integrated server is running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(
    `API Proxy: http://localhost:${PORT}/api -> http://localhost:3001/api`
  );
  console.log(
    `Images Proxy: http://localhost:${PORT}/images -> http://localhost:3001/images`
  );
});
