const fs = require("fs");
const path = require("path");

// Function to get settings
function getSettings() {
  try {
    const settingsPath = path.join(__dirname, "../data/settings.json");
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch (error) {
    console.error("Error reading settings:", error);
    return {};
  }
}

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Frontend URLs
  frontendUrl:
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://ssksilks.in"
      : "http://localhost:3000"),

  // Razorpay Configuration
  razorpay: {
    get keyId() {
      const settings = getSettings();
      return settings?.payment?.razorpayKeyId;
    },
    get keySecret() {
      const settings = getSettings();
      return settings?.payment?.razorpayKeySecret;
    },
    get webhookSecret() {
      return process.env.RAZORPAY_WEBHOOK_SECRET;
    },
  },

  // CORS Configuration
  cors: {
    origins: function () {
      const allowedOrigins = [
        "http://localhost:3000", // Development frontend
        "http://localhost:4173", // Vite preview
        "http://localhost:4174", // Vite preview alternate
        "http://localhost:5173", // Vite dev
        "http://localhost:5174", // Vite dev alternate
        "https://ssksilks.in", // Production frontend
      ];

      // Add custom frontend URL if provided and not already in the list
      const customFrontendUrl = process.env.FRONTEND_URL;
      if (customFrontendUrl && !allowedOrigins.includes(customFrontendUrl)) {
        allowedOrigins.push(customFrontendUrl);
      }

      return allowedOrigins;
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-rtb-fingerprint-id"],
    exposedHeaders: ["x-rtb-fingerprint-id"],
    credentials: true,
  },
};

module.exports = config;
