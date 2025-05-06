import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { customerApi } from '../../services/api/customerApi';
import { toast } from 'react-toastify';

interface Address {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  orderCount?: number;
  lastUsed?: string;
}

const CustomerAddresses: React.FC = () => {
  const [orderAddresses, setOrderAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddressesFromOrders();
  }, []);

  const fetchAddressesFromOrders = async () => {
    try {
      const orders = await customerApi.getOrders();
      const addressMap = new Map<string, Address>();

      // Process orders to get unique addresses
      orders.forEach((order: any) => {
        if (!order.shippingAddress) return;

        const address = order.shippingAddress;
        const addressKey = `${address.address}-${address.city}-${address.state}-${address.pincode}`;

        if (!addressMap.has(addressKey)) {
          addressMap.set(addressKey, {
            ...address,
            orderCount: 0,
            lastUsed: order.createdAt
          });
        }

        const existingAddress = addressMap.get(addressKey)!;
        existingAddress.orderCount = (existingAddress.orderCount ?? 0) + 1;
        if (!existingAddress.lastUsed || (new Date(order.createdAt) > new Date(existingAddress.lastUsed ?? ''))) {
          existingAddress.lastUsed = order.createdAt;
        }
      });

      // Convert map to array and sort by last used date
      const uniqueAddresses = Array.from(addressMap.values())
        .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime());

      setOrderAddresses(uniqueAddresses);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching order addresses:', error);
      toast.error('Failed to load order addresses');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#E31C79',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Order Addresses
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchAddressesFromOrders}
            sx={{ color: '#E31C79', borderColor: '#E31C79' }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {orderAddresses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No order addresses found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orderAddresses.map((address, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    position: 'relative',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {address.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.city}, {address.state} - {address.pincode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {address.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${address.orderCount} ${address.orderCount === 1 ? 'Order' : 'Orders'}`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Last used: {new Date(address.lastUsed!).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default CustomerAddresses; 