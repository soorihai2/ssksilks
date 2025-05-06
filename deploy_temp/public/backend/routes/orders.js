const express = require("express");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { readData, writeData } = require("../utils/fileUtils");
const { validateOrder } = require("../utils/validation");
const Razorpay = require("razorpay");
const { sendOrderEmails } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const { posOrderStore, posCustomerStore } = require("../data/posStore");
const { productStore } = require("../data/store");

const router = express.Router();

const ORDERS_FILE = path.join(__dirname, "../data/orders.json");

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// Helper function to read orders
async function readOrders() {
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data).orders;
  } catch (error) {
    if (error.code === "ENOENT") {
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
    throw error;
  }
}

// Create a new order
router.post("/", async (req, res) => {
  try {
    const {
      items,
      total,
      shippingAddress,
      isGuestOrder,
      guestDetails,
      isTestOrder,
      sendTestEmails,
    } = req.body;

    // Get settings first
    const settings = await readData("settings.json");
    if (!settings?.payment?.razorpayKeyId) {
      throw new Error("Razorpay key not configured in settings");
    }

    // Get user ID from token if authenticated
    let userId, customerId;
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        userId = decoded.userId;
        customerId = decoded.customerId;
      }
    } catch (error) {
      console.error("Token verification error:", error);
      // Continue as guest if token verification fails
    }

    // For test orders, skip validation and Razorpay order creation
    let order;
    if (isTestOrder && sendTestEmails) {
      console.log("Creating test order for email verification");
      order = {
        ...req.body,
        userId: userId || undefined,
      };
    } else {
      // Regular order flow
      // Validate order data
      const validationError = validateOrder(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Get current Razorpay instance with settings
      const razorpay = await getRazorpayInstance();

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: uuidv4(),
      });

      // Create order in our system
      order = {
        id: uuidv4(),
        userId: userId || undefined,
        customerId: customerId || undefined,
        items,
        subtotal: items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        total,
        shippingAddress,
        status: "pending",
        paymentStatus: "pending",
        razorpayOrderId: razorpayOrder.id,
        createdAt: new Date().toISOString(),
        orderDate: new Date().toISOString(),
        isGuestOrder: isGuestOrder || !userId,
        guestDetails: isGuestOrder ? guestDetails : undefined,
        type: isGuestOrder || !userId ? "guest" : "online",
        orderType: isGuestOrder || !userId ? "guest" : "online",
      };
    }

    // Save order
    const orders = await readOrders();
    orders.push(order);
    await writeOrders(orders);

    // For test orders, send emails immediately
    if (isTestOrder && sendTestEmails) {
      try {
        console.log("Sending test emails for order:", order.id);
        const emailResult = await sendOrderEmails(order);
        console.log("Test email result:", emailResult);

        return res.status(201).json({
          message: "Test order created and emails sent",
          emailResult,
          order,
        });
      } catch (emailError) {
        console.error("Failed to send test emails:", emailError);
        return res.status(500).json({
          error: "Failed to send test emails",
          message: emailError.message,
          order,
        });
      }
    }

    // Regular order response
    res.status(201).json({
      id: order.id,
      razorpayOrderId: order.razorpayOrderId,
      amount: total,
      key: settings.payment.razorpayKeyId,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Failed to create order",
      message: error.message,
    });
  }
});

// Verify order payment
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id) {
      console.error("Payment verification failed: No payment ID provided");
      return res.status(400).json({ error: "Payment ID is required" });
    }

    // Get Razorpay instance
    const razorpay = await getRazorpayInstance();
    console.log("Payment verification started for:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // Find order by payment ID if order ID is not provided
    const orders = await readOrders();
    let orderIndex = -1;

    if (razorpay_order_id) {
      // Normal flow with complete verification
      orderIndex = orders.findIndex(
        (order) => order.razorpayOrderId === razorpay_order_id
      );

      console.log("Order search result:", {
        found: orderIndex !== -1,
        orderIndex,
        totalOrders: orders.length,
      });

      if (orderIndex === -1) {
        console.error(
          `Order not found for razorpay_order_id: ${razorpay_order_id}`
        );
        return res.status(404).json({
          error: "Order not found",
          details: "No order found with the provided Razorpay order ID",
        });
      }

      // Verify signature if provided
      if (razorpay_signature) {
        const generated_signature = crypto
          .createHmac("sha256", razorpay.key_secret)
          .update(razorpay_order_id + "|" + razorpay_payment_id)
          .digest("hex");

        if (generated_signature !== razorpay_signature) {
          console.error(`Invalid signature for order: ${razorpay_order_id}`);
          return res.status(400).json({
            error: "Invalid payment signature",
            details: "Payment signature verification failed",
          });
        }
        console.log("Payment signature verified successfully");
      }
    } else {
      // Fallback: Find order by payment ID
      try {
        const paymentDetails = await razorpay.payments.fetch(
          razorpay_payment_id
        );
        console.log("Payment details fetched:", {
          orderId: paymentDetails?.order_id,
          status: paymentDetails?.status,
        });

        if (paymentDetails && paymentDetails.order_id) {
          orderIndex = orders.findIndex(
            (order) => order.razorpayOrderId === paymentDetails.order_id
          );
          console.log(`Found order by payment ID: ${razorpay_payment_id}`);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        return res.status(500).json({
          error: "Failed to fetch payment details",
          details: error.message,
        });
      }
    }

    if (orderIndex === -1) {
      console.error(`No order found for payment: ${razorpay_payment_id}`);
      return res.status(404).json({
        error: "Order not found",
        details: "No order found for the provided payment information",
      });
    }

    // Create a new order object with updated fields
    const updatedOrder = {
      ...orders[orderIndex],
      paymentStatus: "paid",
      status: "processing",
      paymentId: razorpay_payment_id,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If this is a guest order, try to find and link customer by email/phone
    if (updatedOrder.isGuestOrder && updatedOrder.shippingAddress) {
      const { email, phone } = updatedOrder.shippingAddress;
      const customer =
        posCustomerStore.getByEmail(email) ||
        posCustomerStore.getByPhone(phone);

      if (customer) {
        updatedOrder.customerId = customer.id;
        updatedOrder.userId = customer.id;
        updatedOrder.isGuestOrder = false;
        updatedOrder.type = "online";
        updatedOrder.orderType = "online";
        console.log("Linked guest order to existing customer:", {
          orderId: updatedOrder.id,
          customerId: customer.id,
          email,
          phone,
          type: "online",
        });
      }
    }

    // Update the order in the array
    orders[orderIndex] = updatedOrder;
    console.log("Order updated successfully:", {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
    });

    // Write updated orders back to file
    await writeOrders(orders);
    console.log("Orders file updated successfully");

    // Send confirmation emails with enhanced error handling
    let emailResult = null;
    try {
      console.log(
        "Attempting to send order confirmation emails for order:",
        updatedOrder.id
      );
      emailResult = await sendOrderEmails(updatedOrder);
      console.log("Email sending successful:", emailResult);
    } catch (emailError) {
      console.error("Failed to send order confirmation emails:", {
        error: emailError.message,
        orderId: updatedOrder.id,
        customerEmail: updatedOrder.shippingAddress?.email,
        stack: emailError.stack,
      });
      // Don't throw the error, but include it in the response
      emailResult = {
        success: false,
        error: emailError.message,
      };
    }

    res.json({
      message: "Payment verified successfully",
      order: updatedOrder,
      emailStatus: emailResult,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      error: "Failed to verify payment",
      message: error.message,
      details: "An unexpected error occurred during payment verification",
    });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    // Get both regular and POS orders
    const regularOrders = await readOrders();
    const posOrders = posOrderStore.getAll();

    // Combine and sort by date
    const allOrders = [...regularOrders, ...posOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
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
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const orders = await readOrders();
    const orderIndex = orders.findIndex((o) => o.id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    await writeOrders(orders);
    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Create POS order
router.post("/pos", async (req, res) => {
  try {
    const { items, total, customer, paymentMode } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid items data" });
    }

    if (typeof total !== "number" || total <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // Get or create customer
    let existingCustomer = null;
    if (customer?.id) {
      existingCustomer = posCustomerStore.getById(customer.id);
    } else if (customer?.phone) {
      // Try to find by phone number first
      existingCustomer = posCustomerStore.getByPhone(customer.phone);

      // If not found and it's a new customer, create one
      if (!existingCustomer) {
        existingCustomer = posCustomerStore.create({
          phone: customer.phone,
          name: customer.name || "Walk-in Customer",
          type: "pos",
          isNew: true,
          totalOrders: 0,
          totalSpent: 0,
        });
      }
    }

    // Create new order
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `POS${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer: existingCustomer
        ? {
            id: existingCustomer.id,
            phone: existingCustomer.phone,
            name: existingCustomer.name || "Walk-in Customer",
            isNew: existingCustomer.isNew,
          }
        : {
            phone: customer?.phone || "",
            name: "Walk-in Customer",
            isNew: true,
          },
      items,
      total,
      paymentMode,
      status: "completed",
      paymentStatus: "completed",
      type: "pos",
      orderType: "pos",
    };

    // Save order
    const createdOrder = posOrderStore.create(newOrder);

    // Update customer data if exists
    if (existingCustomer?.id) {
      const customerOrders = posOrderStore
        .getAll()
        .filter((order) => order.customer?.id === existingCustomer.id);

      posCustomerStore.update(existingCustomer.id, {
        ...existingCustomer,
        totalOrders: customerOrders.length + 1,
        totalSpent: (existingCustomer.totalSpent || 0) + total,
        isNew: false,
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating POS order:", error);
    res
      .status(500)
      .json({ message: "Error creating POS order", error: error.message });
  }
});

module.exports = router;
