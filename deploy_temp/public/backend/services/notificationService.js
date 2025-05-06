const { readData, writeData } = require("../utils/fileUtils");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

const NOTIFICATIONS_FILE = path.join(__dirname, "../data/notifications.json");

// Initialize notifications file if it doesn't exist
async function initializeNotificationsFile() {
  try {
    await fs.access(NOTIFICATIONS_FILE);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(
        NOTIFICATIONS_FILE,
        JSON.stringify({ notifications: [] }, null, 2)
      );
      console.log("Notifications file initialized");
    } else {
      throw error;
    }
  }
}

// Helper function to read notifications
async function readNotifications() {
  try {
    await initializeNotificationsFile();
    const data = await fs.readFile(NOTIFICATIONS_FILE, "utf8");
    return JSON.parse(data).notifications;
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
}

// Helper function to write notifications
async function writeNotifications(notifications) {
  try {
    await initializeNotificationsFile();
    await fs.writeFile(
      NOTIFICATIONS_FILE,
      JSON.stringify({ notifications }, null, 2)
    );
  } catch (error) {
    console.error("Error writing notifications:", error);
    throw error;
  }
}

// Create a new notification
async function createNotification(notification) {
  const notifications = await readNotifications();
  const newNotification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(newNotification);
  await writeNotifications(notifications);
  return newNotification;
}

// Get all notifications
async function getNotifications() {
  return await readNotifications();
}

// Get unread notifications count
async function getUnreadCount() {
  const notifications = await readNotifications();
  return notifications.filter((n) => !n.read).length;
}

// Mark notification as read
async function markAsRead(id) {
  const notifications = await readNotifications();
  const notification = notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    await writeNotifications(notifications);
    return true;
  }
  return false;
}

// Mark all notifications as read
async function markAllAsRead() {
  const notifications = await readNotifications();
  notifications.forEach((n) => (n.read = true));
  await writeNotifications(notifications);
  return true;
}

// Check for pending orders and create deadline notifications
async function checkOrderDeadlines() {
  const orders = await readData("orders.json");
  const notifications = await readNotifications();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Find orders that are pending for more than 2 days
  const pendingOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return order.status === "pending" && orderDate < twoDaysAgo;
  });

  // Create notifications for pending orders
  for (const order of pendingOrders) {
    const existingNotification = notifications.find(
      (n) => n.type === "deadline" && n.link === `/admin/orders/${order.id}`
    );

    if (!existingNotification) {
      await createNotification({
        type: "deadline",
        title: "Order Processing Deadline",
        message: `Order #${order.id} has been pending for more than 2 days`,
        link: `/admin/orders/${order.id}`,
      });
    }
  }
}

// Create notification for new customer
async function notifyNewCustomer(customer) {
  await createNotification({
    type: "customer",
    title: "New Customer",
    message: `New customer registered: ${customer.name || customer.email}`,
    link: "/admin/customers",
  });
}

// Create notification for product updates
async function notifyProductUpdate(product) {
  await createNotification({
    type: "product",
    title: "Product Updated",
    message: `Product "${product.name}" has been updated`,
    link: `/admin/products/${product.id}`,
  });
}

// Create notification for new order
async function notifyNewOrder(order) {
  await createNotification({
    type: "order",
    title: "New Order Received",
    message: `New order #${order.id} received from ${order.shippingAddress.fullName}`,
    link: `/admin/orders/${order.id}`,
  });
}

// Create notification for product addition
async function notifyProductAddition(product) {
  await createNotification({
    type: "product",
    title: "New Product Added",
    message: `New product "${product.name}" has been added to the catalog`,
    link: `/admin/products/${product.id}`,
  });
}

// Create notification for product deletion
async function notifyProductDeletion(product) {
  await createNotification({
    type: "product",
    title: "Product Deleted",
    message: `Product "${product.name}" has been deleted from the catalog`,
    link: `/admin/products`,
  });
}

// Create notification for product duplication
async function notifyProductDuplication(product, originalProduct) {
  await createNotification({
    type: "product",
    title: "Product Duplicated",
    message: `Product "${originalProduct.name}" has been duplicated as "${product.name}"`,
    link: `/admin/products/${product.id}`,
  });
}

// Create notification for category addition
async function notifyCategoryAddition(category) {
  await createNotification({
    type: "category",
    title: "New Category Added",
    message: `New category "${category.name}" has been added`,
    link: `/admin/categories`,
  });
}

// Create notification for category update
async function notifyCategoryUpdate(category) {
  await createNotification({
    type: "category",
    title: "Category Updated",
    message: `Category "${category.name}" has been updated`,
    link: `/admin/categories`,
  });
}

// Create notification for category deletion
async function notifyCategoryDeletion(category) {
  await createNotification({
    type: "category",
    title: "Category Deleted",
    message: `Category "${category.name}" has been deleted`,
    link: `/admin/categories`,
  });
}

// Create notification for settings update
async function notifySettingsUpdate(settings) {
  await createNotification({
    type: "settings",
    title: "Settings Updated",
    message: "Store settings have been updated",
    link: `/admin/settings`,
  });
}

// Create notification for offer addition
async function notifyOfferAddition(offer) {
  await createNotification({
    type: "offer",
    title: "New Offer Added",
    message: `New ${offer.isAutomatic ? "automatic" : "manual"} offer "${
      offer.label
    }" has been added`,
    link: `/admin/settings`,
  });
}

// Create notification for offer update
async function notifyOfferUpdate(offer) {
  await createNotification({
    type: "offer",
    title: "Offer Updated",
    message: `Offer "${offer.label}" has been updated`,
    link: `/admin/settings`,
  });
}

// Create notification for offer deletion
async function notifyOfferDeletion(offer) {
  await createNotification({
    type: "offer",
    title: "Offer Deleted",
    message: `Offer "${offer.label}" has been deleted`,
    link: `/admin/settings`,
  });
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  checkOrderDeadlines,
};
