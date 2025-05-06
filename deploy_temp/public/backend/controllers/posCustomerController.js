const {
  getAllCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
} = require("../services/posCustomerService");

const getAll = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching POS customers:", error);
    res.status(500).json({ message: "Error fetching POS customers" });
  }
};

const getByPhone = async (req, res) => {
  try {
    const customer = await getCustomerByPhone(req.params.phone);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching POS customer:", error);
    res.status(500).json({ message: "Error fetching POS customer" });
  }
};

const create = async (req, res) => {
  try {
    const { phone, name } = req.body;
    const customer = await createCustomer({
      phone,
      name: name || "Walk-in Customer",
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating POS customer:", error);
    if (error.message === "Customer already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating POS customer" });
  }
};

const update = async (req, res) => {
  try {
    const { totalOrders, totalSpent, isNew } = req.body;
    const customer = await updateCustomer(req.params.id, {
      totalOrders,
      totalSpent,
      isNew,
    });
    res.json(customer);
  } catch (error) {
    console.error("Error updating POS customer:", error);
    if (error.message === "Customer not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating POS customer" });
  }
};

module.exports = {
  getAll,
  getByPhone,
  create,
  update,
};
