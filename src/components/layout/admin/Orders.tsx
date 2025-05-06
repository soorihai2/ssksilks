import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  TextField
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material'
import { orderApi } from '../../../services/api'

interface OrderItem {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  shippingAddress: string | {
    fullName: string
    address: string
    city: string
    state: string
    pincode: string
    country: string
    email: string
  }
  customer?: {
    id?: string
    phone: string
    name?: string
    isNew?: boolean
  }
  createdAt: string
  updatedAt: string
  orderType?: 'pos' | 'online'
  type?: 'pos'
}

const getShippingAddress = (order: Order) => {
  if (typeof order.shippingAddress === 'string') {
    try {
      return JSON.parse(order.shippingAddress);
    } catch (e) {
      console.error('Error parsing shipping address:', e);
      return {
        fullName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        email: ''
      };
    }
  }
  return order.shippingAddress;
};

const getCustomerInfo = (order: any) => {
  if (order.type === 'pos' || order.orderType === 'pos') {
    return (
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {order.customer?.name || 'Walk-in Customer'}
        </Typography>
        {order.customer?.phone && (
          <Typography variant="body2" color="text.secondary">
            {order.customer.phone}
          </Typography>
        )}
        {order.customer?.totalOrders > 0 && !order.customer?.isNew && (
          <Typography variant="body2" color="text.secondary">
            Total Orders: {order.customer.totalOrders}
          </Typography>
        )}
      </Box>
    );
  }

  // For online orders
  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress;

  return (
    <Box>
      <Typography variant="body2" fontWeight={500}>
        {shippingAddress?.fullName || 'Unknown Customer'}
      </Typography>
      {shippingAddress?.phone && (
        <Typography variant="body2" color="text.secondary">
          {shippingAddress.phone}
        </Typography>
      )}
      {shippingAddress?.email && (
        <Typography variant="body2" color="text.secondary">
          {shippingAddress.email}
        </Typography>
      )}
    </Box>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Filter orders based on search term
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Special keywords for type filtering
    const isSearchingPOS = searchLower.includes('pos') || searchLower.includes('offline');
    const isSearchingOnline = searchLower.includes('online') || searchLower.includes('web');
    const isSearchingGuest = searchLower.includes('guest') || searchLower.includes('walk-in') || searchLower.includes('walkin');
    
    // Special keywords for status filtering
    const isSearchingPending = searchLower.includes('pending');
    const isSearchingProcessing = searchLower.includes('processing');
    const isSearchingShipped = searchLower.includes('shipped');
    const isSearchingDelivered = searchLower.includes('delivered');
    const isSearchingCancelled = searchLower.includes('cancelled') || searchLower.includes('canceled');

    // Payment status keywords
    const isSearchingPaid = searchLower.includes('paid') || searchLower.includes('completed');
    const isSearchingUnpaid = searchLower.includes('unpaid') || searchLower.includes('pending payment');

    const filtered = orders.filter(order => {
      // Type-based filtering
      if (isSearchingPOS && !(order.type === 'pos' || order.orderType === 'pos')) return false;
      if (isSearchingOnline && (order.type === 'pos' || order.orderType === 'pos')) return false;
      
      // Status-based filtering
      if (isSearchingPending && order.status !== 'pending') return false;
      if (isSearchingProcessing && order.status !== 'processing') return false;
      if (isSearchingShipped && order.status !== 'shipped') return false;
      if (isSearchingDelivered && order.status !== 'delivered') return false;
      if (isSearchingCancelled && order.status !== 'cancelled') return false;

      // Payment status filtering
      if (isSearchingPaid && order.paymentStatus !== 'completed' && !(order.type === 'pos' || order.orderType === 'pos')) return false;
      if (isSearchingUnpaid && (order.paymentStatus === 'completed' || order.type === 'pos' || order.orderType === 'pos')) return false;

      // For POS orders
      if (order.type === 'pos' || order.orderType === 'pos') {
        const isGuest = !order.customer?.name || order.customer.name === 'Walk-in Customer';
        if (isSearchingGuest && !isGuest) return false;
        if (isGuest && !isSearchingGuest) {
          return (
            order.customer?.phone?.toLowerCase().includes(searchLower) ||
            order.id.toLowerCase().includes(searchLower) ||
            order.total.toString().includes(searchLower)
          );
        }
        return (
          order.customer?.phone?.toLowerCase().includes(searchLower) ||
          order.customer?.name?.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.total.toString().includes(searchLower)
        );
      }

      // For online orders
      const shippingAddress = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;

      return (
        shippingAddress?.fullName?.toLowerCase().includes(searchLower) ||
        shippingAddress?.email?.toLowerCase().includes(searchLower) ||
        shippingAddress?.phone?.toLowerCase().includes(searchLower) ||
        shippingAddress?.address?.toLowerCase().includes(searchLower) ||
        shippingAddress?.city?.toLowerCase().includes(searchLower) ||
        shippingAddress?.state?.toLowerCase().includes(searchLower) ||
        shippingAddress?.pincode?.includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.total.toString().includes(searchLower)
      );
    });
    
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderApi.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await orderApi.update(orderId, { status: newStatus });
      fetchOrders();
      showAlert('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Failed to update order status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'processing':
        return 'info'
      case 'shipped':
        return 'primary'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif' }}>
          Orders
        </Typography>
        <Box>
          <TextField
            placeholder="Search orders (type, status, customer details, etc.)"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 350 }}
            helperText={
              <Typography variant="caption" color="textSecondary">
                Keywords: pos, online, guest, pending, shipped, paid, etc.
              </Typography>
            }
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  {getCustomerInfo(order)}
                </TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  {(order.orderType === 'pos' || order.type === 'pos') ? (
                    <Chip
                      label="POS"
                      color="secondary"
                      size="small"
                      sx={{ bgcolor: '#E31C79' }}
                    />
                  ) : (
                    <Chip
                      label="Online"
                      color="primary"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={(order.orderType === 'pos' || order.type === 'pos') ? 'completed' : order.paymentStatus}
                    color={(order.orderType === 'pos' || order.type === 'pos' || order.paymentStatus === 'completed') ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewOrder(order)}
                    sx={{ color: '#E31C79' }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Order Information</Typography>
                  <Typography>Order ID: {selectedOrder.id}</Typography>
                  <Typography>Date: {formatDate(selectedOrder.createdAt)}</Typography>
                  <Typography>Status: {selectedOrder.status}</Typography>
                  <Typography>Payment Status: {selectedOrder.paymentStatus}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Customer Information</Typography>
                  {(selectedOrder.type === 'pos' || selectedOrder.orderType === 'pos') ? (
                    <>
                      <Typography>Name: {selectedOrder.customer?.name || 'Walk-in Customer'}</Typography>
                      <Typography>Phone: {selectedOrder.customer?.phone}</Typography>
                      {selectedOrder.customer?.totalOrders && !selectedOrder.customer.isNew && (
                        <>
                          <Typography>Total Orders: {selectedOrder.customer.totalOrders}</Typography>
                          <Typography>Total Spent: ₹{selectedOrder.customer.totalSpent?.toLocaleString()}</Typography>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography>Name: {selectedOrder.shippingAddress?.fullName || 'Unknown Customer'}</Typography>
                      {selectedOrder.shippingAddress?.phone && (
                        <Typography>Phone: {selectedOrder.shippingAddress.phone}</Typography>
                      )}
                      {selectedOrder.shippingAddress?.email && (
                        <Typography>Email: {selectedOrder.shippingAddress.email}</Typography>
                      )}
                      {selectedOrder.shippingAddress?.address && (
                        <Typography>
                          Address: {selectedOrder.shippingAddress.address}, 
                          {selectedOrder.shippingAddress.city}, 
                          {selectedOrder.shippingAddress.state}, 
                          {selectedOrder.shippingAddress.pincode}, 
                          {selectedOrder.shippingAddress.country}
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Order Items</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>Total Amount:</strong>
                          </TableCell>
                          <TableCell>
                            <strong>₹{selectedOrder.total.toFixed(2)}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                disabled={selectedOrder.status === 'processing' || isUpdating}
              >
                Mark as Processing
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                disabled={selectedOrder.status === 'shipped' || isUpdating}
              >
                Mark as Shipped
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                disabled={selectedOrder.status === 'delivered' || isUpdating}
              >
                Mark as Delivered
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Orders 