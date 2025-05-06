const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// Read store.json
const storePath = path.join(__dirname, "../data/store.json");
let products = [];

try {
  const storeData = JSON.parse(fs.readFileSync(storePath, "utf8"));
  products = storeData.products;
  console.log("Loaded products from store.json:", products.length);
} catch (error) {
  console.error("Error reading store.json:", error);
}

// Helper function to clean image paths
const cleanImagePath = (imagePath) => {
  if (!imagePath) return "";
  // Remove any leading /images/ or /images/products/
  return imagePath.replace(/^\/images\/products?\//, "");
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine if the file is a video or image
    const isVideo = file.mimetype.startsWith("video/");
    const uploadDir = path.join(
      __dirname,
      "../../",
      isVideo ? "videos/products" : "images/products"
    );

    // Create directory if it doesn't exist
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      // Check if directory is writable
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log(`Directory ${uploadDir} is writable`);
    } catch (error) {
      console.error(`Error with upload directory ${uploadDir}:`, error);
      return cb(new Error(`Upload directory error: ${error.message}`));
    }

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

// File filter to accept both images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, JPG, GIF, WebP, MP4 and WebM are allowed."
      ),
      false
    );
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 4, // Maximum 4 files
  },
});

// Get all products
router.get("/", (req, res) => {
  // Clean image paths before sending
  const cleanedProducts = products.map((product) => ({
    ...product,
    images: product.images?.map(cleanImagePath) || [],
    mainImage: cleanImagePath(product.mainImage),
  }));
  res.json(cleanedProducts);
});

// Get a single product by ID
router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Clean image paths before sending
  const cleanedProduct = {
    ...product,
    images: product.images?.map(cleanImagePath) || [],
    mainImage: cleanImagePath(product.mainImage),
  };
  res.json(cleanedProduct);
});

// Create a new product
router.post("/", (req, res) => {
  const newProduct = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    // Clean image paths before saving
    images: req.body.images?.map(cleanImagePath) || [],
    mainImage: cleanImagePath(req.body.mainImage),
  };
  products.push(newProduct);

  // Update store.json
  try {
    const storeData = JSON.parse(fs.readFileSync(storePath, "utf8"));
    storeData.products = products;
    fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2));
    console.log("Updated store.json with new product");
  } catch (error) {
    console.error("Error updating store.json:", error);
  }

  res.status(201).json(newProduct);
});

// Update a product
router.put("/:id", (req, res) => {
  try {
    console.log("Updating product with ID:", req.params.id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      console.log("Product not found with ID:", req.params.id);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("Found product at index:", index);
    console.log(
      "Current product data:",
      JSON.stringify(products[index], null, 2)
    );

    // Safely parse numeric values
    let parsedPrice, parsedStock, parsedRating;
    try {
      parsedPrice = req.body.price
        ? parseFloat(req.body.price)
        : products[index].price;
      parsedStock = req.body.stock
        ? parseInt(req.body.stock)
        : products[index].stock;
      parsedRating = req.body.rating
        ? parseFloat(req.body.rating)
        : products[index].rating || 0;
    } catch (parseError) {
      console.error("Error parsing numeric values:", parseError);
      return res.status(400).json({ error: "Invalid numeric values provided" });
    }

    // Clean and validate arrays
    const cleanedImages = (req.body.images || [])
      .map(cleanImagePath)
      .filter(Boolean);
    const cleanedVideos = (req.body.videos || []).filter(Boolean);

    // Construct the updated product with type checking
    const updatedProduct = {
      ...products[index],
      name: req.body.name || products[index].name,
      sku: req.body.sku || products[index].sku,
      description: req.body.description || products[index].description || "",
      price: parsedPrice,
      stock: parsedStock,
      rating: parsedRating,
      categoryId: req.body.categoryId || products[index].categoryId,
      images:
        cleanedImages.length > 0 ? cleanedImages : products[index].images || [],
      videos:
        cleanedVideos.length > 0 ? cleanedVideos : products[index].videos || [],
      trending:
        req.body.trending !== undefined
          ? req.body.trending
          : products[index].trending,
      featured:
        req.body.featured !== undefined
          ? req.body.featured
          : products[index].featured,
      specifications: {
        ...(products[index].specifications || {}),
        ...(req.body.specifications || {}),
      },
      reviews: Array.isArray(req.body.reviews)
        ? req.body.reviews
        : products[index].reviews || [],
      updatedAt: new Date().toISOString(),
    };

    console.log(
      "Prepared updated product:",
      JSON.stringify(updatedProduct, null, 2)
    );

    // Validate required fields
    if (
      !updatedProduct.name ||
      !updatedProduct.sku ||
      !updatedProduct.categoryId
    ) {
      console.error("Missing required fields:", {
        name: !updatedProduct.name,
        sku: !updatedProduct.sku,
        categoryId: !updatedProduct.categoryId,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate numeric values
    if (isNaN(updatedProduct.price) || updatedProduct.price < 0) {
      console.error("Invalid price:", updatedProduct.price);
      return res.status(400).json({ error: "Invalid price value" });
    }
    if (isNaN(updatedProduct.stock) || updatedProduct.stock < 0) {
      console.error("Invalid stock:", updatedProduct.stock);
      return res.status(400).json({ error: "Invalid stock value" });
    }
    if (
      isNaN(updatedProduct.rating) ||
      updatedProduct.rating < 0 ||
      updatedProduct.rating > 5
    ) {
      console.error("Invalid rating:", updatedProduct.rating);
      return res.status(400).json({ error: "Invalid rating value" });
    }

    // Update the product in the array
    products[index] = updatedProduct;

    // Update store.json with error handling
    try {
      console.log("Reading store.json");
      const storeData = JSON.parse(fs.readFileSync(storePath, "utf8"));
      storeData.products = products;

      console.log("Writing to store.json");
      fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2));
      console.log("Successfully updated store.json");
    } catch (error) {
      console.error("Error updating store.json:", error);
      throw new Error(`Failed to save product data: ${error.message}`);
    }

    console.log("Successfully updated product");
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error in product update:", error);
    res.status(500).json({
      error: "Failed to update product",
      message: error.message,
      details: error.stack,
    });
  }
});

// Delete a product
router.delete("/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(index, 1);

  // Update store.json
  try {
    const storeData = JSON.parse(fs.readFileSync(storePath, "utf8"));
    storeData.products = products;
    fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2));
    console.log("Updated store.json after deleting product");
  } catch (error) {
    console.error("Error updating store.json:", error);
  }

  res.status(204).send();
});

// Upload endpoint for product images
router.post("/:id/images", upload.array("images", 4), (req, res) => {
  const productId = req.params.id;

  // Find the product
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    // Clean up any uploaded files if there's an error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
          console.log(
            `Cleaned up file ${file.path} after error - product not found`
          );
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${file.path}:`, cleanupError);
        }
      });
    }
    return res.status(404).json({ error: "Product not found" });
  }

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Return the paths of uploaded files
    const filePaths = req.files.map((file) => {
      const isVideo = file.mimetype.startsWith("video/");
      return {
        path: `/${isVideo ? "videos" : "images"}/products/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: isVideo ? "video" : "image",
      };
    });

    // Update the product with the new image paths
    const product = products[productIndex];
    // Store original filenames where possible to maintain readability
    const imageFilenames = filePaths.map((file) => file.filename);

    if (!product.images) {
      product.images = [];
    }
    if (!product.videos) {
      product.videos = [];
    }

    // Separate images and videos
    filePaths.forEach((file) => {
      if (file.type === "video") {
        product.videos.push(file.filename);
      } else {
        product.images.push(file.filename);
      }
    });

    product.updatedAt = new Date().toISOString();

    // Update store.json
    try {
      const storeData = JSON.parse(fs.readFileSync(storePath, "utf8"));
      storeData.products = products;
      fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2));
      console.log("Updated store.json with new product media");
    } catch (error) {
      console.error("Error updating store.json:", error);
    }

    res.json({
      message: "Files uploaded successfully",
      files: filePaths,
      count: filePaths.length,
      productId: productId,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up any uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
          console.log(`Cleaned up file ${file.path} after error`);
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${file.path}:`, cleanupError);
        }
      });
    }

    res.status(500).json({
      error: "Failed to upload files",
      message: error.message,
    });
  }
});

// Upload endpoint for general product images (no product ID)
router.post("/upload", upload.array("images", 4), async (req, res) => {
  // Set a longer timeout for this specific route
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Return the paths of uploaded files
    const filePaths = req.files.map((file) => {
      const isVideo = file.mimetype.startsWith("video/");
      return {
        path: `/${isVideo ? "videos" : "images"}/products/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: isVideo ? "video" : "image",
      };
    });

    res.json({
      message: "Files uploaded successfully",
      files: filePaths,
      count: filePaths.length,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up any uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
          console.log(`Cleaned up file ${file.path} after error`);
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${file.path}:`, cleanupError);
        }
      });
    }

    res.status(500).json({
      error: "Failed to upload files",
      message: error.message,
    });
  }
});

module.exports = router;
