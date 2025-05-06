const express = require("express");
const {
  sendOrderEmails,
  sendContactFormEmail,
} = require("../services/emailService.js");
const { readData } = require("../utils/fileUtils.js");

const router = express.Router();

router.post("/order", async (req, res) => {
  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order data is required",
      });
    }

    // Get email settings first to validate configuration
    const settings = await readData("settings.json");
    if (!settings || !settings.email) {
      return res.status(500).json({
        success: false,
        message: "Email settings not found",
        details: "Please configure email settings in the admin panel",
      });
    }

    // Send both customer and store emails
    const result = await sendOrderEmails(order);

    res.json({
      success: true,
      message: "Order confirmation emails sent successfully",
      emails: {
        customerEmail: result.customerEmail,
        storeEmail: result.storeEmail,
      },
    });
  } catch (error) {
    console.error("Error sending order confirmation emails:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send order confirmation emails";
    let errorDetails = error.message || "Unknown error occurred";

    if (error.message.includes("Invalid login")) {
      errorMessage = "Invalid email credentials";
      errorDetails =
        "Please check your email username and password in the admin panel";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Connection timeout";
      errorDetails =
        "The email server is not responding. Please check your internet connection and try again.";
    } else if (error.message.includes("socket")) {
      errorMessage = "Connection error";
      errorDetails =
        "Unable to connect to the email server. Please check your SMTP settings.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
});

// Test email endpoint
router.post("/test", async (req, res) => {
  try {
    const { email, order } = req.body;

    if (!email || !order) {
      return res.status(400).json({
        error: "Email and order data are required",
      });
    }

    const settings = await readData("settings.json");
    if (!settings || !settings.email) {
      return res.status(400).json({
        error: "Email settings not found",
      });
    }

    // Send both customer and store emails
    const result = await sendOrderEmails(order);

    res.json({
      success: true,
      message: "Test emails sent successfully",
      details: result,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      error: "Failed to send test email",
      details: error.message,
    });
  }
});

// Contact form submission endpoint
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Get email settings first to validate configuration
    const settings = await readData("settings.json");
    if (!settings || !settings.email) {
      return res.status(500).json({
        success: false,
        message: "Email settings not found",
        details: "Please configure email settings in the admin panel",
      });
    }

    // Send contact form email
    await sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.json({
      success: true,
      message: "Contact form message sent successfully",
    });
  } catch (error) {
    console.error("Error sending contact form message:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send contact form message";
    let errorDetails = error.message || "Unknown error occurred";

    if (error.message.includes("Invalid login")) {
      errorMessage = "Invalid email credentials";
      errorDetails =
        "Please check your email username and password in the admin panel";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Connection timeout";
      errorDetails =
        "The email server is not responding. Please check your internet connection and try again.";
    } else if (error.message.includes("socket")) {
      errorMessage = "Connection error";
      errorDetails =
        "Unable to connect to the email server. Please check your SMTP settings.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
});

module.exports = router;
