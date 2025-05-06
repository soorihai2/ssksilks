const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const ORDERS_FILE = path.join(__dirname, "../data/orders.json");

// Helper function to read orders
async function readOrders() {
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data).orders;
  } catch (error) {
    if (error.code === "ENOENT") {
      // If file doesn't exist, create it with empty orders array
      await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2));
      return [];
    }
    throw error;
  }
}

// Helper function to write orders
async function writeOrders(orders) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2));
}

// Create order
router.post("/", async (req, res) => {
  try {
    const { userId, items, total, shippingAddress } = req.body;

    // Validate required fields
    if (!userId || !items || !total || !shippingAddress) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : null,
          items: !items ? "Items are required" : null,
          total: !total ? "Total amount is required" : null,
          shippingAddress: !shippingAddress
            ? "Shipping address is required"
            : null,
        },
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items must be a non-empty array" });
    }

    // Validate total amount
    if (total <= 0) {
      return res
        .status(400)
        .json({ error: "Total amount must be greater than 0" });
    }

    // Validate shipping address
    const requiredAddressFields = [
      "street",
      "city",
      "state",
      "country",
      "zipCode",
    ];
    const missingFields = requiredAddressFields.filter(
      (field) => !shippingAddress[field]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required shipping address fields",
        details: missingFields,
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    // Read existing orders
    const orders = await readOrders();

    // Create new order
    const order = {
      id: `order_${Date.now()}`,
      userId,
      items,
      total,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add new order and save
    orders.push(order);
    await writeOrders(orders);

    res.status(201).json({
      id: order.id,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      error: "Failed to create order",
      message: error.message,
    });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const orders = await readOrders();
    const order = orders.find((o) => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Verify payment
router.post("/verify", async (req, res) => {
  console.log("Payment verification request received:", {
    body: req.body,
    headers: req.headers,
    url: req.url,
  });

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("Missing required fields:", {
        razorpay_payment_id: !razorpay_payment_id,
        razorpay_order_id: !razorpay_order_id,
        razorpay_signature: !razorpay_signature,
      });
      return res.status(400).json({
        error: "Missing payment verification details",
        details: {
          razorpay_payment_id: !razorpay_payment_id
            ? "Payment ID is required"
            : null,
          razorpay_order_id: !razorpay_order_id ? "Order ID is required" : null,
          razorpay_signature: !razorpay_signature
            ? "Signature is required"
            : null,
        },
      });
    }

    // Read orders and find the order to update
    const orders = await readOrders();
    console.log("Looking for order with Razorpay ID:", razorpay_order_id);

    const orderIndex = orders.findIndex(
      (o) => o.razorpayOrderId === razorpay_order_id
    );
    if (orderIndex === -1) {
      console.error("Order not found:", {
        searchedId: razorpay_order_id,
        availableIds: orders.map((o) => o.razorpayOrderId),
      });
      return res.status(404).json({
        error: "Order not found",
        details: `No order found with Razorpay order ID: ${razorpay_order_id}`,
      });
    }

    const order = orders[orderIndex];

    // Check if payment is already verified
    if (order.paymentStatus === "completed") {
      return res.status(200).json({
        message: "Payment already verified",
        order: order,
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Update order status
      const updatedOrder = {
        ...order,
        paymentStatus: "completed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "processing",
        updatedAt: new Date().toISOString(),
      };

      orders[orderIndex] = updatedOrder;

      // Save updated orders
      await writeOrders(orders);

      res.json({
        message: "Payment verified successfully",
        order: updatedOrder,
      });
    } else {
      // Log failed verification attempt
      console.error("Payment verification failed:", {
        orderId: order.id,
        razorpayOrderId: razorpay_order_id,
        expectedSignature: expectedSign,
        receivedSignature: razorpay_signature,
      });

      // Update order status to failed
      const updatedOrder = {
        ...order,
        paymentStatus: "failed",
        updatedAt: new Date().toISOString(),
      };

      orders[orderIndex] = updatedOrder;
      await writeOrders(orders);

      res.status(400).json({
        error: "Invalid payment signature",
        message:
          "Payment verification failed. Please try again or contact support.",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      error: "Failed to verify payment",
      message: error.message,
    });
  }
});

// Cleanup failed orders
router.post("/cleanup-failed", async (req, res) => {
  try {
    const orders = await readOrders();
    const failedOrders = orders.filter(
      (order) =>
        order.paymentStatus === "failed" &&
        new Date(order.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old
    );

    if (failedOrders.length === 0) {
      return res.json({ message: "No failed orders to clean up" });
    }

    // Remove failed orders
    const updatedOrders = orders.filter(
      (order) =>
        !failedOrders.some((failedOrder) => failedOrder.id === order.id)
    );

    await writeOrders(updatedOrders);

    res.json({
      message: "Failed orders cleaned up successfully",
      cleanedOrders: failedOrders.length,
    });
  } catch (error) {
    console.error("Error cleaning up failed orders:", error);
    res.status(500).json({
      error: "Failed to clean up orders",
      message: error.message,
    });
  }
});

// Debug routes
router.get("/verify-test", (req, res) => {
  res.json({ message: "Verify endpoint is accessible" });
});

router.post("/verify-test", (req, res) => {
  console.log("Test verification request received:", {
    body: req.body,
    headers: req.headers,
  });
  res.json({
    message: "Test verification request received",
    data: req.body,
  });
});

module.exports = router;
