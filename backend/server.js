const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const { categoryStore, productStore } = require("./data/store");
const multer = require("multer");
const fs = require("fs");
const config = require("./config");
const uploadRoutes = require("./routes/upload");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const emailRoutes = require("./routes/email");
const { readData } = require("./utils/fileUtils");
const settingsRoutes = require("./routes/settings");
const categoryRoutes = require("./routes/categories");
const notificationRoutes = require("./routes/notifications");
const customerRoutes = require("./routes/customers");
const posCustomerRoutes = require("./routes/posCustomerRoutes");

// Load environment variables FIRST
dotenv.config();

// Helper function to get Razorpay instance with settings from admin panel
async function getRazorpayInstance() {
  try {
    const settings = await readData("settings.json");
    if (
      !settings.payment?.razorpayKeyId ||
      !settings.payment?.razorpayKeySecret
    ) {
      throw new Error("Razorpay credentials not configured in admin settings");
    }
    return new Razorpay({
      key_id: settings.payment.razorpayKeyId,
      key_secret: settings.payment.razorpayKeySecret,
    });
  } catch (error) {
    console.warn("Error initializing Razorpay:", error.message);
    return null;
  }
}

// Initialize Razorpay (will be initialized on first use)
let razorpayPromise = getRazorpayInstance();

// Define paths relative to backend directory
const BACKEND_ROOT = __dirname;
const IMAGES_PATH = path.join(__dirname, "../images");
const DATA_PATH = path.join(BACKEND_ROOT, "data");

const app = express();
// Force port 3001 in production or use environment variable
const PORT =
  process.env.NODE_ENV === "production" ? 3001 : process.env.PORT || 3001;

// Increase request size limits for video uploads
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Increase timeout for large uploads
app.use((req, res, next) => {
  // Set timeout to 10 minutes for uploads
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

// Add specific timeout handling for upload routes
app.use("/api/products/upload", (req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);
  next();
});

app.use("/api/products/:id/images", (req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);
  next();
});

// Disable rate limiting - add this before other middleware
app.use((req, res, next) => {
  // Remove rate limit headers
  res.removeHeader("Retry-After");
  res.removeHeader("X-RateLimit-Limit");
  res.removeHeader("X-RateLimit-Remaining");
  res.removeHeader("X-RateLimit-Reset");
  next();
});

// CORS configuration with more permissive settings
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Add middleware to handle API requests
app.use((req, res, next) => {
  // Check if the request is for the API
  if (req.path.startsWith("/api")) {
    console.log(`API Request to ${req.method} ${req.url}`);
    next();
  } else {
    // For non-API requests, serve the frontend
    next();
  }
});

// Configure multer for product image upload
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;
    if (file.mimetype.startsWith("video/")) {
      uploadDir = path.join(__dirname, "..", "videos", "products");
    } else {
      uploadDir = path.join(IMAGES_PATH, "products");
    }
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Use original extension for videos, .jpg for images
    if (file.mimetype.startsWith("video/")) {
      const ext = path.extname(file.originalname) || ".mp4";
      cb(null, uniqueSuffix + ext);
    } else {
      cb(null, uniqueSuffix + ".jpg");
    }
  },
});

// Configure multer for category image upload
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(IMAGES_PATH, "categories");
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a more reliable filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname) || ".jpg";
    cb(null, uniqueSuffix + fileExt);
  },
});

// Configure multer for offer image upload
const offerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(IMAGES_PATH, "offers");
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a more reliable filename with .jpg extension for consistency
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Always use .jpg extension for offer images
    cb(null, uniqueSuffix + ".jpg");
  },
});

const upload = multer({
  storage: productStorage,
  fileFilter: (req, file, cb) => {
    // Allow both images and videos
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type! Please upload only images or videos."),
        false
      );
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // Increase to 100MB limit for videos
    files: 4, // Maximum 4 files
  },
}).array("images", 4);

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one image per category
  },
}).single("image"); // Specify field name

const offerUpload = multer({
  storage: offerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one image per offer
  },
}).single("image"); // Specify field name

// Improve static file serving with better logging and options
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "images"), {
    maxAge: "1y",
  })
);

// Add backward compatibility for /images path
app.use(
  "/images",
  (req, res, next) => {
    console.log("Requested legacy image:", req.url);
    res.header("Cache-Control", "public, max-age=86400");
    next();
  },
  express.static(path.join(__dirname, "../images"), {
    fallthrough: true,
    index: false,
    redirect: false,
  })
);

// Create videos directory if it doesn't exist
const videosDir = path.join(__dirname, "..", "videos", "products");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Check if directory is writable
try {
  fs.accessSync(videosDir, fs.constants.W_OK);
  console.log(`Videos directory ${videosDir} is writable`);
} catch (error) {
  console.error(`Directory ${videosDir} is not writable:`, error);
}

// Serve video files with proper headers
app.use(
  "/videos",
  (req, res, next) => {
    // Log video requests
    console.log("Video request:", req.url);
    // Set proper headers for video streaming
    res.header("Accept-Ranges", "bytes");
    res.header("Content-Type", "video/mp4");
    next();
  },
  express.static(path.join(__dirname, "..", "videos"), {
    maxAge: "1y",
    setHeaders: (res, path) => {
      if (path.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (path.endsWith(".webm")) {
        res.setHeader("Content-Type", "video/webm");
      }
    },
  })
);

// Also serve media directly from root to handle inconsistent paths
app.use(
  "/",
  (req, res, next) => {
    // Only handle requests that appear to be for media
    if (req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|mp4|webm)$/i)) {
      console.log("Requested media via root path:", req.path);
      // Set proper headers for video files
      if (req.path.match(/\.(mp4|webm)$/i)) {
        res.header("Accept-Ranges", "bytes");
        if (req.path.endsWith(".mp4")) {
          res.header("Content-Type", "video/mp4");
        } else if (req.path.endsWith(".webm")) {
          res.header("Content-Type", "video/webm");
        }
      }
    }
    next();
  },
  express.static(path.join(__dirname, ".."), {
    fallthrough: true,
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      if (path.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (path.endsWith(".webm")) {
        res.setHeader("Content-Type", "video/webm");
      }
    },
  })
);

// Add a catch-all route for media to help debug
app.get(["/images/*", "/videos/*"], (req, res) => {
  console.log("Media not found:", req.url);
  res.status(404).send({
    error: "Media not found",
    path: req.url,
    expectedLocation: path.join(
      __dirname,
      "..",
      req.url.startsWith("/videos") ? "videos" : "images"
    ),
  });
});

// Handle duplicate image paths
app.get("/images/images/:resource*", (req, res) => {
  const originalPath = path.join(
    __dirname,
    "..",
    "images",
    req.params.resource,
    req.params[0] || ""
  );
  res.sendFile(originalPath);
});

// Routes - keep them at the root level
// Improve logging for debugging
app.use(
  "/api/pos-customers",
  (req, res, next) => {
    console.log(`API request to pos-customers: ${req.method} ${req.path}`);
    next();
  },
  posCustomerRoutes
);

app.use(
  "/api/upload",
  (req, res, next) => {
    console.log(`API request to upload: ${req.method} ${req.path}`);
    next();
  },
  uploadRoutes
);

app.use(
  "/api/products",
  (req, res, next) => {
    console.log(`API request to products: ${req.method} ${req.path}`);
    next();
  },
  productRoutes
);

app.use(
  "/api/orders",
  (req, res, next) => {
    console.log(`API request to orders: ${req.method} ${req.path}`);
    next();
  },
  orderRoutes
);

app.use(
  "/api/email",
  (req, res, next) => {
    console.log(`API request to email: ${req.method} ${req.path}`);
    next();
  },
  emailRoutes
);

app.use(
  "/api/settings",
  (req, res, next) => {
    console.log(`API request to settings: ${req.method} ${req.path}`);
    next();
  },
  settingsRoutes
);

app.use(
  "/api/categories",
  (req, res, next) => {
    console.log(`API request to categories: ${req.method} ${req.path}`);
    next();
  },
  categoryRoutes
);

app.use(
  "/api/notifications",
  (req, res, next) => {
    console.log(`API request to notifications: ${req.method} ${req.path}`);
    next();
  },
  notificationRoutes
);

app.use(
  "/api/customers",
  (req, res, next) => {
    console.log(`API request to customers: ${req.method} ${req.path}`);
    next();
  },
  customerRoutes
);

// Handle any double /api/api paths that might be requested by frontend
app.use("/api/api/:resource*", (req, res) => {
  const resource = req.params.resource;
  const rest = req.params[0] || "";
  const correctedPath = `/api/${resource}${rest}`;
  console.log(
    `Redirecting double API path /api/api/${resource}${rest} to ${correctedPath}`
  );
  res.redirect(correctedPath);
});

// Razorpay routes
app.post("/api/create-order", async (req, res) => {
  try {
    const razorpay = await razorpayPromise;
    if (!razorpay) {
      return res
        .status(503)
        .json({ error: "Payment service is not available" });
    }

    const { amount, currency = "INR" } = req.body;
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: "Payment service is not available" });
  }
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Add error handling specifically for file uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large",
        message: "File size exceeds the limit (100MB)",
        details: err.message,
      });
    }
    return res.status(400).json({
      error: "Upload error",
      message: err.message,
      details: err.code,
    });
  }
  next(err);
});

// Add extension fallback middleware - if an image isn't found, try different extensions
app.use((req, res, next) => {
  // Only process for image requests that return 404
  if (req._handled || !req.path.match(/\.(jpe?g|png|gif|svg|webp|ico)$/i)) {
    return next();
  }

  // Get original extension
  const originalExt = path.extname(req.path);
  const basePath = req.path.slice(0, -originalExt.length);

  // If original extension is .jpg, try .jpeg, and vice versa
  let extensionToTry;
  if (originalExt.toLowerCase() === ".jpg") {
    extensionToTry = ".jpeg";
  } else if (originalExt.toLowerCase() === ".jpeg") {
    extensionToTry = ".jpg";
  } else {
    // For other extensions, don't try alternatives
    return next();
  }

  // Mark the request as handled to prevent infinite loop
  req._handled = true;

  // Try the alternative extension by rewriting the URL
  console.log(
    `Image ${req.path} not found, trying with extension ${extensionToTry}`
  );
  req.url = basePath + extensionToTry;

  // Continue down the middleware chain with the new URL
  next();
});

// Add error handling for timeouts
app.use((err, req, res, next) => {
  if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
    console.error("Request timeout:", err);
    return res.status(504).json({
      error: "Gateway Timeout",
      message:
        "The request took too long to complete. Please try again with a smaller file or check your connection.",
      details: err.message,
    });
  }
  next(err);
});

// 404 handler - This should be the last route
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler - This should be the last middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Create necessary directories if they don't exist
const categoriesDir = path.join(IMAGES_PATH, "categories");
const productsDir = path.join(IMAGES_PATH, "products");
const offersDir = path.join(IMAGES_PATH, "offers");

[categoriesDir, productsDir, offersDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // Check if directory is writable
  try {
    fs.accessSync(dir, fs.constants.W_OK);
  } catch (error) {
    console.error(`Directory ${dir} is not writable:`, error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running in ${config.nodeEnv} mode on port ${PORT}`);
});
