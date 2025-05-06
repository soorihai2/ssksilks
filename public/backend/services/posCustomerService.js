const fs = require("fs").promises;
const path = require("path");

const CUSTOMERS_FILE = path.join(__dirname, "../data/posCustomers.json");

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(CUSTOMERS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize customers file if it doesn't exist
async function initializeCustomersFile() {
  try {
    await fs.access(CUSTOMERS_FILE);
  } catch {
    await fs.writeFile(CUSTOMERS_FILE, JSON.stringify([]));
  }
}

// Read all customers
async function getAllCustomers() {
  await ensureDataDirectory();
  await initializeCustomersFile();
  const data = await fs.readFile(CUSTOMERS_FILE, "utf8");
  return JSON.parse(data);
}

// Write customers to file
async function writeCustomers(customers) {
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
}

// Get customer by phone
async function getCustomerByPhone(phone) {
  const customers = await getAllCustomers();
  return customers.find((customer) => customer.phone === phone);
}

// Create new customer
async function createCustomer(customerData) {
  const customers = await getAllCustomers();

  // Check if customer already exists
  if (customers.some((customer) => customer.phone === customerData.phone)) {
    throw new Error("Customer already exists");
  }

  const newCustomer = {
    id: Date.now().toString(),
    ...customerData,
    isNew: true,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };

  customers.push(newCustomer);
  await writeCustomers(customers);
  return newCustomer;
}

// Update customer
async function updateCustomer(id, updates) {
  const customers = await getAllCustomers();
  const index = customers.findIndex((c) => c.id === id);

  if (index === -1) {
    throw new Error("Customer not found");
  }

  // Update isNew status based on totalOrders
  if (updates.totalOrders !== undefined) {
    updates.isNew = updates.totalOrders === 0;
  }

  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeCustomers(customers);
  return customers[index];
}

module.exports = {
  getAllCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
};
