import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const ShippingPolicy: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Shipping Policy
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Delivery Time
          </Typography>
          <Typography variant="body1" paragraph>
            We process all orders within 24-48 hours of receiving them. Delivery time varies based on your location:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
            <li>Within Kurnool: 1-2 business days</li>
            <li>Other cities in Andhra Pradesh: 2-3 business days</li>
            <li>Other states in India: 3-5 business days</li>
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Shipping Methods
          </Typography>
          <Typography variant="body1" paragraph>
            We use reliable courier services to ensure safe and timely delivery of your orders. All shipments are fully insured and tracked.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Shipping Charges
          </Typography>
          <Typography variant="body1" paragraph>
            • Free shipping on orders above ₹5000<br />
            • Standard shipping charges apply for orders below ₹5000<br />
            • Express delivery available at additional cost
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Order Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            Once your order is shipped, you will receive a tracking number via email and SMS. You can use this number to track your order's status on our website or the courier service's website.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            International Shipping
          </Typography>
          <Typography variant="body1" paragraph>
            Currently, we only ship within India. International shipping services will be available soon.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Delivery Address
          </Typography>
          <Typography variant="body1" paragraph>
            Please ensure that your delivery address is complete and accurate. We are not responsible for delays caused by incorrect addresses or recipient unavailability.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShippingPolicy; 