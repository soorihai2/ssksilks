const { Product, Category, Customer, Review, Order } = require("../types");
const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "store.json");
const ordersFile = path.join(__dirname, "orders.json");

const API_BASE_URL =
  process.env.API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ssksilks.in"
    : "http://localhost:3001");

// Initialize store from file or create new if doesn't exist
let store;
try {
  // Check if store.json exists
  if (!fs.existsSync(dataFile)) {
    console.log("store.json does not exist, creating new file");
    store = {
      products: [],
      categories: [],
      users: [], // Initialize users array
      customers: [], // Initialize customers array
      reviews: [],
      orders: [],
    };
    fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
  } else {
    console.log("Reading store.json file");
    const data = fs.readFileSync(dataFile, "utf8");
    store = JSON.parse(data);
    console.log("Store data loaded:", {
      hasUsers: !!store.users,
      usersLength: store.users?.length,
      hasCustomers: !!store.customers,
      customersLength: store.customers?.length,
    });

    // Ensure all required arrays exist
    store.products = store.products || [];
    store.categories = store.categories || [];
    store.users = store.users || []; // Ensure users array exists
    store.customers = store.users; // Convert users array to customers
    console.log("After initialization:", {
      hasUsers: !!store.users,
      usersLength: store.users?.length,
      hasCustomers: !!store.customers,
      customersLength: store.customers?.length,
    });
    store.reviews = store.reviews || [];
    store.orders = store.orders || []; // Initialize orders array
  }

  // Load orders from orders.json
  try {
    if (fs.existsSync(ordersFile)) {
      const ordersData = fs.readFileSync(ordersFile, "utf8");
      const ordersJson = JSON.parse(ordersData);
      store.orders = ordersJson.orders || [];
    } else {
      console.log(
        "orders.json does not exist, initializing empty orders array"
      );
      store.orders = [];
      fs.writeFileSync(ordersFile, JSON.stringify({ orders: [] }, null, 2));
    }
  } catch (error) {
    console.error("Error loading orders.json:", error);
    store.orders = []; // Initialize empty orders array
  }

  // If categories array is empty, initialize with default categories
  if (store.categories.length === 0) {
    store.categories = [
      {
        id: "1",
        name: "Silk Sarees",
        image: "/images/categories/silk-sarees.jpg",
        description: "Traditional silk sarees",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Cotton Sarees",
        image: "/images/categories/cotton-sarees.jpg",
        description: "Comfortable cotton sarees",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    saveStore();
  }
} catch (error) {
  console.error("Error initializing store:", error);
  // Create new store with empty arrays
  store = {
    products: [],
    categories: [
      {
        id: "1",
        name: "Silk Sarees",
        image: "/images/categories/silk-sarees.jpg",
        description: "Traditional silk sarees",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Cotton Sarees",
        image: "/images/categories/cotton-sarees.jpg",
        description: "Comfortable cotton sarees",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    users: [], // Initialize users array
    customers: [], // Initialize customers array
    reviews: [],
    orders: [],
  };
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

// Helper function to clean image path
const cleanImagePath = (path) => {
  if (!path) return "";
  if (path.startsWith("http://")) return path;
  if (path.startsWith("/images/categories/")) return path;
  if (path.startsWith("/images/")) return path;
  return `/images/categories/${path}`;
};

// Helper function to save store to file
const saveStore = () => {
  // Convert customers back to users for backward compatibility
  const storeToSave = {
    ...store,
    users: store.customers,
  };
  fs.writeFileSync(dataFile, JSON.stringify(storeToSave, null, 2));
};

// Helper function to save orders to file
const saveOrders = () => {
  fs.writeFileSync(
    ordersFile,
    JSON.stringify({ orders: store.orders }, null, 2)
  );
};

// CRUD operations
const createItem = (array, item) => {
  // Generate ID if not provided
  if (!item.id) {
    item.id = Date.now().toString();
  }
  array.push(item);
  saveStore();
  return item;
};

const findById = (array, id) => {
  return array.find((item) => item.id === id);
};

const updateItem = (array, id, updates) => {
  const index = array.findIndex((item) => item.id === id);
  if (index !== -1) {
    array[index] = { ...array[index], ...updates };
    saveStore();
    return array[index];
  }
  return null;
};

const deleteItem = (array, id) => {
  const index = array.findIndex((item) => item.id === id);
  if (index !== -1) {
    array.splice(index, 1);
    saveStore();
    return true;
  }
  return false;
};

// Product Store operations
const productStore = {
  getById: (id) => findById(store.products, id),
  getAll: () => store.products,
  create: (product) => createItem(store.products, product),
  update: (id, updates) => updateItem(store.products, id, updates),
  delete: (id) => deleteItem(store.products, id),
};

module.exports = {
  store,
  createItem,
  findById,
  updateItem,
  deleteItem,
  saveStore,
  saveOrders,
  cleanImagePath,
  productStore, // Export the productStore
};
