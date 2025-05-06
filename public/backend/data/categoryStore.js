const {
  store,
  createItem,
  findById,
  updateItem,
  deleteItem,
} = require("./store");

const categoryStore = {
  getAll: () => {
    return store.categories;
  },

  getById: (id) => {
    return findById(store.categories, id);
  },

  create: (category) => {
    return createItem(store.categories, category);
  },

  update: (id, updates) => {
    return updateItem(store.categories, id, updates);
  },

  delete: (id) => {
    return deleteItem(store.categories, id);
  },
};

module.exports = categoryStore;
