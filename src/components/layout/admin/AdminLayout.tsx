import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
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
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Paper,
  TextField,
  CssBaseline,
  Button,
  InputAdornment
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Category as CategoriesIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Inventory as ProductsIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  LocalOffer as OfferIcon,
  Warning as WarningIcon,
  PersonAdd as PersonAddIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import { useAuth } from '../../../contexts/AuthContext'
import { productApi, orderApi, categoryApi, posCustomerApi } from '../../../services/api'

const drawerWidth = 280

export default function AdminLayout() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(!isMobile)
  const [counts, setCounts] = useState({
    orders: 0,
    products: 0,
    categories: 0,
    customers: 0,
    totalStock: 0,
    lowStock: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [orders, products, categories, posCustomers] = await Promise.all([
          orderApi.getAll(),
          productApi.getAll(),
          categoryApi.getAll(),
          posCustomerApi.getAll()
        ]);

        // Get unique customers from orders
        const onlineCustomerEmails = new Set(
          orders
            .map((order: any) => order.shippingAddress?.email)
            .filter(Boolean)
        );

        // Get unique POS customers (excluding those who are also online customers)
        const uniquePosCustomers = posCustomers.filter(
          (posCustomer: any) => !onlineCustomerEmails.has(posCustomer.email)
        ).length;

        // Get low stock items (less than 10)
        const lowStock = products.filter((product: any) => product.stock < 10).length;

        // Calculate total stock
        const totalStock = products.reduce((acc: number, product: any) => acc + product.stock, 0);

        // Count successful orders (completed payment or POS orders)
        const successfulOrders = orders.filter((order: any) => 
          order.paymentStatus === 'completed' || order.type === 'pos'
        );

        setCounts({
          orders: successfulOrders.length,
          products: products.length,
          categories: categories.length,
          customers: onlineCustomerEmails.size + uniquePosCustomers,
          totalStock,
          lowStock
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  const isSelected = (path: string) => {
    if (path === 'dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    }
    return location.pathname === `/admin/${path}`
  }

  const handleNavigation = (path: string) => {
    if (path === 'login') {
      localStorage.removeItem('adminAuth')
      navigate('/login')
    } else {
      const cleanPath = path.replace('/admin/', '')
      navigate(`/admin/${cleanPath}`)
    }
    if (isMobile) {
      setOpen(false)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const [products, orders, categories, posCustomers] = await Promise.all([
        productApi.getAll(),
        orderApi.getAll(),
        categoryApi.getAll(),
        posCustomerApi.getAll()
      ])

      const searchLower = term.toLowerCase().trim();
      
      // Special keywords for filtering
      const isSearchingPOS = searchLower.includes('pos') || searchLower.includes('offline');
      const isSearchingOnline = searchLower.includes('online') || searchLower.includes('web');
      const isSearchingGuest = searchLower.includes('guest') || searchLower.includes('walk-in') || searchLower.includes('walkin');
      const isSearchingPending = searchLower.includes('pending');
      const isSearchingProcessing = searchLower.includes('processing');
      const isSearchingShipped = searchLower.includes('shipped');
      const isSearchingDelivered = searchLower.includes('delivered');
      const isSearchingCancelled = searchLower.includes('cancelled') || searchLower.includes('canceled');
      const isSearchingPaid = searchLower.includes('paid') || searchLower.includes('completed');
      const isSearchingUnpaid = searchLower.includes('unpaid') || searchLower.includes('pending payment');
      const isSearchingLowStock = searchLower.includes('low stock') || searchLower.includes('lowstock');
      const isSearchingOutOfStock = searchLower.includes('out of stock') || searchLower.includes('outofstock');

      // Filter orders based on keywords and search term
      const filteredOrders = orders.filter(order => {
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

      // Filter products with enhanced search
      const filteredProducts = products.filter(product => {
        if (isSearchingLowStock && product.stock >= 10) return false;
        if (isSearchingOutOfStock && product.stock === 0) return false;
        
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          (product.sku && product.sku.toLowerCase().includes(searchLower)) ||
          product.price.toString().includes(searchLower) ||
          product.stock.toString().includes(searchLower)
        );
      });

      const results = [
        ...filteredProducts.map(product => ({
          type: 'Product',
          name: product.name,
          id: product.id,
          path: '/admin/products',
          details: `Stock: ${product.stock} | Price: ₹${product.price}${product.stock < 10 ? ' | Low Stock' : ''}${product.stock === 0 ? ' | Out of Stock' : ''}`
        })),
        ...filteredOrders.map(order => ({
          type: 'Order',
          name: `Order #${order.id}`,
          id: order.id,
          path: '/admin/orders',
          details: `${order.type === 'pos' ? 'POS Order' : 'Online Order'} | ${order.status} | Total: ₹${order.total}`
        })),
        ...categories
          .filter(category => category.name.toLowerCase().includes(searchLower))
          .map(category => ({
            type: 'Category',
            name: category.name,
            id: category.id,
            path: '/admin/categories',
            details: `${products.filter(p => p.category === category.name).length} products`
          })),
        ...posCustomers
          .filter(customer => {
            if (isSearchingGuest && customer.name !== 'Walk-in Customer') return false;
            return (
              customer.name?.toLowerCase().includes(searchLower) ||
              customer.phone?.toLowerCase().includes(searchLower) ||
              (customer.email && customer.email.toLowerCase().includes(searchLower))
            );
          })
          .map(customer => ({
            type: 'Customer',
            name: customer.name || 'Walk-in Customer',
            id: customer.phone,
            phone: customer.phone,
            path: '/admin/customers',
            details: `Phone: ${customer.phone}${customer.totalOrders ? ` | Orders: ${customer.totalOrders}` : ''}`
          }))
      ];

      // Remove duplicates and sort by relevance
      const uniqueResults = results.filter((item, index, self) =>
        index === self.findIndex((t) => t.type === item.type && t.id === item.id)
      );

      setSearchResults(uniqueResults)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  const handleSearchResultClick = (result: any) => {
    // Close search
    setSearchTerm('')
    setSearchResults([])
    setShowSearchResults(false)

    // Navigate based on result type
    switch (result.type) {
      case 'Order':
        navigate(`/admin/orders?highlight=${result.id}`);
        break;
      case 'Product':
        navigate(`/admin/products?highlight=${result.id}`);
        break;
      case 'Category':
        navigate(`/admin/categories?highlight=${result.id}`);
        break;
      case 'Customer':
        navigate(`/admin/customers?highlight=${result.id}&phone=${result.phone}`);
        break;
      default:
        navigate(result.path);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/login')
  }

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard' },
    { 
      text: 'Products', 
      icon: <InventoryIcon />, 
      path: 'products',
      badge: counts.products,
      badgeColor: counts.lowStock > 0 ? 'error' : 'primary'
    },
    { 
      text: 'Categories', 
      icon: <CategoriesIcon />, 
      path: 'categories',
      badge: counts.categories,
      badgeColor: 'primary'
    },
    { 
      text: 'Orders', 
      icon: <OrdersIcon />, 
      path: 'orders',
      badge: counts.orders,
      badgeColor: 'primary'
    },
    { 
      text: 'Customers', 
      icon: <CustomersIcon />, 
      path: 'customers',
      badge: counts.customers,
      badgeColor: 'primary'
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: 'settings'
    }
  ]

  const bottomMenuItems = [
    { path: 'login', label: 'Logout', icon: <LogoutIcon /> }
  ]

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
          A
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: '#1a1f36',
            fontFamily: 'Playfair Display, serif'
          }}
        >
          Admin Panel
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, bgcolor: 'rgba(0,0,0,0.06)' }} />

      {/* Search Box */}
      <Box sx={{ p: 2 }}>
        <Paper
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'white',
            position: 'relative'
          }}
        >
          <SearchIcon sx={{ color: '#666' }} />
          <TextField
            fullWidth
            placeholder="Search orders, products, customers (try: pos, online, low stock, etc.)"
            variant="standard"
            size="small"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                '&:before': {
                  display: 'none'
                },
                '&:after': {
                  display: 'none'
                }
              }
            }}
          />
          {showSearchResults && searchResults.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                maxHeight: 300,
                overflow: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {searchResults.map((result) => (
                <ListItem
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchResultClick(result)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(227, 28, 121, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon>
                    {result.type === 'Product' && <InventoryIcon />}
                    {result.type === 'Order' && <OrdersIcon />}
                    {result.type === 'Category' && <CategoryIcon />}
                    {result.type === 'Customer' && <CustomersIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={result.name}
                    secondary={
                      <Box component="span">
                        <Typography variant="body2" color="text.secondary">
                          {result.details}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.type}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </Paper>
          )}
        </Paper>
      </Box>

      {/* Main Menu */}
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component="div"
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              cursor: 'pointer',
              bgcolor: isSelected(item.path) ? 'rgba(227, 28, 121, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: isSelected(item.path) 
                  ? 'rgba(227, 28, 121, 0.12)' 
                  : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isSelected(item.path) ? '#E31C79' : 'inherit',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                color: isSelected(item.path) ? '#E31C79' : 'inherit',
                '& .MuiTypography-root': {
                  fontWeight: isSelected(item.path) ? 600 : 400
                }
              }}
            />
            {item.badge && (
              <Badge 
                badgeContent={item.badge} 
                color={item.badgeColor === 'error' ? 'error' : 'primary'}
                max={999999}
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 3,
                    backgroundColor: item.badgeColor === 'error' ? '#E31C79' : '#1a1f36',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    padding: '0 4px',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '10px',
                  }
                }}
              />
            )}
          </ListItem>
        ))}
      </List>

      {/* Bottom Menu */}
      <Divider sx={{ mx: 2, bgcolor: 'rgba(0,0,0,0.06)' }} />
      <List sx={{ px: 2, pb: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              cursor: 'pointer',
              color: '#1a1f36',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                transform: 'translateX(5px)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ListItemIcon sx={{ 
              color: '#1a1f36',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#1a1f36',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
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
            sx={{ 
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            {location.pathname === '/admin' || location.pathname === '/admin/dashboard'
              ? 'Dashboard'
              : location.pathname.split("/").pop()?.charAt(0).toUpperCase() +
                (location.pathname.split("/").pop()?.slice(1) || '')}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar 
            onClick={(e) => setProfileAnchorEl(e.currentTarget)}
            sx={{ 
              bgcolor: theme.palette.primary.main,
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 }
            }}
          >
            A
          </Avatar>
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={() => setProfileAnchorEl(null)}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 0 20px rgba(0,0,0,0.04)'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: '#f8f9fa',
          minHeight: 'auto',
          display: 'block'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
} 