const fs = require("fs");
const path = require("path");

const CUSTOMERS_FILE = path.join(__dirname, "posCustomers.json");

// Initialize customers file if it doesn't exist
if (!fs.existsSync(CUSTOMERS_FILE)) {
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify([], null, 2));
}

function loadCustomers() {
  try {
    const data = fs.readFileSync(CUSTOMERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading customers:", error);
    return [];
  }
}

function saveCustomers(customers) {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
  } catch (error) {
    console.error("Error saving customers:", error);
  }
}

const posCustomerStore = {
  getAll: () => {
    return loadCustomers();
  },

  getById: (id) => {
    const customers = loadCustomers();
    return customers.find((c) => c.id === id);
  },

  getByPhone: (phone) => {
    const customers = loadCustomers();
    return customers.find((c) => c.phone === phone);
  },

  create: (customer) => {
    const customers = loadCustomers();
    const newCustomer = {
      id: Date.now().toString(),
      ...customer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
    };
    customers.push(newCustomer);
    saveCustomers(customers);
    return newCustomer;
  },

  update: (id, updates) => {
    const customers = loadCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index !== -1) {
      customers[index] = {
        ...customers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveCustomers(customers);
      return customers[index];
    }
    return null;
  },

  delete: (id) => {
    const customers = loadCustomers();
    const filteredCustomers = customers.filter((c) => c.id !== id);
    if (filteredCustomers.length !== customers.length) {
      saveCustomers(filteredCustomers);
      return true;
    }
    return false;
  },
};

module.exports = posCustomerStore;
