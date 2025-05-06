class Product {
  constructor(
    id,
    name,
    description,
    price,
    images,
    rating,
    reviews,
    specifications
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.images = images;
    this.rating = rating;
    this.reviews = reviews;
    this.specifications = specifications;
  }
}

class Category {
  constructor(id, name, description, image, isActive, subcategories) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.isActive = isActive;
    this.subcategories = subcategories;
  }
}

class Customer {
  constructor(id, name, email, password, role = "customer") {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.addresses = [];
    this.createdAt = new Date().toISOString();
    this.lastLogin = new Date().toISOString();
  }
}

class Review {
  constructor(id, customerId, productId, rating, comment) {
    this.id = id;
    this.customerId = customerId;
    this.productId = productId;
    this.rating = rating;
    this.comment = comment;
  }
}

class Order {
  constructor(id, customerId, products, totalAmount, status, shippingAddress) {
    this.id = id;
    this.customerId = customerId;
    this.products = products;
    this.totalAmount = totalAmount;
    this.status = status;
    this.shippingAddress = shippingAddress;
  }
}

module.exports = {
  Product,
  Category,
  Customer,
  Review,
  Order,
};
