import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { customerApi, Order as CustomerOrder } from '../../../services/api/customerApi';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Order extends CustomerOrder {
  trackingId?: string;
  orderNumber: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [trackingInfo, setTrackingInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentStep = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1,
    }[status] || 0;

    return { steps, currentStep };
  };

  const handleTrackOrder = async (orderId: string) => {
    try {
      const tracking = await customerApi.trackOrder(orderId);
      setTrackingInfo(prev => ({
        ...prev,
        [orderId]: tracking
      }));
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: '#1a1f36'
          }}
        >
          My Orders
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
          sx={{
            color: '#E31C79',
            '&:hover': {
              backgroundColor: 'rgba(227, 28, 121, 0.04)',
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontFamily: 'Montserrat, sans-serif',
              '&.Mui-selected': {
                color: '#E31C79',
              },
            },
          }}
        >
          <Tab label="All Orders" />
          <Tab label="Active Orders" />
          <Tab label="Past Orders" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Order #{order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Placed on {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => window.location.href = `/customer/orders/${order.id}`}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.productId}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: 40, height: 40, objectFit: 'cover' }}
                                  />
                                  {item.name}
                                </Box>
                              </TableCell>
                              <TableCell align="right">₹{item.price.toLocaleString()}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="h6">
                        Total: ₹{order.total.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {order && ('trackingId' in order) && order.trackingId && (
                          <Button
                            startIcon={<ShippingIcon />}
                            onClick={() => handleTrackOrder(order.id)}
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: '#E31C79',
                              color: '#E31C79',
                              '&:hover': {
                                borderColor: '#E31C79',
                                backgroundColor: 'rgba(227, 28, 121, 0.04)',
                              },
                            }}
                          >
                            Track Order
                          </Button>
                        )}
                        <Button
                          startIcon={<ReceiptIcon />}
                          variant="outlined"
                          size="small"
                          onClick={() => window.location.href = `/customer/orders/${order.id}`}
                          sx={{
                            borderColor: '#E31C79',
                            color: '#E31C79',
                            '&:hover': {
                              borderColor: '#E31C79',
                              backgroundColor: 'rgba(227, 28, 121, 0.04)',
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>

                    {trackingInfo[order.id] && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Tracking Information
                        </Typography>
                        <Stepper activeStep={getStatusSteps(order.status).currentStep} alternativeLabel>
                          {getStatusSteps(order.status).steps.map((label) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Current Location: {trackingInfo[order.id].location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last Updated: {formatDate(trackingInfo[order.id].timestamp)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Courier Service: {trackingInfo[order.id].courierService}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tracking ID: {trackingInfo[order.id].trackingId}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {orders
              .filter(order => ['pending', 'processing', 'shipped'].includes(order.status))
              .map((order) => (
                // Same order card component as above
                <Grid item xs={12} key={order.id}>
                  {/* ... Order card content ... */}
                </Grid>
              ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {orders
              .filter(order => ['delivered', 'cancelled'].includes(order.status))
              .map((order) => (
                // Same order card component as above
                <Grid item xs={12} key={order.id}>
                  {/* ... Order card content ... */}
                </Grid>
              ))}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Orders; 