import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  ShoppingCart as CartIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';

interface LocationState {
  orderId: string;
  error: string;
  amount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  isTest?: boolean;
}

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const handleRetryPayment = () => {
    if (state?.isTest) {
      navigate('/cart');
    } else {
      navigate('/cart');
    }
  };

  // If no state is passed, show a simple error message with navigation options
  if (!state) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: '#E31C79', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: '#1a1f36', fontFamily: 'Playfair Display, serif' }}>
            Payment Failed
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            We couldn't process your payment. Please try again or contact support if the problem persists.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<CartIcon />}
              onClick={() => navigate('/cart')}
              sx={{
                bgcolor: '#E31C79',
                '&:hover': { bgcolor: '#d41a6b' }
              }}
            >
              Return to Cart
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderColor: '#E31C79',
                color: '#E31C79',
                '&:hover': {
                  borderColor: '#d41a6b',
                  bgcolor: 'rgba(227, 28, 121, 0.04)'
                }
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const formattedAmount = useMemo(() => state.amount.toLocaleString(), [state.amount]);
  const formattedAddress = useMemo(() => 
    `${state.shippingAddress.address}, ${state.shippingAddress.city}, ${state.shippingAddress.state} - ${state.shippingAddress.pincode}`,
    [state.shippingAddress]
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: '#E31C79', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: '#1a1f36', fontFamily: 'Playfair Display, serif' }}>
            Payment Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 2, mx: 'auto', maxWidth: 'fit-content' }}>
            {state.error}
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon /> Order Details
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Order ID"
                  secondary={state.orderId}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PaymentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Total Amount"
                  secondary={`₹${formattedAmount}`}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShippingIcon /> Shipping Details
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary={state.shippingAddress.fullName}
                  secondary={`${state.shippingAddress.email} | ${state.shippingAddress.phone}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  secondary={formattedAddress}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Items in Order
          </Typography>
          <List>
            {state.items.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.name}
                  secondary={`Quantity: ${item.quantity}`}
                />
                <Chip 
                  label={`₹${(item.price * item.quantity).toLocaleString()}`}
                  sx={{ ml: 2 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PaymentIcon />}
              onClick={handleRetryPayment}
              sx={{
                bgcolor: '#E31C79',
                '&:hover': { bgcolor: '#d41a6b' },
                mb: { xs: 2, sm: 0 }
              }}
            >
              Retry Payment
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CartIcon />}
              onClick={() => navigate('/cart')}
              sx={{
                borderColor: '#E31C79',
                color: '#E31C79',
                '&:hover': {
                  borderColor: '#d41a6b',
                  bgcolor: 'rgba(227, 28, 121, 0.04)'
                },
                mb: { xs: 2, sm: 0 }
              }}
            >
              Return to Cart
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderColor: '#E31C79',
                color: '#E31C79',
                '&:hover': {
                  borderColor: '#d41a6b',
                  bgcolor: 'rgba(227, 28, 121, 0.04)'
                }
              }}
            >
              Continue Shopping
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team at support@sreesathyabhamasilks.com
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please quote your Order ID: {state.orderId} in all correspondence
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentFailure; 