import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import HomeIcon from '@mui/icons-material/Home'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { customerApi } from '../../services/api/customerApi'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import type { AuthResponse, ApiResponse } from '../../types/api'
import { authApi } from '../../services/api'

const UserLogin: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginType, setLoginType] = useState<'email' | 'phone' | 'admin'>('email')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    username: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow numbers and limit to 10 digits
      const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: phoneNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (loginType === 'admin') {
        // Handle admin login
        if (formData.username === 'admin') {
          localStorage.setItem('adminAuth', 'true');
          toast.success('Admin login successful!');
          navigate('/admin/dashboard');
          return;
        } else {
          throw new Error('Invalid admin credentials');
        }
      }

      // Handle customer login
      const response = await customerApi.login({
        email: loginType === 'email' ? formData.email : undefined,
        phone: loginType === 'phone' ? formData.phone : undefined,
        password: formData.password
      });

      console.log('Login response:', response); // Debug log

      if (response.success && response.data) {
        const { token, customer } = response.data;
        
        // Set user data in auth context
        login({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        });

        // Store additional data
        localStorage.setItem('customerEmail', customer.email);
        localStorage.setItem('customerPhone', customer.phone);

        toast.success('Login successful! Welcome back ' + customer.name);
        
        // Get the return URL from localStorage or use default
        const returnUrl = localStorage.getItem('returnUrl') || '/';
        localStorage.removeItem('returnUrl'); // Clear the return URL
        
        // Navigate to the appropriate page
        if (returnUrl.startsWith('/checkout')) {
          navigate('/checkout');
        } else if (returnUrl === '/') {
          navigate('/customer/orders');
        } else {
          navigate(returnUrl);
        }
      } else {
        console.error('Login failed:', response.error);
        setError(response.error || 'Login failed. Please check your credentials.');
        toast.error(response.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      await customerApi.resetPassword(formData.email);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#E31C79',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Login
          </Typography>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              color: '#E31C79',
              '&:hover': {
                backgroundColor: 'rgba(227, 28, 121, 0.04)'
              }
            }}
          >
            Home
          </Button>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={loginType}
            exclusive
            onChange={(e, newValue) => {
              if (newValue) {
                setLoginType(newValue);
                setFormData({
                  email: '',
                  phone: '',
                  password: '',
                  username: ''
                });
                setError('');
              }
            }}
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontFamily: 'Montserrat, sans-serif',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(227, 28, 121, 0.04)',
                  color: '#E31C79',
                },
              },
            }}
          >
            <ToggleButton value="email">
              <EmailIcon sx={{ mr: 1 }} />
              Email
            </ToggleButton>
            <ToggleButton value="phone">
              <PhoneIcon sx={{ mr: 1 }} />
              Phone
            </ToggleButton>
            <ToggleButton value="admin">
              <AdminPanelSettingsIcon sx={{ mr: 1 }} />
              Admin
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {loginType === 'email' ? (
            <TextField
              fullWidth
              id="login-email"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
              sx={{ mb: 2 }}
            />
          ) : loginType === 'phone' ? (
            <TextField
              fullWidth
              id="login-phone"
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              placeholder="Enter 10-digit mobile number"
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="tel"
              inputProps={{
                pattern: "[0-9]*",
                maxLength: 10,
                inputMode: "numeric"
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
          ) : (
            <TextField
              fullWidth
              id="login-username"
              label="Admin Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="username"
              sx={{ mb: 2 }}
            />
          )}
          
          {loginType !== 'admin' && (
            <TextField
              fullWidth
              id="login-password"
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (loginType === 'admin' ? 'Login as Admin' : 'Login')}
          </Button>
        </form>

        {loginType !== 'admin' && (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#E31C79', textDecoration: 'none' }}>
                  Sign up
                </Link>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                onClick={handlePasswordReset}
                disabled={loading}
                sx={{ 
                  color: '#E31C79',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(227, 28, 121, 0.04)',
                  },
                }}
              >
                Forgot password?
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default UserLogin 