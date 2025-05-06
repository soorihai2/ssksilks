import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { orderApi } from '../../services/api';

interface OrderDetails {
  orderId: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  orderType?: 'pos' | 'online';
  type?: 'pos';
  customerInfo?: {
    name: string;
    phone?: string;
    email?: string;
  };
  customer?: {
    id?: string;
    phone: string;
    name?: string;
    isNew?: boolean;
  };
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getById(orderId || '');
        setOrderDetails(data);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !orderDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error || 'Order not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Order Information</Typography>
            <Typography>Order ID: {orderDetails.orderId}</Typography>
            <Typography>Order Date: {formatDate(orderDetails.orderDate)}</Typography>
            <Typography>Status: {orderDetails.status}</Typography>
            <Typography>Payment Status: {orderDetails.paymentStatus}</Typography>
            <Typography>Payment Method: {orderDetails.paymentMethod}</Typography>
            <Typography>Order Type: {(orderDetails.orderType === 'pos' || orderDetails.type === 'pos') ? 'POS' : 'Online'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Customer Information</Typography>
            {orderDetails.shippingAddress ? (
              <>
                <Typography>{orderDetails.shippingAddress.fullName}</Typography>
                <Typography>{orderDetails.shippingAddress.address}</Typography>
                <Typography>
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.pincode}
                </Typography>
                <Typography>{orderDetails.shippingAddress.country}</Typography>
                <Typography>Phone: {orderDetails.shippingAddress.phone}</Typography>
                <Typography>Email: {orderDetails.shippingAddress.email}</Typography>
              </>
            ) : (orderDetails.customerInfo || orderDetails.customer) ? (
              <>
                <Typography>Name: {orderDetails.customerInfo?.name || orderDetails.customer?.name || 'Walk-in Customer'}</Typography>
                <Typography>Phone: {orderDetails.customer?.phone || orderDetails.customerInfo?.phone || 'N/A'}</Typography>
                {orderDetails.customerInfo?.email && 
                  <Typography>Email: {orderDetails.customerInfo.email}</Typography>
                }
              </>
            ) : (
              <>
                <Typography>Walk-in Customer</Typography>
                {(orderDetails.orderType === 'pos' || orderDetails.type === 'pos') && 
                  <Typography>Phone: N/A</Typography>
                }
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderDetails.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <strong>Total Amount:</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>₹{orderDetails.total.toFixed(2)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrderDetailsPage; 