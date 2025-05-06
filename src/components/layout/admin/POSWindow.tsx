import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Autocomplete,
  keyframes,
  styled,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { orderApi } from '../../../services/api';
import { customerApi } from '../../../services/api/customerApi';
import { productApi } from '../../../services/api';
import { posCustomerApi, POSCustomer } from '../../../services/api/posCustomerApi';
import { toast } from 'react-toastify';

// Animation keyframes
const scanAnimation = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const StyledScannerLine = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #E31C79 50%, transparent);
  animation: ${scanAnimation} 1.5s infinite;
  pointer-events: none;
  z-index: 1;
  box-shadow: 0 0 10px rgba(227, 28, 121, 0.5);
`;

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  images?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface POSOrder {
  id: string;
  orderNumber: string;
  customer: POSCustomer;
  items: CartItem[];
  total: number;
  paymentMode: string;
  status: 'completed';
  createdAt: string;
  type: 'pos';
  discountPercentage?: string;
  cashDiscount?: string;
}

interface InvoiceItem {
  product: {
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  items: InvoiceItem[];
  total: number;
  paymentMode: string;
  createdAt: string;
}

interface POSWindowProps {
  open: boolean;
  onClose: () => void;
}

const POSWindow: React.FC<POSWindowProps> = ({ open, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<POSOrder | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posCustomers, setPosCustomers] = useState<POSCustomer[]>([]);
  const [phoneSearchResults, setPhoneSearchResults] = useState<POSCustomer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    customer: false,
    cart: false,
    paymentMode: false
  });
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [cashDiscount, setCashDiscount] = useState('');
  const [cartTotal, setCartTotal] = useState(0);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Fetch products when the POS window opens
  useEffect(() => {
    const fetchProducts = async () => {
      if (open) {
        setIsLoadingProducts(true);
        try {
          const response = await productApi.getAll();
          setProducts(response);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };

    fetchProducts();
  }, [open]);

  // Fetch POS customers when component mounts
  useEffect(() => {
    const fetchPosCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const customers = await posCustomerApi.getAll();
        setPosCustomers(customers);
      } catch (error) {
        console.error('Error fetching POS customers:', error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    if (open) {
      fetchPosCustomers();
    }
  }, [open]);

  // Calculate cart total whenever cart changes
  useEffect(() => {
    const calculateTotal = () => {
      const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const discountAmount = discountPercentage ? (total * Number(discountPercentage)) / 100 : 0;
      const cashDiscountAmount = cashDiscount ? Number(cashDiscount) : 0;
      setCartTotal(total - discountAmount - cashDiscountAmount);
    };

    calculateTotal();
  }, [cart, discountPercentage, cashDiscount, setCartTotal]);

  // Generate POS order number (YYYYMM + sequential number)
  const generateOrderNumber = () => {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `POS${yearMonth}${randomNum}`;
  };

  // Handle barcode scan
  const handleBarcodeScan = (sku: string) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      handleAddToCart(product);
    }
  };

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Update customer data after successful order
  const updateCustomerData = async (customer: POSCustomer, orderTotal: number) => {
    if (customer.id) {
      try {
        const updatedCustomer = await posCustomerApi.update(customer.id, {
          totalOrders: (customer.totalOrders || 0) + 1,
          totalSpent: (customer.totalSpent || 0) + orderTotal,
          isNew: false
        });
        
        if (updatedCustomer) {
          // Update the posCustomers state
          setPosCustomers(prev => 
            prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
          );
          
          // Update the selected customer if it's the same customer
          if (selectedCustomer?.id === updatedCustomer.id) {
            setSelectedCustomer(updatedCustomer);
          }
        }
      } catch (error) {
        console.error('Error updating customer data:', error);
      }
    }
  };

  const handleCheckout = async () => {
    // Reset validation errors
    setValidationErrors({
      customer: !selectedCustomer && !phoneNumber,
      cart: cart.length === 0,
      paymentMode: !paymentMode
    });

    // Check for validation errors
    if ((!selectedCustomer && !phoneNumber) || cart.length === 0 || !paymentMode) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create order data
      const orderData = {
        customerId: selectedCustomer?.id,
        customer: {
          id: selectedCustomer?.id,
          phone: selectedCustomer?.phone || phoneNumber,
          name: selectedCustomer?.name || 'Walk-in Customer',
          isNew: selectedCustomer?.isNew || true
        },
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name
        })),
        total: cartTotal,
        paymentMode,
        discountPercentage,
        cashDiscount,
        status: 'completed',
        type: 'pos',
        orderType: 'pos'
      };

      // Create order
      const order = await orderApi.createPOSOrder(orderData);

      // Update customer data
      if (selectedCustomer?.id) {
        await updateCustomerData(selectedCustomer, cartTotal);
      }

      // Show success message
      toast.success('Order placed successfully!');
      
      // Store order data for invoice
      const invoiceData = {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customer: {
          name: selectedCustomer?.name || 'Walk-in Customer',
          phone: selectedCustomer?.phone || phoneNumber || ''
        },
        items: cart.map(item => ({
          product: {
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity
        })),
        total: cartTotal,
        paymentMode,
        discountPercentage: discountPercentage || '0',
        cashDiscount: cashDiscount || '0'
      };
      
      // Store the invoice data in localStorage
      localStorage.setItem('currentInvoiceData', JSON.stringify(invoiceData));
      
      // Store POS state for debugging
      const posState = {
        timestamp: new Date().toISOString(),
        customer: selectedCustomer,
        cart: cart,
        paymentMode,
        discountPercentage,
        cashDiscount,
        cartTotal
      };
      localStorage.setItem('lastPOSState', JSON.stringify(posState));
      
      // Wait a moment to ensure localStorage is updated
      setTimeout(() => {
        // Open invoice in new window
        const invoiceWindow = window.open('/invoice', '_blank');
        
        // Reset form
        setCart([]);
        setSelectedCustomer(null);
        setPhoneNumber('');
        setPaymentMode('');
        setDiscountPercentage('');
        setCashDiscount('');
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.sku && product.sku.toLowerCase().includes(searchLower))
    );
  });

  // Handle phone number input with real-time search
  const handlePhoneNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      
      if (value.length >= 1) {
        setIsSearching(true);
        try {
          const filteredCustomers = (posCustomers || []).filter(customer => 
            customer?.phone?.startsWith(value)
          );
          setPhoneSearchResults(filteredCustomers);

          const exactMatch = filteredCustomers.find(c => c.phone === value);
          if (exactMatch) {
            // Check if customer has any orders based on totalOrders
            const hasOrders = (exactMatch.totalOrders || 0) > 0;
            
            setSelectedCustomer({
              ...exactMatch,
              isNew: !hasOrders
            });
            setPhoneNumber(exactMatch.phone);
            setPhoneSearchResults([]);
          } else {
            setSelectedCustomer(null);
          }
        } catch (error) {
          console.error('Error searching customers:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPhoneSearchResults([]);
        setSelectedCustomer(null);
      }
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    if (typeof customer === 'string') {
      const newCustomer: POSCustomer = {
        id: '',
        name: 'Walk-in Customer',
        phone: customer,
        isNew: true,
        totalOrders: 0,
        totalSpent: 0
      };
      setSelectedCustomer(newCustomer);
    } else if (customer) {
      setSelectedCustomer({
        id: customer.id,
        name: customer.name || 'Walk-in Customer',
        phone: customer.phone || '',
        isNew: customer.isNew || false,
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0
      });
    } else {
      setSelectedCustomer(null);
    }
    setPhoneNumber(customer?.phone || '');
    setShowCustomerDialog(false);
    setValidationErrors(prev => ({ ...prev, customer: false }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 'auto',
            maxHeight: '85vh',
            background: 'linear-gradient(135deg, #FFE4E1 0%, #FFB6C1 100%)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            fontFamily: 'Roboto, sans-serif'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(227, 28, 121, 0.1)',
          py: 1.5
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <CartIcon sx={{ color: '#E31C79' }} />
              <Typography variant="h5" sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>
                Point of Sale
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: '#E31C79' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, marginTop: '16px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, position: 'relative' }}>
                    <Box position="relative" sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Search Products (Name or SKU)"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SearchIcon sx={{ color: '#E31C79' }} />
                            </Box>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.9)',
                            '&:hover fieldset': {
                              borderColor: '#E31C79',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 400
                          }
                        }}
                      />
                      {!searchTerm && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                        >
                          <StyledScannerLine />
                        </Box>
                      )}
                    </Box>
                    {isLoadingProducts ? (
                      <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <List dense>
                        {filteredProducts.slice(0, 4).map(product => (
                          <ListItem
                            key={product.id}
                            onClick={() => handleAddToCart(product)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'rgba(227, 28, 121, 0.04)'
                              }
                            }}
                          >
                            <ListItemText
                              primary={product.name}
                              secondary={`SKU: ${product.sku || 'N/A'} | ₹${product.price.toLocaleString()} | Stock: ${product.stock}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>
                                <AddIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                        {filteredProducts.length === 0 && (
                          <ListItem>
                            <ListItemText
                              primary="No products found"
                              secondary="Try a different search term"
                            />
                          </ListItem>
                        )}
                        {filteredProducts.length > 4 && (
                          <ListItem>
                            <ListItemText
                              primary={`Showing 4 of ${filteredProducts.length} results`}
                              secondary="Refine your search to see more specific results"
                              sx={{
                                color: 'text.secondary',
                                fontStyle: 'italic'
                              }}
                            />
                          </ListItem>
                        )}
                      </List>
                    )}
                  </Paper>
                </Grid>

                {/* Customer Section */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, border: validationErrors.customer ? '2px solid #ff1744' : 'none' }}>
                    <Typography variant="h6" gutterBottom>
                      Customer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Autocomplete
                        freeSolo
                        options={phoneSearchResults || []}
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') return option;
                          return option?.phone || '';
                        }}
                        value={selectedCustomer}
                        onChange={(_, newValue) => {
                          if (typeof newValue === 'string') {
                            const newCustomer: POSCustomer = {
                              id: '',
                              name: 'Walk-in Customer',
                              phone: newValue,
                              isNew: true,
                              totalOrders: 0,
                              totalSpent: 0
                            };
                            handleCustomerSelect(newCustomer);
                          } else {
                            handleCustomerSelect(newValue as POSCustomer | null);
                          }
                          setValidationErrors(prev => ({ ...prev, customer: false }));
                        }}
                        inputValue={phoneNumber}
                        onInputChange={(_, newInputValue) => {
                          const numericValue = newInputValue.replace(/\D/g, '');
                          if (numericValue.length <= 10) {
                            setPhoneNumber(numericValue);
                            handlePhoneNumberChange({ target: { value: numericValue } } as React.ChangeEvent<HTMLInputElement>);
                          }
                        }}
                        sx={{ width: '100%' }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Phone Number"
                            placeholder="Enter 10-digit mobile number"
                            error={validationErrors.customer}
                            helperText={validationErrors.customer ? "Please select or enter a customer" : ""}
                            inputProps={{
                              ...params.inputProps,
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              maxLength: 10
                            }}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isSearching && <CircularProgress size={20} />}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => {
                          const { key, ...otherProps } = props;
                          return (
                            <li key={key} {...otherProps}>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1" sx={{ fontFamily: 'Roboto', fontWeight: 500 }}>
                                  {option?.name || 'Walk-in Customer'}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Roboto', color: 'text.secondary' }}>
                                  {option?.phone}
                                </Typography>
                                {option?.totalOrders && option.totalOrders > 0 && (
                                  <Typography variant="caption" sx={{ fontFamily: 'Roboto', color: 'text.secondary' }}>
                                    {option.totalOrders} orders | ₹{option.totalSpent?.toLocaleString()}
                                  </Typography>
                                )}
                              </Box>
                            </li>
                          );
                        }}
                      />
                      {selectedCustomer && (
                        <Chip
                          label={selectedCustomer.isNew ? "New Customer" : "Existing Customer"}
                          color={selectedCustomer.isNew ? "primary" : "default"}
                          size="small"
                        />
                      )}
                    </Box>
                    {selectedCustomer && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Total Orders: {selectedCustomer.totalOrders || 0} | Total Spent: ₹{(selectedCustomer.totalSpent || 0).toLocaleString()}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Payment Section */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, border: validationErrors.paymentMode ? '2px solid #ff1744' : 'none' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PaymentIcon sx={{ color: '#E31C79' }} />
                      <Typography variant="h6">Payment</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <FormControl 
                          fullWidth 
                          error={validationErrors.paymentMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(227, 28, 121, 0.04)',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E31C79',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E31C79',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#E31C79',
                            },
                            '& .MuiSelect-icon': {
                              color: '#E31C79',
                            }
                          }}
                        >
                          <InputLabel>Payment Mode</InputLabel>
                          <Select
                            value={paymentMode}
                            onChange={(e) => {
                              setPaymentMode(e.target.value);
                              setValidationErrors(prev => ({ ...prev, paymentMode: false }));
                            }}
                            label="Payment Mode"
                          >
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="upi">UPI</MenuItem>
                          </Select>
                          {validationErrors.paymentMode && (
                            <Typography variant="caption" color="error">
                              Please select a payment mode
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Discount %"
                          type="number"
                          value={discountPercentage}
                          placeholder="Enter % (max 20%)"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (Number(value) >= 0 && Number(value) <= 20)) {
                              setDiscountPercentage(value);
                            }
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          inputProps={{
                            min: 0,
                            max: 20,
                            step: 1
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(76, 175, 80, 0.04)',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4CAF50',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4CAF50',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#4CAF50',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Cash Discount"
                          type="number"
                          value={cashDiscount}
                          placeholder="Enter amount (max ₹500)"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (Number(value) >= 0 && Number(value) <= 500)) {
                              setCashDiscount(value);
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          inputProps={{
                            min: 0,
                            max: 500,
                            step: 1
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(33, 150, 243, 0.04)',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#2196F3',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#2196F3',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#2196F3',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Right side - Cart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', border: validationErrors.cart ? '2px solid #ff1744' : 'none' }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CartIcon sx={{ color: '#E31C79' }} />
                  <Typography variant="h6">Cart</Typography>
                </Box>
                {validationErrors.cart && (
                  <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                    Please add at least one product to the cart
                  </Typography>
                )}
                <List dense>
                  {cart.map(item => (
                    <ListItem key={item.product.id}>
                      <ListItemText
                        primary={item.product.name}
                        secondary={
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontFamily: 'Roboto',
                              fontWeight: 500
                            }}
                          >
                            ₹{item.product.price.toLocaleString()} x {item.quantity}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '2px solid',
                              borderImage: 'linear-gradient(45deg, #E31C79, #FF8E53) 1',
                              borderRadius: '4px',
                              padding: '2px'
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.product.id, item.quantity - 1); }}
                              sx={{
                                padding: '4px',
                                minWidth: '32px',
                                height: '32px'
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: '#E31C79',
                                minWidth: '24px',
                                textAlign: 'center',
                                mx: 1
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              sx={{
                                padding: '4px',
                                minWidth: '32px',
                                height: '32px'
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': {
                                backgroundColor: 'rgba(227, 28, 121, 0.04)'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" sx={{ fontFamily: 'Roboto', fontWeight: 500 }}>Total</Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#E31C79',
                      fontFamily: 'Roboto',
                      fontWeight: 700
                    }}
                  >
                    ₹{cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  sx={{
                    background: 'linear-gradient(45deg, #E31C79 30%, #FF8E53 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF8E53 30%, #E31C79 90%)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <ReceiptIcon />
                      Checkout
                    </Box>
                  )}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Roboto',
                fontWeight: 700,
                letterSpacing: '0.5px',
                fontSize: '1.5rem'
              }}
            >
              Invoice
            </Typography>
            <IconButton onClick={() => setInvoiceOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentOrder && (
            <Box sx={{ fontFamily: 'Roboto' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Roboto',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  fontSize: '1.2rem',
                  mb: 1
                }} 
              >
                Order #{currentOrder.orderNumber}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'Roboto',
                  fontWeight: 400,
                  color: 'text.secondary',
                  mb: 1
                }} 
              >
                Date: {new Date(currentOrder.createdAt).toLocaleString()}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'Roboto',
                  fontWeight: 500,
                  mb: 2
                }} 
              >
                Customer: {currentOrder?.customer?.phone || 'N/A'}
                {currentOrder?.customer?.isNew && (
                  <Chip
                    label="New"
                    color="primary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {currentOrder?.items?.map((item, index) => (
                  <ListItem key={item?.product?.id || `item-${index}`}>
                    <ListItemText
                      primary={
                        <Typography sx={{ 
                          fontFamily: 'Roboto',
                          fontWeight: 500,
                          fontSize: '1rem'
                        }}>
                          {item?.product?.name || 'Unknown Product'}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          sx={{ 
                            fontFamily: 'Roboto',
                            fontWeight: 400,
                            color: 'text.secondary',
                            fontSize: '0.9rem'
                          }}
                        >
                          {item?.quantity || 0} x ₹{item?.product?.price?.toLocaleString() || '0'}
                        </Typography>
                      }
                    />
                    <Typography 
                      sx={{ 
                        fontFamily: 'Roboto',
                        fontWeight: 600,
                        color: '#E31C79',
                        fontSize: '1.1rem'
                      }}
                    >
                      ₹{((item?.product?.price || 0) * (item?.quantity || 0)).toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Roboto',
                      fontWeight: 500,
                      color: 'text.secondary',
                      fontSize: '1rem'
                    }}
                  >
                    Subtotal
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Roboto',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    ₹{currentOrder?.items?.reduce((sum, item) => 
                      sum + ((item?.product?.price || 0) * (item?.quantity || 0)), 0).toLocaleString()}
                  </Typography>
                </Box>
                {currentOrder.discountPercentage && (
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Roboto',
                        fontWeight: 500,
                        color: 'text.secondary',
                        fontSize: '1rem'
                      }}
                    >
                      Discount ({currentOrder.discountPercentage}%)
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Roboto',
                        fontWeight: 600,
                        color: '#4CAF50',
                        fontSize: '1.1rem'
                      }}
                    >
                      -₹{(currentOrder.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * (Number(currentOrder.discountPercentage) / 100)).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {currentOrder.cashDiscount && (
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Roboto',
                        fontWeight: 500,
                        color: 'text.secondary',
                        fontSize: '1rem'
                      }}
                    >
                      Cash Discount
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Roboto',
                        fontWeight: 600,
                        color: '#2196F3',
                        fontSize: '1.1rem'
                      }}
                    >
                      -₹{Number(currentOrder.cashDiscount).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto',
                    fontWeight: 700,
                    fontSize: '1.2rem'
                  }}
                >
                  Total
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto',
                    fontWeight: 700,
                    color: '#E31C79',
                    fontSize: '1.3rem'
                  }}
                >
                  ₹{currentOrder.total.toLocaleString()}
                </Typography>
              </Box>
              <Typography 
                sx={{ 
                  fontFamily: 'Roboto',
                  fontWeight: 500,
                  color: 'text.secondary',
                  mt: 2,
                  fontSize: '1rem'
                }}
              >
                Payment Mode: <span style={{ 
                  fontFamily: 'Roboto',
                  fontWeight: 600, 
                  color: 'text.primary' 
                }}>
                  {currentOrder.paymentMode}
                </span>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            variant="contained"
            sx={{
              fontFamily: 'Roboto',
              fontWeight: 500,
              fontSize: '1rem'
            }}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default POSWindow; 