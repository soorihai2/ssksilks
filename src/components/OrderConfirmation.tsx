import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Grid,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HomeIcon from '@mui/icons-material/Home';
import { orderApi } from '../services/api';
import { API_BASE_URL } from '../config';

interface OrderDetails {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  razorpayPaymentId?: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
}

const getImageUrl = (imagePath?: string, folder: string = 'products', placeholder: string = 'placeholder.jpg') => {
  if (!imagePath) {
    return `${API_BASE_URL}/images/${folder}/${placeholder}`;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(new RegExp(`^/images/${folder}/`), '');
  return `${API_BASE_URL}/images/${folder}/${cleanPath}`;
};

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order details from location state if available
  const orderFromState = location.state?.order;
  const paymentId = location.state?.paymentId;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // If we have order details in state, use those
        if (orderFromState) {
          setOrder(orderFromState);
          setLoading(false);
          return;
        }

        if (!id) {
          throw new Error('Order ID is missing');
        }

        // If the ID starts with 'order_', it's a local order ID
        const orderId = id.startsWith('order_') ? id : id;
        const data = await orderApi.getById(orderId);
        
        if (!data) {
          throw new Error('Order not found');
        }

        setOrder(data);
        console.log('Order details loaded:', data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, orderFromState]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4 }}>
          {error || 'Order not found'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Order Confirmed!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Thank you for your purchase. Your order has been successfully placed.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Typography>Order ID: {order.id}</Typography>
            {paymentId && (
              <Typography>Payment ID: {paymentId}</Typography>
            )}
            <Typography>Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
            <Typography>Status: {order.status}</Typography>
            <Typography>Payment Status: {order.paymentStatus}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Amount: ₹{order.total.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography>{order.shippingAddress.fullName}</Typography>
            <Typography>{order.shippingAddress.address}</Typography>
            <Typography>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </Typography>
            <Typography>{order.shippingAddress.country}</Typography>
            <Typography>Phone: {order.shippingAddress.phone}</Typography>
            <Typography>Email: {order.shippingAddress.email}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            {order.items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 16 }}
                />
                <Box>
                  <Typography variant="subtitle1">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<ShoppingBagIcon />}
            onClick={() => navigate('/products')}
            sx={{
              background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
              },
            }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              borderColor: '#E31C79',
              color: '#E31C79',
              '&:hover': {
                borderColor: '#FF4D4D',
                color: '#FF4D4D',
              },
            }}
          >
            Return Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation; 