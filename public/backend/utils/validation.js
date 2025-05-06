function validateOrder(orderData) {
  const errors = [];

  // Validate shipping address
  if (!orderData.shippingAddress) {
    errors.push("Shipping address is required");
  } else {
    const { fullName, email, phone, address, city, state, country, pincode } =
      orderData.shippingAddress;

    if (!fullName) errors.push("Full name is required");
    if (!email) errors.push("Email is required");
    if (!phone) errors.push("Phone number is required");
    if (!address) errors.push("Address is required");
    if (!city) errors.push("City is required");
    if (!state) errors.push("State is required");
    if (!country) errors.push("Country is required");
    if (!pincode) errors.push("Pincode is required");
  }

  // Validate items
  if (!orderData.items || orderData.items.length === 0) {
    errors.push("At least one item is required");
  } else {
    orderData.items.forEach((item, index) => {
      if (!item.id) errors.push(`Item ${index + 1}: Product ID is required`);
      if (!item.quantity || item.quantity < 1)
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      if (!item.price) errors.push(`Item ${index + 1}: Price is required`);
    });
  }

  // Validate total price
  if (!orderData.total || orderData.total <= 0) {
    errors.push("Valid total price is required");
  }

  return errors.length > 0 ? errors.join(", ") : null;
}

module.exports = {
  validateOrder,
};
