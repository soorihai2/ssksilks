import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const RefundPolicy: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Refund Policy
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Return Period
          </Typography>
          <Typography variant="body1" paragraph>
            We offer a 7-day return window from the date of delivery for all our products. The item must be unworn, unwashed, and in its original packaging with all tags attached.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Return Process
          </Typography>
          <Typography variant="body1" paragraph>
            1. Log in to your account and go to your order history<br />
            2. Select the order you want to return<br />
            3. Choose the items you want to return and provide a reason<br />
            4. Print the return label and packing slip<br />
            5. Pack the items securely in their original packaging<br />
            6. Drop off the package at any authorized courier center
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Refund Process
          </Typography>
          <Typography variant="body1" paragraph>
            • Once we receive and inspect your return, we will process the refund within 5-7 business days<br />
            • The refund will be issued to the original payment method<br />
            • You will receive an email confirmation when the refund is processed<br />
            • The refund amount will reflect in your account within 5-10 business days, depending on your bank
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Non-Returnable Items
          </Typography>
          <Typography variant="body1" paragraph>
            The following items cannot be returned:<br />
            • Customized or personalized items<br />
            • Items marked as "Final Sale"<br />
            • Items damaged due to customer misuse<br />
            • Items without original tags and packaging
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Exchange Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We offer size/color exchanges for eligible items. The exchange process follows the same steps as returns, but you can select the new size/color during the process.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Damaged Items
          </Typography>
          <Typography variant="body1" paragraph>
            If you receive a damaged item, please contact our customer service within 48 hours of delivery. Include photos of the damage, and we will arrange for a replacement or refund.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RefundPolicy; 