const express = require("express");
const {
  getAll,
  getByPhone,
  create,
  update,
} = require("../controllers/posCustomerController.js");

const router = express.Router();

// Get all POS customers
router.get("/", getAll);

// Get POS customer by phone
router.get("/phone/:phone", getByPhone);

// Create new POS customer
router.post("/", create);

// Update POS customer
router.put("/:id", update);

module.exports = router;
