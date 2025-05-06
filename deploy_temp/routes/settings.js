const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Create directory for offers images
const offersDir = path.join(__dirname, "../../images/offers");
fs.mkdirSync(offersDir, { recursive: true });

// Log the offers directory path
console.log(`Offers directory path: ${offersDir}`);

// Configure multer for offer image upload
const offerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists
    if (!fs.existsSync(offersDir)) {
      console.log(`Creating offers directory: ${offersDir}`);
      fs.mkdirSync(offersDir, { recursive: true });
    }
    cb(null, offersDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname) || ".jpg";
    cb(null, uniqueSuffix + fileExt);
  },
});

// Log file upload configuration
console.log("File upload configuration:", {
  destination: offersDir,
  allowedTypes: "image/*",
  maxFileSize: "5MB",
});

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
});

// Get settings
router.get("/", (req, res) => {
  try {
    const settingsPath = path.join(__dirname, "../data/settings.json");
    console.log(`Reading settings from: ${settingsPath}`);

    // Check if file exists
    if (!fs.existsSync(settingsPath)) {
      console.error(`Settings file does not exist at path: ${settingsPath}`);
      return res.status(500).json({ error: "Settings file not found" });
    }

    const fileContent = fs.readFileSync(settingsPath, "utf8");
    console.log(`Settings file content length: ${fileContent.length} bytes`);

    try {
      const settings = JSON.parse(fileContent);
      res.json(settings);
    } catch (parseError) {
      console.error(`Error parsing settings JSON: ${parseError.message}`);
      res.status(500).json({ error: "Error parsing settings data" });
    }
  } catch (error) {
    console.error(`Error reading settings: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ error: "Error reading settings" });
  }
});

// Update settings
router.put("/", (req, res) => {
  try {
    const settingsPath = path.join(__dirname, "../data/settings.json");
    console.log(`Updating settings at: ${settingsPath}`);

    // Validate req.body
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("Empty or invalid settings data received");
      return res.status(400).json({ error: "Invalid settings data" });
    }

    console.log(
      `Writing settings data with keys: ${Object.keys(req.body).join(", ")}`
    );

    // Ensure directory exists
    const dirPath = path.dirname(settingsPath);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check write permissions
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
    } catch (accessError) {
      console.error(
        `Directory ${dirPath} is not writable: ${accessError.message}`
      );
      return res
        .status(500)
        .json({ error: "Cannot write to settings directory" });
    }

    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
    console.log("Settings updated successfully");
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error(`Error updating settings: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ error: "Error updating settings" });
  }
});

// Offer image upload endpoint
router.post("/offer-image", offerUpload.single("image"), (req, res) => {
  console.log("Offer image upload request received");
  console.log("Request body:", req.body);
  console.log(
    "Request file:",
    req.file
      ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }
      : "No file found"
  );

  try {
    if (!req.file) {
      console.error("No file uploaded in the request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(
      `File uploaded: ${JSON.stringify({
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      })}`
    );

    // Return the path of the uploaded file
    const imagePath = `/images/offers/${req.file.filename}`;
    console.log("Uploaded file path:", imagePath);
    res.json({ imagePath });
  } catch (error) {
    console.error("Error in offer image upload:", error.message);
    console.error(error.stack);

    // Delete the uploaded file if there's an error
    if (req.file) {
      try {
        console.log(`Attempting to delete file: ${req.file.path}`);
        fs.unlinkSync(req.file.path);
        console.log(`Successfully deleted file: ${req.file.path}`);
      } catch (unlinkError) {
        console.error(
          `Error deleting file ${req.file.path}:`,
          unlinkError.message
        );
      }
    }

    res.status(500).json({ error: "Error uploading offer image" });
  }
});

module.exports = router;
