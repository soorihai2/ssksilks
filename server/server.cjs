const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const orderRoutes = require("./routes/orders");

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-rtb-fingerprint-id"],
  exposedHeaders: ["x-rtb-fingerprint-id"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Request body:", req.body);
  next();
});

// Routes
app.use("/api/orders", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Environment variables loaded:", {
    PORT,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "Set" : "Not set",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "Set" : "Not set",
  });
});
