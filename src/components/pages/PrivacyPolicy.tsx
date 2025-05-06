import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Privacy Policy
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information that you provide directly to us, including:<br />
            • Name and contact information<br />
            • Billing and shipping addresses<br />
            • Payment information<br />
            • Order history<br />
            • Email communications
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:<br />
            • Process your orders and payments<br />
            • Send you order confirmations and updates<br />
            • Communicate with you about products and services<br />
            • Improve our website and customer service<br />
            • Comply with legal obligations
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell or rent your personal information to third parties. We may share your information with:<br />
            • Service providers who assist in our operations<br />
            • Payment processors<br />
            • Shipping partners<br />
            • Law enforcement when required by law
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Cookies and Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar tracking technologies to:<br />
            • Remember your preferences<br />
            • Analyze website traffic<br />
            • Improve user experience<br />
            • Provide personalized content
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:<br />
            • Access your personal information<br />
            • Correct inaccurate data<br />
            • Request deletion of your data<br />
            • Opt-out of marketing communications<br />
            • Export your data
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at:<br />
            Email: studioktexdesign@gmail.com<br />
            Phone: +91-94407 53583<br />
            Address: #38/5, Minchin Bazaar, Kurnool, Andhra Pradesh- 518001
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy; 