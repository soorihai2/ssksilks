const express = require("express");
const productsRouter = require("./products");
const ordersRouter = require("./orders");
const categoriesRouter = require("./categories");
const settingsRouter = require("./settings");
const emailRouter = require("./email");
const notificationsRouter = require("./notifications");
const customersRouter = require("./customers");

const router = express.Router();

router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/categories", categoriesRouter);
router.use("/settings", settingsRouter);
router.use("/email", emailRouter);
router.use("/notifications", notificationsRouter);
router.use("/customers", customersRouter);

module.exports = router;
