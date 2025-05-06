import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Link,
  InputAdornment
} from '@mui/material'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { orderApi } from '../services/api/orderApi'
import { customerApi } from '../services/api/customerApi'
import { productApi } from '../services/api'
import type { Product } from '../types'
import type { OrderDetails as EmailOrderDetails, OrderItem as EmailOrderItem } from '../services/api/emailApi'
import type { Offer, Settings } from '../services/api/settings'
import DeleteIcon from '@mui/icons-material/Delete'
import PaymentIcon from '@mui/icons-material/Payment'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { emailApi } from '../services/api/emailApi'
import { settingsApi } from '../services/api/settings'
import { toast } from 'react-toastify'
import Header from '../components/layout/Header'
import type { 
  AddressResponse, 
  ProductResponse, 
  OrderResponse, 
  ApiResponse,
  AuthResponse 
} from '../types/api'
import { API_BASE_URL } from '../config'
import { getImageUrl } from '../utils/imageUtils'
import { Link as RouterLink } from 'react-router-dom'
import EmailIcon from '@mui/icons-material/Email'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import axios, { AxiosResponse } from 'axios'
import type { PaymentVerificationResponse } from '../services/api/orderApi'

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface RazorpayOrderResponse {
  id: string;
  key: string;
  amount: number;
  razorpayOrderId: string;
}

interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface SavedAddress extends Address {
  id: string;
}

export interface CartPageProps {
  savedAddresses?: string[];
  setSavedAddresses?: (addresses: string[]) => void;
}

interface OrderDetails {
  id: string;
  items: CartItem[];
  total: number;
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
  status: string;
  paymentStatus: string;
  razorpayOrderId?: string;
}

interface ApiOrderResponse {
  id: string;
  key: string;
  amount: number;
  razorpayOrderId: string;
}

interface AddressValidation {
  fullName: boolean;
  email: boolean;
  phone: boolean;
  address: boolean;
  city: boolean;
  state: boolean;
  pincode: boolean;
  country: boolean;
}

interface CreateOrderResponse {
  razorpayOrderId: string;
  orderId: string;
  // Add other fields as needed
}

const CartPage: React.FC<CartPageProps> = ({ savedAddresses = [], setSavedAddresses }) => {
  const navigate = useNavigate()
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    clearCart,
    applyDiscount,
    discount,
    discountPercentage,
    discountApplied,
    activeOffer,
    setActiveOffer 
  } = useCart()
  const { user, isAuthenticated, setUser, setIsAuthenticated } = useAuth()
  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isNewAddress, setIsNewAddress] = useState(true)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [orderAddresses, setOrderAddresses] = useState<Address[]>([])
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<any>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orderResponse, setOrderResponse] = useState<RazorpayOrderResponse | null>(null);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [addressTouched, setAddressTouched] = useState<AddressValidation>({
    fullName: false,
    email: false,
    phone: false,
    address: false,
    city: false,
    state: false,
    pincode: false,
    country: false
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        fetchAddresses();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('customerToken');
      }
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    const token = localStorage.getItem('customerToken');
    if (isAuthenticated && user && token) {
      setIsLoadingAddresses(true);
      try {
        // Fetch saved addresses
        const savedAddrs = (await customerApi.getAddresses()) as SavedAddress[];
        
        // Fetch user's orders to get previous addresses
        const orders = await customerApi.getOrders();
        
        // Extract unique addresses from orders
        const uniqueOrderAddresses = orders.reduce((acc: Address[], order: any) => {
          if (order.shippingAddress) {
            const isDuplicate = acc.some(addr => 
              addr.address === order.shippingAddress.address &&
              addr.city === order.shippingAddress.city &&
              addr.pincode === order.shippingAddress.pincode
            );
            
            if (!isDuplicate) {
              acc.push({
                ...order.shippingAddress,
                id: `order-${order.id}`,
              });
            }
          }
          return acc;
        }, []);
        
        // Combine saved and order addresses
        const allAddresses = [...savedAddrs, ...uniqueOrderAddresses];
        
        if (setSavedAddresses) {
          setSavedAddresses(savedAddrs.map((addr: SavedAddress) => addr.id));
        }
        setOrderAddresses(uniqueOrderAddresses);
        
        if (allAddresses.length > 0) {
          setIsNewAddress(false);
          setSelectedAddressId(allAddresses[0].id);
          setAddress({
            fullName: allAddresses[0].fullName || user.name || '',
            email: allAddresses[0].email || user.email || '',
            phone: allAddresses[0].phone || user.phone || '',
            address: allAddresses[0].address || '',
            city: allAddresses[0].city || '',
            state: allAddresses[0].state || '',
            pincode: allAddresses[0].pincode || '',
            country: allAddresses[0].country || 'India',
          });
        } else {
          setIsNewAddress(true);
          setAddress({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
          });
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
        setIsNewAddress(true);
      } finally {
        setIsLoadingAddresses(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const fetchOffers = async () => {
      try {
        const settings = await settingsApi.getSettings();
        if (settings?.offers) {
          setAvailableOffers(settings.offers);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setAvailableOffers([]);
      }
    };
    fetchOffers();

    // Load saved addresses and order addresses if user is logged in
    fetchAddresses();

    // Fetch suggested products
    const fetchSuggestedProducts = async () => {
      try {
        const allProducts = await productApi.getAll() as Product[];
        // Filter out products that are already in cart
        const filteredProducts = allProducts.filter(
          (product: Product) => !items.some(item => item.id === product.id)
        );
        // Get random 4 products
        const randomProducts = filteredProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setSuggestedProducts(randomProducts);
      } catch (error) {
        console.error('Error fetching suggested products:', error);
      }
    };
    fetchSuggestedProducts();

    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated, user, items]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const truncatedValue = digitsOnly.slice(0, 10);
      setAddress({
        ...address,
        [name]: truncatedValue
      });
    } else {
      setAddress({
        ...address,
        [name]: value
      });
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Form validation
      if (!address.fullName || !address.email || !address.phone || !address.address) {
        toast.error('Please fill in all required shipping information.');
        return;
      }

      // Get Razorpay key from payment settings
      let razorpayKeyId;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/settings`);
        const settings = response.data;
        razorpayKeyId = settings.payment?.razorpayKeyId;
        
        if (!razorpayKeyId) {
          throw new Error('Razorpay key not found');
        }
      } catch (error) {
        console.error('Failed to get payment settings:', error);
        setError('Unable to initialize payment gateway. Please try again later.');
        return;
      }

      // Generate a local order ID
      const localOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Create order data
      const orderData = {
        userId: isAuthenticated ? localStorage.getItem('customerId') : undefined,
        customerId: isAuthenticated ? localStorage.getItem('customerId') : undefined,
        orderId: localOrderId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalPrice,
        shippingAddress: {
          fullName: address.fullName,
          email: address.email,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country
        },
        status: 'pending',
        paymentStatus: 'pending',
        isGuestOrder: !isAuthenticated,
        guestDetails: !isAuthenticated ? {
          email: address.email,
          phone: address.phone,
          name: address.fullName
        } : undefined,
        orderDate: new Date().toISOString()
      };

      // Create order in backend
      const orderResponse = await orderApi.create(orderData);
      console.log('Order created:', orderResponse.data);

      // Store order details in localStorage for backup
      localStorage.setItem('lastOrderId', localOrderId);
      localStorage.setItem('lastOrderItems', JSON.stringify(items));
      localStorage.setItem('lastOrderAmount', totalPrice.toString());
      localStorage.setItem('lastOrderCustomer', JSON.stringify(address));
      localStorage.setItem('lastOrderDate', new Date().toISOString());

      // Calculate amount in paise
      const amountInPaise = Math.round(totalPrice * 100);

      // Configure Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Sathyabhama Silks',
        description: 'Purchase from Sathyabhama Silks',
        order_id: orderResponse.data.razorpayOrderId,
        handler: async function(response: any) {
          try {
            console.log('Payment success:', response);
            
            // Store payment ID
            const paymentId = response.razorpay_payment_id;
            
            // Create payment verification data
            const verificationData = {
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderResponse.data.razorpayOrderId,
              razorpay_signature: response.razorpay_signature || 'test_signature',
              orderId: localOrderId
            };

            try {
              // Verify payment
              const verificationResponse = await orderApi.verifyPayment(verificationData);
              console.log('Payment verified:', verificationResponse);

              if (verificationResponse.order) {
                // Clear cart and show success message
            clearCart();
                localStorage.removeItem('cart');
                
                // Show appropriate toast messages
                toast.success('Payment successful! Order has been placed.');
                
                // Show email status message if available
                if (verificationResponse.emailStatus) {
                  if (verificationResponse.emailStatus.success) {
                    toast.success('Order confirmation emails sent successfully!');
                  } else {
                    toast.warning('Order placed successfully, but there was an issue sending confirmation emails. Our team will contact you shortly.');
                  }
                }

                // Redirect to order confirmation with order details
                navigate(`/order-confirmation/${localOrderId}`, {
              state: {
                    order: verificationResponse.order,
                    paymentId: paymentId,
                    emailStatus: verificationResponse.emailStatus
                  }
                });
              } else {
                throw new Error('Payment verification failed');
              }

            } catch (verificationError: any) {
              console.error('Payment verification error:', verificationError);
              handlePaymentFailure(verificationError, localOrderId);
            }

          } catch (error: any) {
            console.error('Payment completion error:', error);
            handlePaymentFailure(error, localOrderId);
          }
        },
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        notes: {
          orderId: localOrderId,
          shippingAddress: JSON.stringify({
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country
          })
        },
        theme: {
          color: '#E31C79'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            handlePaymentFailure(
              new Error('Payment was cancelled'), 
              localOrderId
            );
          }
        }
      };

      // Initialize Razorpay
      const razorpay = new (window as any).Razorpay(options);

      // Handle payment failures
      razorpay.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        handlePaymentFailure(
          new Error(response.error?.description || 'Payment failed'),
          localOrderId
        );
      });

      razorpay.on('payment.error', function(response: any) {
        console.error('Payment error:', response);
        handlePaymentFailure(
          new Error(response.error?.description || 'Payment error occurred'),
          localOrderId
        );
      });

      // Open Razorpay modal
      razorpay.open();

    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Checkout failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
              setLoading(false);
    }
  };

  const handlePaymentFailure = (error: any, orderId: string) => {
    console.error('Payment failed:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
    setError(errorMessage);
    toast.error(errorMessage);
    
    // Navigate to failure page with details
    navigate('/payment-failure', {
      state: {
        orderId: orderId,
        error: errorMessage,
        amount: totalPrice,
        items: items,
        shippingAddress: address
      }
    });
  };

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const settings = await settingsApi.getSettings();
      const validCoupon = settings.offers?.find(
        (offer: Offer) => offer.coupon === couponCode && !offer.isAutomatic
      );
      
      if (validCoupon && validCoupon.discountPercentage) {
        applyDiscount(validCoupon.discountPercentage.toString());
        setActiveOffer(validCoupon);
        setCouponCode('');
        toast.success('Coupon applied successfully!');
      } else {
        setCouponError('Invalid coupon code');
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error applying coupon');
      toast.error('Error applying coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await customerApi.login({
        email: loginForm.email.trim(),
        password: loginForm.password
      });
      
      if (response.success && response.data) {
        // Store auth data
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerId', response.data.customer.id);
        localStorage.setItem('user', JSON.stringify(response.data.customer));
      
      // Update auth context
        setUser(response.data.customer);
        setIsAuthenticated(true);
        
        toast.success('Login successful');
        
        // Fetch addresses after successful login
      await fetchAddresses();
      } else {
        throw new Error(response.error || 'Invalid login response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Invalid email or password';
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    setLoginError(null); // Clear error when user types
  };

  // Add validation function
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validatePincode = (pincode: string) => {
    return /^[0-9]{6}$/.test(pincode);
  };

  const getAddressFieldError = (field: keyof AddressValidation): string => {
    if (!addressTouched[field]) return '';
    
    switch (field) {
      case 'email':
        return address.email && !validateEmail(address.email) 
          ? 'Please enter a valid email address'
          : '';
      case 'phone':
        return address.phone && !validatePhone(address.phone)
          ? 'Please enter a valid 10-digit phone number'
          : '';
      case 'pincode':
        return address.pincode && !validatePincode(address.pincode)
          ? 'Please enter a valid 6-digit PIN code'
          : '';
      case 'country':
        return '';  // Country is pre-filled and disabled
      default:
        return address[field] ? '' : 'This field is required';
    }
  };

  const handleAddressBlur = (field: keyof AddressValidation) => {
    setAddressTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Modify the existing renderAddressForm function
  const renderAddressForm = () => {
    return (
      <Box sx={{ position: 'relative' }}>
       
        
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address-fullName"
            name="fullName"
            label="Full Name"
            value={address.fullName}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('fullName')}
            error={!!getAddressFieldError('fullName')}
            helperText={getAddressFieldError('fullName')}
            required
            autoComplete="name"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address-email"
            name="email"
            label="Email"
            type="email"
            value={address.email}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('email')}
            error={!!getAddressFieldError('email')}
            helperText={getAddressFieldError('email')}
            required
            autoComplete="email"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address-phone"
            name="phone"
            label="Phone"
            value={address.phone}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('phone')}
            error={!!getAddressFieldError('phone')}
            helperText={getAddressFieldError('phone') || "Enter 10-digit mobile number"}
            required
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]*',
              inputMode: 'numeric'
            }}
            autoComplete="tel"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address-street"
            name="address"
            label="Address"
            multiline
            rows={3}
            value={address.address}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('address')}
            error={!!getAddressFieldError('address')}
            helperText={getAddressFieldError('address')}
            required
            autoComplete="street-address"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="address-city"
            name="city"
            label="City"
            value={address.city}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('city')}
            error={!!getAddressFieldError('city')}
            helperText={getAddressFieldError('city')}
            required
            autoComplete="address-level2"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="address-state"
            name="state"
            label="State"
            value={address.state}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('state')}
            error={!!getAddressFieldError('state')}
            helperText={getAddressFieldError('state')}
            required
            autoComplete="address-level1"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="address-pincode"
            name="pincode"
            label="PIN Code"
            value={address.pincode}
            onChange={handleAddressChange}
            onBlur={() => handleAddressBlur('pincode')}
            error={!!getAddressFieldError('pincode')}
            helperText={getAddressFieldError('pincode') || "Enter 6-digit PIN code"}
            required
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*',
              inputMode: 'numeric'
            }}
            autoComplete="postal-code"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="address-country"
            name="country"
            label="Country"
            value={address.country}
            onChange={handleAddressChange}
            disabled
            required
            autoComplete="country"
          />
        </Grid>
      </Grid>

        {isGuestCheckout && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              💡 Tip: Create an account to save your address and track your orders easily.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Add the renderAddressSelection function
  const renderAddressSelection = () => {
    if (!user) {
      return null;
    }

    return (
      <Box sx={{ mb: 3 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
            Select Delivery Address
          </FormLabel>
          <RadioGroup
            value={isNewAddress ? 'new' : selectedAddressId}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'new') {
                setIsNewAddress(true);
                setSelectedAddressId('');
                setAddress({
                  fullName: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  country: 'India',
                });
              } else {
                setIsNewAddress(false);
                setSelectedAddressId(value);
                const allAddresses = [...savedAddresses, ...orderAddresses];
                const selectedAddress = allAddresses.find(addr => 
                  typeof addr === 'object' && addr.id === value
                ) as Address;
                
                if (selectedAddress) {
                  setAddress({
                    fullName: selectedAddress.fullName || user.name || '',
                    email: selectedAddress.email || user.email || '',
                    phone: selectedAddress.phone || user.phone || '',
                    address: selectedAddress.address || '',
                    city: selectedAddress.city || '',
                    state: selectedAddress.state || '',
                    pincode: selectedAddress.pincode || '',
                    country: selectedAddress.country || 'India',
            });
          }
        }
            }}
          >
            <FormControlLabel
              value="new"
              control={<Radio />}
              label={
                <Typography sx={{ fontWeight: isNewAddress ? 600 : 400 }}>
                  Add New Address
                </Typography>
              }
            />
            
            {/* Saved Addresses Section */}
            {savedAddresses.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Saved Addresses
                </Typography>
                {savedAddresses.map((addr) => (
                  <FormControlLabel
                    key={addr}
                    value={addr}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">{addr}</Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}

            {/* Previous Order Addresses Section */}
            {orderAddresses.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Previously Used Addresses
                </Typography>
                {orderAddresses.map((addr) => (
                  <FormControlLabel
                    key={addr.id}
                    value={addr.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: selectedAddressId === addr.id ? 600 : 400 }}>
                          {addr.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {addr.address}, {addr.city}, {addr.state} {addr.pincode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {addr.phone}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}
          </RadioGroup>
        </FormControl>
      </Box>
    );
  };

  // Modify the guest checkout section
  const renderGuestCheckoutOption = () => (
    <Box sx={{ p: 4, mb: 4, borderRadius: 2, maxWidth: 400, mx: 'auto' }}>
      <Button
        fullWidth
        variant="contained"
        onClick={() => setIsGuestCheckout(true)}
        sx={{
          mb: 2,
          py: 1.5,
          background: 'linear-gradient(45deg, #FF4D4D 30%, #FF8E53 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF8E53 30%, #FF4D4D 90%)',
          }
        }}
      >
        Continue as Guest
      </Button>

      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Guest checkout allows you to:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            Complete your purchase without creating an account
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Receive order confirmation via email
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Track your order with order ID
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">OR</Typography>
      </Divider>

      {/* Login Form */}
      <Typography variant="h5" component="h2" gutterBottom align="center" 
        sx={{ 
          mb: 3,
          fontWeight: 600,
          background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}
      >
        Login for Faster Checkout
      </Typography>
      
      {loginError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loginError}
        </Alert>
      )}

      <form onSubmit={handleLoginSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={loginForm.email}
          onChange={handleLoginInputChange}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#E31C79',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#E31C79',
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#E31C79',
            }
          }}
        />
        
        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={loginForm.password}
          onChange={handleLoginInputChange}
          margin="normal"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#E31C79',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#E31C79',
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#E31C79',
            }
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loginLoading || !loginForm.email || !loginForm.password}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
            },
            '&.Mui-disabled': {
              background: '#f5f5f5',
              color: 'rgba(0, 0, 0, 0.26)'
            }
          }}
        >
          {loginLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Login'
          )}
        </Button>
      </form>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/signup"
            sx={{
              color: '#E31C79',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal - discount;

  if (!items || items.length === 0) {
    return (
      <Container>
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/products')}
            sx={{ mt: 2, alignSelf: 'center' }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontFamily: 'Playfair Display, serif' }}>
            Checkout
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Cart Section - Left Side */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Playfair Display, serif' }}>
                Order Summary
              </Typography>
              
              {/* Offers Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontFamily: 'Montserrat, sans-serif' }}>
                  Available Offers
                </Typography>
                
                {/* Manual Coupon Section */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Have a coupon code?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      error={!!couponError}
                      helperText={couponError}
                      disabled={discountApplied}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#E31C79',
                          },
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || discountApplied}
                      sx={{
                        borderColor: '#E31C79',
                        color: '#E31C79',
                        '&:hover': {
                          borderColor: '#E31C79',
                          backgroundColor: '#E31C79',
                          color: 'white',
                        },
                      }}
                    >
                      {couponLoading ? <CircularProgress size={24} /> : 'Apply'}
                    </Button>
                  </Box>
                </Box>

                {/* Automatic Offers Section */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Automatic Offers
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {availableOffers
                      .filter((offer: Offer) => offer.isAutomatic)
                      .map((offer: Offer, index) => {
                        const { minOrderValue, minItems, applicableCategories, applicableProducts } = offer.automaticSettings || {};
                        const conditions = [];
                        if (minOrderValue) conditions.push(`Order value ≥ ₹${minOrderValue}`);
                        if (minItems) conditions.push(`${minItems}+ items`);
                        if (applicableCategories?.length) conditions.push(`Selected categories`);
                        if (applicableProducts?.length) conditions.push(`Selected products`);

                        const isActive = activeOffer?.label === offer.label;
                        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

                        return (
                          <Paper
                            key={index}
                            sx={{
                              p: 2,
                              border: isActive ? '2px solid #E31C79' : '1px solid #e0e0e0',
                              backgroundColor: isActive ? 'rgba(227, 28, 121, 0.05)' : 'white',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {offer.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {offer.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {conditions.join(' • ')}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="subtitle2" 
                                color={isActive ? 'success.main' : 'text.secondary'}
                                sx={{ fontWeight: 600 }}
                              >
                                {offer.discountPercentage}% OFF
                              </Typography>
                            </Box>
                            {isActive && (
                              <Typography 
                                variant="caption" 
                                color="success.main" 
                                sx={{ display: 'block', mt: 1 }}
                              >
                                Applied! You saved ₹{discount.toLocaleString()}
                              </Typography>
                            )}
                          </Paper>
                        );
                      })}
                  </Box>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img
                              src={getImageUrl(item.image, 'products')}
                              alt={item.name}
                              style={{ width: 50, height: 50, objectFit: 'cover' }}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.src = getImageUrl(undefined, 'products');
                              }}
                            />
                            <Typography>{item.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ 
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 700,
                            color: 'primary.main'
                          }}>
                            ₹{item.price.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Typography>{item.quantity}</Typography>
                            <Button
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ 
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 700,
                            color: 'primary.main'
                          }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Subtotal</Typography>
                  <Typography>₹{subtotal.toLocaleString()}</Typography>
                </Box>
                {discountApplied && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="success.main">
                      {activeOffer?.label || 'Discount'} ({discountPercentage}% off)
                    </Typography>
                    <Typography color="success.main">
                      -₹{discount.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 700,
                      color: 'primary.main'
                    }}
                  >
                    ₹{finalTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Login/Shipping Section - Right Side */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Playfair Display, serif' }}>
                {isAuthenticated ? 'Shipping Details' : 'Checkout Options'}
                </Typography>
                
                {!isAuthenticated && !isGuestCheckout ? (
                  renderGuestCheckoutOption()
                ) : (
                  <>
                    {isGuestCheckout && !isAuthenticated ? (
                      <Box sx={{ maxWidth: 600, mx: 'auto', position: 'relative' }}>
                        <Button
                          startIcon={<ArrowBack />}
                          onClick={() => setIsGuestCheckout(false)}
                  sx={{
                            position: 'absolute',
                            top: -40,
                            left: 0,
                            color: '#E31C79',
                            mb: 3
                          }}
                        >
                          Back to Login
                        </Button>
                        <Typography 
                          variant="h6" 
                    sx={{ 
                      mb: 3,
                            mt: 4,
                            textAlign: 'center',
                            fontFamily: 'Playfair Display, serif'
                          }}
                        >
                          Guest Checkout
                  </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 4, textAlign: 'center' }}
                        >
                          Please fill in your shipping details to continue
                      </Typography>
                        {renderAddressForm()}
                    </Box>
                    ) : (
                      // Regular authenticated user flow
                      <>
              {isLoadingAddresses ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {renderAddressSelection()}
                            {isNewAddress && renderAddressForm()}
                          </>
                        )}
                      </>
                    )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Pay Now Button Section */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PaymentIcon />}
            onClick={handleCheckout}
            disabled={loading || items.length === 0 || (!isAuthenticated && !isGuestCheckout)}
            sx={{
              background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
              },
              minWidth: 200
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
          </Button>
        </Box>

        {/* You may also like section */}
        {items.length < 4 && suggestedProducts.length > 0 && (
          <Box 
            sx={{ 
              mt: 8,
              width: '100%',
              py: 6,
              px: 2,
              background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.5) 0%, rgba(255, 250, 250, 0.8) 100%)',
              borderRadius: 2,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(227, 28, 121, 0.3), transparent)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(227, 28, 121, 0.3), transparent)'
              }
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 6,
                fontFamily: 'Playfair Display, serif',
                textAlign: 'center',
                position: 'relative',
                color: '#E31C79',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #E31C79, transparent)'
                }
              }}
            >
              You May Also Like
            </Typography>
            <Grid container spacing={4}>
              {suggestedProducts.map((product) => (
                <Grid item xs={6} sm={6} md={3} key={product.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.4s ease',
                      background: 'white',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 28px rgba(227, 28, 121, 0.15)',
                        borderColor: 'transparent',
                        background: 'linear-gradient(135deg, #fff 0%, #fff5f7 100%)',
                        '& img': {
                          transform: 'scale(1.05)'
                        }
                      },
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        mb: 2,
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <img
                        src={getImageUrl(product.images[0], 'products')}
                        alt={product.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        fontFamily: 'Playfair Display, serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3em',
                        color: '#333',
                        fontWeight: 500,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#E31C79',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 700,
                        mt: 'auto',
                        textAlign: 'right',
                      }}
                    >
                      ₹{product.price.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
};

export default CartPage; 