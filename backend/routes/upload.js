const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../images/products");
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and always use .jpg extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Always use .jpg extension for product images for consistency
    cb(null, uniqueSuffix + ".jpg");
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/gif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, JPG, GIF and WebP are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload endpoint
router.post("/", upload.array("images", 4), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Return the paths of uploaded files
    const filePaths = req.files.map((file) => ({
      path: `/images/products/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

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
