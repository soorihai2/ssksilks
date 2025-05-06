const nodemailer = require("nodemailer");
const { readData } = require("../utils/fileUtils");

// Helper function to get email settings from admin panel
async function getEmailSettings() {
  try {
    const settings = await readData("settings.json");
    if (!settings || !settings.email) {
      throw new Error("Email settings not found in settings.json");
    }

    const emailSettings = settings.email;
    if (
      !emailSettings.smtpHost ||
      !emailSettings.smtpPort ||
      !emailSettings.smtpUser ||
      !emailSettings.smtpPass ||
      !emailSettings.fromEmail ||
      !emailSettings.fromName
    ) {
      throw new Error("Email settings not properly configured in admin panel");
    }

    return emailSettings;
  } catch (error) {
    console.error("Error getting email settings:", error);
    throw error;
  }
}

// Helper function to get email transporter
async function getTransporter() {
  const settings = await getEmailSettings();
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: true, // Always use SSL/TLS for Gmail
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    pool: true, // Use pooled connections
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 second
    rateLimit: 5, // 5 messages per second
    socketTimeout: 30000, // 30 seconds
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000, // 30 seconds
  });
}

async function sendContactFormEmail(formData) {
  try {
    const transporter = await getTransporter();
    const settings = await getEmailSettings();

    const mailOptions = {
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: settings.smtpUser, // Send to admin email
      subject: `New Contact Form Submission: ${
        formData.subject || "No Subject"
      }`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${formData.subject || "No subject"}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Contact form email sent successfully");
  } catch (error) {
    console.error("Error sending contact form email:", error);
    throw error;
  }
}

function generateOrderConfirmationEmail(order) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .order-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
          }
          .order-details h2 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-group {
            margin-bottom: 15px;
          }
          .info-group label {
            display: block;
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 5px;
            font-weight: 500;
          }
          .info-group span {
            color: #2c3e50;
            font-weight: 600;
            font-size: 15px;
          }
          .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .items-table th,
          .items-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
          }
          .items-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            font-size: 14px;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .items-table tr:hover {
            background: #f8f9fa;
          }
          .total-section {
            text-align: right;
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          .total-section p {
            margin: 8px 0;
            font-size: 16px;
            color: #6c757d;
          }
          .total-section .grand-total {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e9ecef;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 5px 0;
          }
          .highlight {
            color: #3498db;
            font-weight: 600;
          }
          .section-title {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            margin: 25px 0 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          .offer-section {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #ffeeba;
          }
          .offer-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 8px;
          }
          .offer-details {
            margin-left: 20px;
            font-size: 14px;
          }
          .offer-coupon {
            display: inline-block;
            background: #856404;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            margin-top: 4px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          
          <div class="order-details">
            <h2>Order Information</h2>
            <div class="order-info">
              <div class="info-group">
                <label>Order ID</label>
                <span class="highlight">${order.id}</span>
              </div>
              <div class="info-group">
                <label>Order Date</label>
                <span>${new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          ${
            order.activeOffer
              ? `
            <div class="offer-section">
              <div class="offer-title">Applied Offer</div>
              <div class="offer-details">
                <div>${order.activeOffer.label}</div>
                ${
                  order.activeOffer.description
                    ? `<div>${order.activeOffer.description}</div>`
                    : ""
                }
                ${
                  order.activeOffer.coupon
                    ? `<div class="offer-coupon">Coupon Code: ${order.activeOffer.coupon}</div>`
                    : ""
                }
                ${
                  order.activeOffer.discountPercentage
                    ? `<div>Discount: ${order.activeOffer.discountPercentage}% OFF</div>`
                    : ""
                }
                ${
                  order.activeOffer.isAutomatic
                    ? `
                  <div>Automatic Offer Applied</div>
                  ${
                    order.activeOffer.automaticSettings
                      ? `
                    ${
                      order.activeOffer.automaticSettings.minOrderValue
                        ? `<div>Min Order Value: ₹${order.activeOffer.automaticSettings.minOrderValue}</div>`
                        : ""
                    }
                    ${
                      order.activeOffer.automaticSettings.minItems
                        ? `<div>Min Items: ${order.activeOffer.automaticSettings.minItems}</div>`
                        : ""
                    }
                  `
                      : ""
                  }
                `
                    : ""
                }
              </div>
            </div>
          `
              : ""
          }

          <div class="section-title">Shipping Address</div>
          <div class="info-group">
            <span>${order.shippingAddress.fullName}</span><br>
            <span>${order.shippingAddress.address}</span><br>
            <span>${order.shippingAddress.city}, ${
    order.shippingAddress.state
  } ${order.shippingAddress.pincode}</span><br>
            <span>${order.shippingAddress.country}</span><br>
            <span>Phone: ${order.shippingAddress.phone}</span><br>
            <span>Email: ${order.shippingAddress.email}</span>
          </div>

          <div class="section-title">Order Items</div>
          <table class="items-table">
        <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
          <div class="total-section">
            <p>Subtotal: ₹${order.subtotal.toFixed(2)}</p>
            ${
              order.activeOffer
                ? `<p>Discount: -₹${(order.subtotal - order.total).toFixed(
                    2
                  )}</p>`
                : ""
            }
            <p>Shipping: Free</p>
            <p class="grand-total">Total: ₹${order.total.toFixed(2)}</p>
          </div>

          <div class="footer">
            <p>Thank you for your order!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
    </div>
      </body>
    </html>
  `;
}

function generatePackingSlip(order) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Packing Slip - Order #${order.id}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 800px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .order-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
          }
          .order-details h2 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-group {
            margin-bottom: 15px;
          }
          .info-group label {
            display: block;
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 5px;
            font-weight: 500;
          }
          .info-group span {
            color: #2c3e50;
            font-weight: 600;
            font-size: 15px;
          }
          .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .items-table th,
          .items-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
          }
          .items-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            font-size: 14px;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .items-table tr:hover {
            background: #f8f9fa;
          }
          .total-section {
            text-align: right;
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          .total-section p {
            margin: 8px 0;
            font-size: 16px;
            color: #6c757d;
          }
          .total-section .grand-total {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e9ecef;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 5px 0;
          }
          .highlight {
            color: #3498db;
            font-weight: 600;
          }
          .section-title {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            margin: 25px 0 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          .packing-instructions {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #ffeeba;
          }
          .offer-section {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #ffeeba;
          }
          .offer-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 8px;
          }
          .offer-details {
            margin-left: 20px;
            font-size: 14px;
          }
          .offer-coupon {
            display: inline-block;
            background: #856404;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            margin-top: 4px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Packing Slip</h1>
          </div>
          
          <div class="order-details">
            <h2>Order Information</h2>
            <div class="order-info">
              <div class="info-group">
                <label>Order ID</label>
                <span class="highlight">${order.id}</span>
              </div>
              <div class="info-group">
                <label>Order Date</label>
                <span>${new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          ${
            order.activeOffer
              ? `
            <div class="offer-section">
              <div class="offer-title">Applied Offer</div>
              <div class="offer-details">
                <div>${order.activeOffer.label}</div>
                ${
                  order.activeOffer.description
                    ? `<div>${order.activeOffer.description}</div>`
                    : ""
                }
                ${
                  order.activeOffer.coupon
                    ? `<div class="offer-coupon">Coupon Code: ${order.activeOffer.coupon}</div>`
                    : ""
                }
                ${
                  order.activeOffer.discountPercentage
                    ? `<div>Discount: ${order.activeOffer.discountPercentage}% OFF</div>`
                    : ""
                }
                ${
                  order.activeOffer.isAutomatic
                    ? `
                  <div>Automatic Offer Applied</div>
                  ${
                    order.activeOffer.automaticSettings
                      ? `
                    ${
                      order.activeOffer.automaticSettings.minOrderValue
                        ? `<div>Min Order Value: ₹${order.activeOffer.automaticSettings.minOrderValue}</div>`
                        : ""
                    }
                    ${
                      order.activeOffer.automaticSettings.minItems
                        ? `<div>Min Items: ${order.activeOffer.automaticSettings.minItems}</div>`
                        : ""
                    }
                  `
                      : ""
                  }
                `
                    : ""
                }
              </div>
            </div>
          `
              : ""
          }

          <div class="section-title">Shipping Address</div>
          <div class="info-group">
            <span>${order.shippingAddress.fullName}</span><br>
            <span>${order.shippingAddress.address}</span><br>
            <span>${order.shippingAddress.city}, ${
    order.shippingAddress.state
  } ${order.shippingAddress.pincode}</span><br>
            <span>${order.shippingAddress.country}</span><br>
            <span>Phone: ${order.shippingAddress.phone}</span><br>
            <span>Email: ${order.shippingAddress.email}</span>
          </div>

          <div class="section-title">Order Items</div>
          <table class="items-table">
        <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

          <div class="total-section">
            <p>Subtotal: ₹${order.items
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}</p>
            ${
              order.activeOffer
                ? `<p>Discount: -₹${(
                    order.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    ) - order.total
                  ).toFixed(2)}</p>`
                : ""
            }
            <p>Shipping: Free</p>
            <p class="grand-total">Total: ₹${order.total.toFixed(2)}</p>
          </div>

          <div class="packing-instructions">
            <strong>Packing Instructions:</strong><br>
            Please pack all items carefully and ensure they match the quantities listed above.<br>
            Double-check the order details before shipping.
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
    </div>
      </body>
    </html>
  `;
}

const sendOrderEmails = async (order) => {
  try {
    console.log("Starting sendOrderEmails function");
    console.log("Order data:", JSON.stringify(order, null, 2));

    // Load and validate settings first
    const settings = await readData("settings.json");
    console.log("Email settings loaded:", {
      smtpHost: settings?.email?.smtpHost,
      smtpPort: settings?.email?.smtpPort,
      fromEmail: settings?.email?.fromEmail,
      fromName: settings?.email?.fromName,
      hasSmtpUser: !!settings?.email?.smtpUser,
      hasSmtpPass: !!settings?.email?.smtpPass,
    });

    if (
      !settings?.email?.smtpHost ||
      !settings?.email?.smtpPort ||
      !settings?.email?.smtpUser ||
      !settings?.email?.smtpPass ||
      !settings?.email?.fromEmail ||
      !settings?.email?.fromName
    ) {
      console.error("Incomplete email settings");
      throw new Error("Email settings not properly configured");
    }

    // Validate order data
    if (!order) {
      throw new Error("No order data provided");
    }

    const transporter = await getTransporter();
    console.log("Transporter created successfully");

    // Test SMTP connection
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP connection verification failed:", verifyError);
      throw verifyError;
    }

    // Always send store notification
    const storeMailOptions = {
      from: `"${settings.email.fromName}" <${settings.email.fromEmail}>`,
      to: settings.email.smtpUser,
      subject: `New Order Received - ${order.id}`,
      html: generatePackingSlip(order),
    };

    console.log("Attempting to send store email with options:", {
      from: storeMailOptions.from,
      to: storeMailOptions.to,
      subject: storeMailOptions.subject,
    });

    try {
      await transporter.sendMail(storeMailOptions);
      console.log("Store packing slip email sent successfully");
    } catch (storeEmailError) {
      console.error("Failed to send store email:", storeEmailError);
      throw storeEmailError;
    }

    // Only attempt to send customer email if we have their email address
    if (order.shippingAddress?.email) {
      const customerMailOptions = {
        from: `"${settings.email.fromName}" <${settings.email.fromEmail}>`,
        to: order.shippingAddress.email,
        subject: `Order Confirmation - ${order.id}`,
        html: generateOrderConfirmationEmail(order),
      };

      console.log("Attempting to send customer email with options:", {
        from: customerMailOptions.from,
        to: customerMailOptions.to,
        subject: customerMailOptions.subject,
      });

      try {
        await transporter.sendMail(customerMailOptions);
        console.log("Customer confirmation email sent successfully");
      } catch (customerEmailError) {
        console.error("Failed to send customer email:", customerEmailError);
        // Don't throw error for customer email failure
      }
    } else {
      console.log(
        "No customer email address found, skipping customer notification"
      );
    }

    return {
      success: true,
      storeEmail: settings.email.smtpUser,
      customerEmail: order.shippingAddress?.email || null,
    };
  } catch (error) {
    console.error("Error in sendOrderEmails:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
};

module.exports = {
  sendOrderEmails,
  sendContactFormEmail,
};
