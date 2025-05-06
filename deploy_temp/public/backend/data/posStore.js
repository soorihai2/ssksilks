const fs = require("fs");
const path = require("path");

const posCustomersFile = path.join(__dirname, "posCustomers.json");
const posOrdersFile = path.join(__dirname, "posOrders.json");

// Initialize POS customers store
let posCustomers = [];
try {
  const data = fs.readFileSync(posCustomersFile, "utf8");
  posCustomers = JSON.parse(data);
} catch (error) {
  console.log("Creating new posCustomers.json");
  fs.writeFileSync(posCustomersFile, JSON.stringify([], null, 2));
}

// Initialize POS orders store
let posOrders = [];
try {
  const data = fs.readFileSync(posOrdersFile, "utf8");
  posOrders = JSON.parse(data);
} catch (error) {
  console.log("Creating new posOrders.json");
  fs.writeFileSync(posOrdersFile, JSON.stringify([], null, 2));
}

// Helper function to save POS customers
const savePosCustomers = () => {
  fs.writeFileSync(posCustomersFile, JSON.stringify(posCustomers, null, 2));
};

// Helper function to save POS orders
const savePosOrders = () => {
  fs.writeFileSync(posOrdersFile, JSON.stringify(posOrders, null, 2));
};

// POS Customer Store
const posCustomerStore = {
  getAll: () => posCustomers,
  getById: (id) => posCustomers.find((c) => c.id === id),
  getByPhone: (phone) => posCustomers.find((c) => c.phone === phone),
  getByEmail: (email) => posCustomers.find((c) => c.email === email),
  create: (customer) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    posCustomers.push(newCustomer);
    savePosCustomers();
    return newCustomer;
  },
  update: (id, customer) => {
    const index = posCustomers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    posCustomers[index] = { ...posCustomers[index], ...customer };
    savePosCustomers();
    return posCustomers[index];
  },
  delete: (id) => {
    const index = posCustomers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const deletedCustomer = posCustomers.splice(index, 1)[0];
    savePosCustomers();
    return deletedCustomer;
  },
};

// POS Order Store
const posOrderStore = {
  getAll: () => posOrders,
  getById: (id) => posOrders.find((o) => o.id === id),
  getByCustomerId: (customerId) =>
    posOrders.filter((o) => o.customerId === customerId),
  create: (order) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      type: "pos",
    };
    posOrders.push(newOrder);
    savePosOrders();
    return newOrder;
  },
  update: (id, order) => {
    const index = posOrders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    posOrders[index] = { ...posOrders[index], ...order };
    savePosOrders();
    return posOrders[index];
  },
  delete: (id) => {
    const index = posOrders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const deletedOrder = posOrders.splice(index, 1)[0];
    savePosOrders();
    return deletedOrder;
  },
};

module.exports = {
  posCustomerStore,
  posOrderStore,
};
