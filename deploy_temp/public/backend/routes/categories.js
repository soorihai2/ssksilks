const express = require("express");
const {
  store,
  findById,
  createItem,
  updateItem,
  deleteItem,
} = require("../data/store");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for category image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../images/categories");
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a more reliable filename with .jpg extension for consistency
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Always use .jpg extension for category images
    cb(null, uniqueSuffix + ".jpg");
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all categories
router.get("/", (req, res) => {
  try {
    const categories = store.categories;
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Get category by ID
router.get("/:id", (req, res) => {
  try {
    const category = findById(store.categories, req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Error fetching category" });
  }
});

// Create new category
router.post("/", (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      image:
        typeof req.body.image === "string"
          ? req.body.image
          : "/images/categories/placeholder.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const category = createItem(store.categories, categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category" });
  }
});

// Update category
router.put("/:id", (req, res) => {
  try {
    const category = updateItem(store.categories, req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Error updating category" });
  }
});

// Delete category
router.delete("/:id", (req, res) => {
  try {
    const success = deleteItem(store.categories, req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Error deleting category" });
  }
});

// Upload category image
router.post("/:id/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const category = findById(store.categories, req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update category with new image path
    const imagePath = `/images/categories/${req.file.filename}`;

    // Store just the relative path for consistency
    const updatedCategory = updateItem(store.categories, req.params.id, {
      ...category,
      image: imagePath,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      ...updatedCategory,
      imageUrl: imagePath, // Send back the complete URL
    });
  } catch (error) {
    console.error("Error uploading category image:", error);
    // If there was an error and a file was uploaded, try to clean up
    if (req.file) {
      try {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file ${filePath} after error`);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    res.status(500).json({ error: "Failed to upload category image" });
  }
});

module.exports = router;
