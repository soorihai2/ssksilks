import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  ShoppingBag as OrdersIcon,
  LocalShipping as TrackingIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LocationOn as AddressIcon,
  Lock as PasswordIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { customerApi, Customer } from '../../../services/api/customerApi';
import { toast } from 'react-toastify';

const drawerWidth = 280;

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customerName, setCustomerName] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const sessionTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  useEffect(() => {
    // Update last activity time on any user interaction
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    // Check session timeout every minute
    const checkSession = setInterval(() => {
      if (Date.now() - lastActivity > sessionTimeout) {
        handleLogout();
        toast.info('Session expired. Please login again.');
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(checkSession);
    };
  }, [lastActivity]);

  const fetchCustomerProfile = async () => {
    try {
      const profile = await customerApi.getProfile();
      setCustomer(profile);
      setCustomerName(profile.name);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerId');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Orders', icon: <OrdersIcon />, path: 'orders' },
    { text: 'Profile', icon: <PersonIcon />, path: 'profile' },
    { text: 'Addresses', icon: <AddressIcon />, path: 'addresses' },
    { text: 'Settings', icon: <SettingsIcon />, path: 'settings' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f8f9fa'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: theme.palette.primary.main,
            fontFamily: 'Playfair Display, serif'
          }}
        >
          {customer?.name?.[0] || 'C'}
        </Avatar>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#1a1f36',
              fontFamily: 'Playfair Display, serif'
            }}
          >
            {customer?.name || 'Customer'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            {customer?.email}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, bgcolor: 'rgba(0,0,0,0.06)' }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(`/customer/${item.path}`)}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'rgba(227, 28, 121, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#E31C79' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.9rem',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, bgcolor: 'rgba(0,0,0,0.06)' }} />

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: '#E31C79',
            '&:hover': {
              backgroundColor: 'rgba(227, 28, 121, 0.04)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              flexGrow: 1,
              color: '#333',
              fontFamily: 'Playfair Display, serif'
            }}
          >
            Customer Panel
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<StoreIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: '#E31C79',
                borderColor: '#E31C79',
                '&:hover': {
                  borderColor: '#E31C79',
                  backgroundColor: 'rgba(227, 28, 121, 0.04)',
                },
                textTransform: 'none',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Shop Now
            </Button>

            <IconButton
              onClick={handleMenuClick}
              sx={{ 
                color: '#333',
                '&:hover': {
                  backgroundColor: 'rgba(227, 28, 121, 0.04)',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: '#E31C79'
                }}
              >
                {customer?.name?.[0] || 'C'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: '1px solid rgba(0,0,0,0.06)',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: '1px solid rgba(0,0,0,0.06)',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: '#f8f9fa',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={() => { navigate('/customer/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/customer/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
} 