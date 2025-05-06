const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  store,
  createItem,
  findById,
  updateItem,
  deleteItem,
} = require("../data/store.js");
const { posCustomerStore, posOrderStore } = require("../data/posStore.js");
const { readData } = require("../utils/fileUtils.js");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();

const ORDERS_FILE = path.join(__dirname, "../data/orders.json");

// Helper function to read orders
async function readOrders() {
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data).orders || [];
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2));
      return [];
    }
    throw error;
  }
}

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

// Register customer
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }

    // Check if customer already exists by email or phone
    const existingCustomer =
      posCustomerStore.getByEmail(email) || posCustomerStore.getByPhone(phone);
    if (existingCustomer) {
      return res.status(400).json({
        message:
          existingCustomer.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customerData = {
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      addresses: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const customer = posCustomerStore.create(customerData);

    // Search for existing orders with matching email or phone
    const existingOrders = posOrderStore
      .getAll()
      .filter(
        (order) =>
          order.shippingAddress &&
          order.shippingAddress.email === email &&
          (!order.userId || order.userId === "guest")
      );

    console.log("Found existing orders:", existingOrders.length);
    console.log(
      "Orders to link:",
      existingOrders.map((o) => ({
        id: o.id,
        email: o.shippingAddress.email,
        phone: o.shippingAddress.phone,
        status: o.status,
        total: o.total,
        userId: o.userId,
        customerId: o.customerId,
      }))
    );

    // Link existing orders to the customer account
    if (existingOrders.length > 0) {
      existingOrders.forEach((order) => {
        const updatedOrder = posOrderStore.update(order.id, {
          userId: customer.id,
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
        });
        console.log("Linked order:", {
          id: updatedOrder.id,
          userId: updatedOrder.userId,
          customerId: updatedOrder.customerId,
          status: updatedOrder.status,
          email: updatedOrder.shippingAddress.email,
        });
      });
    }

    res.status(201).json({
      message: "Customer registered successfully",
      linkedOrders: existingOrders.length,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: "Invalid customer data" });
  }
});

// Login customer
router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    console.log("Login attempt with:", { email, phone });
    console.log("Store state:", {
      hasStore: !!store,
      hasCustomers: !!store?.customers,
      customersLength: store?.customers?.length,
      customersArray: store?.customers,
    });

    // Find customer by email or phone
    let customer = null;

    // First try to find in store.customers array
    if (email) {
      console.log("Searching by email:", email);
      customer = store.customers.find((c) => c.email === email);
      console.log("Found customer by email:", customer);
    } else if (phone) {
      console.log("Searching by phone:", phone);
      // Try store.customers first
      customer = store.customers.find((c) => c.phone === phone);
      console.log("Found customer by phone in store:", customer);

      // If not found, try POS customers
      if (!customer) {
        console.log("Customer not found in store, trying POS store");
        const posCustomer = posCustomerStore.getByPhone(phone);
        if (posCustomer) {
          customer = {
            ...posCustomer,
            type: "pos",
          };
          console.log("Found customer in POS store:", customer);
        }
      }
    } else {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    if (!customer) {
      console.log("No customer found with provided credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    console.log(
      "Verifying password for customer:",
      customer.email || customer.phone
    );
    const isMatch = await bcrypt.compare(password, customer.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Update last login
    if (customer.type === "pos") {
      posCustomerStore.update(customer.id, {
        lastLogin: new Date().toISOString(),
      });
    } else {
      // Update last login in store.customers
      const index = store.customers.findIndex((c) => c.id === customer.id);
      if (index !== -1) {
        store.customers[index].lastLogin = new Date().toISOString();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer.id,
        role: customer.role || "customer",
        email: customer.email,
        phone: customer.phone,
        name: customer.name,
        type: customer.type || "web",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Remove sensitive data from response
    const { password: _, ...customerData } = customer;
    res.json({
      token,
      customer: customerData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Get customer profile
router.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.customerId;

  // Try to find customer in both stores
  let customer = store.customers.find((c) => c.id === userId);

  if (!customer) {
    // If not found in store.customers, try posCustomerStore
    customer = posCustomerStore.getById(userId);
  }

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Remove password from response
  const { password, ...customerProfile } = customer;
  res.json(customerProfile);
});

// Update customer profile
router.patch("/profile", authenticateToken, (req, res) => {
  const userId = req.user.customerId;
  const customer = posCustomerStore.getById(userId);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  try {
    const updates = {
      ...req.body,
      // Don't allow updating password through this endpoint
      password: customer.password,
    };

    const updatedCustomer = posCustomerStore.update(userId, updates);
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Remove password from response
    const { password, ...customerProfile } = updatedCustomer;
    res.json(customerProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({ message: "Invalid customer data" });
  }
});

// Change password
router.post("/change-password", authenticateToken, async (req, res) => {
  const userId = req.user.customerId;
  const customer = posCustomerStore.getById(userId);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedCustomer = posCustomerStore.update(userId, {
      password: hashedPassword,
    });
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(400).json({ message: "Invalid password data" });
  }
});

// Request password reset
router.post("/password-reset-request", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    const customer =
      posCustomerStore.getByEmail(emailOrPhone) ||
      posCustomerStore.getByPhone(emailOrPhone);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in customer data
    posCustomerStore.update(customer.id, {
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString(),
    });

    // TODO: Send reset link via email/SMS
    // For now, just return success
    res.json({ message: "Password reset instructions sent" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(400).json({ message: "Invalid request" });
  }
});

// Reset password
router.post("/password-reset", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find customer with valid reset token
    const customer = store.customers.find(
      (c) => c.resetToken === token && new Date(c.resetTokenExpiry) > new Date()
    );

    if (!customer) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    const updatedCustomer = posCustomerStore.update(customer.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(400).json({ message: "Invalid request" });
  }
});

// Get customer orders
router.get("/orders", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const userEmail = req.user.email?.toLowerCase();
    const userPhone = req.user.phone;

    console.log("Fetching orders for customer:", {
      customerId,
      userEmail,
      userPhone,
      userName: req.user.name,
    });

    // Get regular orders
    const regularOrders = await readOrders();
    console.log("Regular orders found:", regularOrders.length);

    // Get POS orders
    const posOrders = posOrderStore.getAll();
    console.log("POS orders found:", posOrders.length);

    // Combine and filter orders
    const allOrders = [...regularOrders, ...posOrders].filter((order) => {
      const orderEmail =
        order.shippingAddress?.email?.toLowerCase() ||
        order.customerEmail?.toLowerCase() ||
        order.guestDetails?.email?.toLowerCase();

      const orderPhone =
        order.shippingAddress?.phone ||
        order.customerPhone ||
        order.guestDetails?.phone;

      const matchesUserId = order.userId === customerId;
      const matchesCustomerId = order.customerId === customerId;
      const matchesEmail = orderEmail === userEmail;
      const matchesPhone = orderPhone === userPhone;

      const matches =
        matchesUserId || matchesCustomerId || matchesEmail || matchesPhone;

      if (matches) {
        console.log("Matched order:", {
          orderId: order.id,
          matchReason: {
            userId: matchesUserId,
            customerId: matchesCustomerId,
            email: matchesEmail,
            phone: matchesPhone,
          },
          orderDetails: {
            type: order.type,
            status: order.status,
            total: order.total,
            date: order.createdAt,
          },
        });
      }

      return matches;
    });

    console.log("Total matched orders:", allOrders.length);

    // Sort orders by date, newest first
    const sortedOrders = allOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(sortedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get customer addresses
router.get("/addresses", authenticateToken, (req, res) => {
  try {
    const userId = req.user.customerId;
    console.log("Getting addresses for user:", userId);

    // First try to find in store.customers
    let customer = store.customers.find((c) => c.id === userId);
    console.log("Customer found in main store:", !!customer);

    // If not found, try POS store
    if (!customer) {
      customer = posCustomerStore.getById(userId);
      console.log("Customer found in POS store:", !!customer);
    }

    if (!customer) {
      console.log("Customer not found in either store");
      return res.status(404).json({ message: "Customer not found" });
    }

    const addresses = customer.addresses || [];
    console.log("Returning addresses:", addresses.length);
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

// Add new address
router.post("/addresses", authenticateToken, (req, res) => {
  try {
    const userId = req.user.customerId;
    console.log("Adding address for user:", userId);

    // First try to find in store.customers
    let customer = store.customers.find((c) => c.id === userId);
    let isMainStore = true;

    // If not found, try POS store
    if (!customer) {
      customer = posCustomerStore.getById(userId);
      isMainStore = false;
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const newAddress = {
      id: Date.now().toString(),
      ...req.body,
      isDefault: !customer.addresses?.length, // First address is default
    };

    const addresses = [...(customer.addresses || []), newAddress];

    // Update the correct store
    if (isMainStore) {
      const index = store.customers.findIndex((c) => c.id === userId);
      if (index !== -1) {
        store.customers[index].addresses = addresses;
        saveStore();
      }
    } else {
      posCustomerStore.update(userId, { addresses });
    }

    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Add address error:", error);
    res.status(400).json({ message: "Invalid address data" });
  }
});

// Update address
router.put("/addresses/:addressId", authenticateToken, (req, res) => {
  try {
    const userId = req.user.customerId;

    // First try to find in store.customers
    let customer = store.customers.find((c) => c.id === userId);
    let isMainStore = true;

    // If not found, try POS store
    if (!customer) {
      customer = posCustomerStore.getById(userId);
      isMainStore = false;
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { addressId } = req.params;
    const addresses = (customer.addresses || []).map((addr) =>
      addr.id === addressId ? { ...addr, ...req.body } : addr
    );

    // Update the correct store
    if (isMainStore) {
      const index = store.customers.findIndex((c) => c.id === userId);
      if (index !== -1) {
        store.customers[index].addresses = addresses;
        saveStore();
      }
    } else {
      posCustomerStore.update(userId, { addresses });
    }

    const updatedAddress = addresses.find((addr) => addr.id === addressId);
    res.json(updatedAddress);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(400).json({ message: "Invalid address data" });
  }
});

// Delete address
router.delete("/addresses/:addressId", authenticateToken, (req, res) => {
  try {
    const userId = req.user.customerId;

    // First try to find in store.customers
    let customer = store.customers.find((c) => c.id === userId);
    let isMainStore = true;

    // If not found, try POS store
    if (!customer) {
      customer = posCustomerStore.getById(userId);
      isMainStore = false;
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { addressId } = req.params;
    const addresses = (customer.addresses || []).filter(
      (addr) => addr.id !== addressId
    );

    // Update the correct store
    if (isMainStore) {
      const index = store.customers.findIndex((c) => c.id === userId);
      if (index !== -1) {
        store.customers[index].addresses = addresses;
        saveStore();
      }
    } else {
      posCustomerStore.update(userId, { addresses });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(400).json({ message: "Failed to delete address" });
  }
});

// Set default address
router.patch("/addresses/:addressId/default", authenticateToken, (req, res) => {
  try {
    const userId = req.user.customerId;

    // First try to find in store.customers
    let customer = store.customers.find((c) => c.id === userId);
    let isMainStore = true;

    // If not found, try POS store
    if (!customer) {
      customer = posCustomerStore.getById(userId);
      isMainStore = false;
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { addressId } = req.params;
    const addresses = (customer.addresses || []).map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    // Update the correct store
    if (isMainStore) {
      const index = store.customers.findIndex((c) => c.id === userId);
      if (index !== -1) {
        store.customers[index].addresses = addresses;
        saveStore();
      }
    } else {
      posCustomerStore.update(userId, { addresses });
    }

    res.json({ message: "Default address updated successfully" });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(400).json({ message: "Failed to update default address" });
  }
});

// Get customer by phone number (POS only)
router.get("/phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    // Find customer by phone using posCustomerStore
    let customer = posCustomerStore.getByPhone(phone);

    if (!customer) {
      // Create new POS customer if not found
      customer = posCustomerStore.create({
        phone,
        name: "Walk-in Customer",
        type: "pos",
        totalOrders: 0,
      });
    }

    // Get customer's order count
    const orders = posOrderStore.getAll();
    const orderCount = orders.filter(
      (order) => order.customerId === customer.id && order.type === "pos"
    ).length;

    res.json({
      ...customer,
      totalOrders: orderCount,
      isNew: !customer.name || customer.name === "Walk-in Customer",
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer" });
  }
});

module.exports = router;
