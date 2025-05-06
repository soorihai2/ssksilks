import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { customerApi } from '../../services/api/customerApi';
import { toast } from 'react-toastify';

interface TrackingInfo {
  orderId: string;
  status: string;
  courier: string;
  trackingId: string;
  lastUpdated: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  history: Array<{
    status: string;
    location: string;
    timestamp: string;
  }>;
}

const CustomerTrackOrders: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchTrackingInfo(orderId);
    }
  }, [orderId]);

  const fetchTrackingInfo = async (orderId: string) => {
    try {
      const data = await customerApi.trackOrder(orderId);
      setTrackingInfo(data);
    } catch (error: any) {
      setError('Failed to fetch tracking information');
      toast.error('Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'out for delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !trackingInfo) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Tracking information not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/orders')}
          sx={{ bgcolor: '#E31C79', '&:hover': { bgcolor: '#C41E3A' } }}
        >
          Back to Orders
        </Button>
      </Container>
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
            Track Order
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/orders')}
            sx={{ color: '#E31C79', borderColor: '#E31C79' }}
          >
            Back to Orders
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Typography variant="subtitle1" gutterBottom>
                Order Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Order ID: {trackingInfo.orderId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Courier: {trackingInfo.courier}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tracking ID: {trackingInfo.trackingId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated: {new Date(trackingInfo.lastUpdated).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Stepper activeStep={getStatusStep(trackingInfo.status)} orientation="vertical">
              <Step>
                <StepLabel>Order Placed</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Your order has been successfully placed
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Processing</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Your order is being processed
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Shipped</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Your order has been shipped
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Out for Delivery</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Your order is out for delivery
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Delivered</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Your order has been delivered
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Grid>

          {trackingInfo.history && trackingInfo.history.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Tracking History
              </Typography>
              <Box sx={{ mt: 2 }}>
                {trackingInfo.history.map((event, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {event.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default CustomerTrackOrders; 