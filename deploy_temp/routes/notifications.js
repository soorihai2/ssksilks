const express = require("express");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  checkOrderDeadlines,
} = require("../services/notificationService.js");

const router = express.Router();

// Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await getNotifications();
    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

// Get unread notifications count
router.get("/unread-count", async (req, res) => {
  try {
    const count = await getUnreadCount();
    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const success = await markAsRead(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    await markAllAsRead();
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Check order deadlines (admin only)
router.post("/check-deadlines", async (req, res) => {
  try {
    await checkOrderDeadlines();
    res.json({ success: true });
  } catch (error) {
    console.error("Error checking order deadlines:", error);
    res.status(500).json({ error: "Failed to check order deadlines" });
  }
});

module.exports = router;
