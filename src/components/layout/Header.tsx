import React, { useState, useEffect, useRef } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Button, 
  IconButton, 
  Badge,
  Container,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Collapse,
  Grid,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useNavigate } from 'react-router-dom'
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../contexts/AuthContext"
import { useCategories } from '../../contexts/CategoryContext'
import { MEDIA_BASE_URL } from '../../config'
import { motion } from 'framer-motion'
import type { Product } from '../../types'

const menuItems = {
  'SAREES': {
    'By Occasion': [
      'Summer Sarees',
      'Wedding Sarees',
      'Engagement Sarees',
      'Reception Sarees',
      'Haldi Sarees',
      'Festive Sarees',
      'Party Wear Sarees'
    ],
    'By Type': [
      'Floral Sarees',
      'Pastel Sarees',
      'Sequins Sarees',
      'Stonework Sarees',
      'Printed Sarees',
      'Heavy Sarees'
    ],
    'By Material': [
      'Silk Sarees',
      'Organza Sarees',
      'Satin sarees',
      'Banarasi Sarees',
      'Net Sarees',
      'Crepe Sarees'
    ],
    'Explore': [
      'New Arrivals',
      'Best Sellers',
      'Featured Products',
      'Special Offers'
    ]
  },
  'All Products': {}
};

const Header: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMenu, setSelectedMenu] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { totalItems } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('customerToken')
    }

    checkLoginStatus()
    window.addEventListener('storage', checkLoginStatus)
    return () => window.removeEventListener('storage', checkLoginStatus)
  }, [])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menu: string) => {
    if (menu !== 'profile') {
      setAnchorEl(event.currentTarget)
      setSelectedMenu(menu)
    }
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget)
    setSelectedMenu('profile')
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedMenu('')
    setMobileMenuAnchor(null)
  }

  const handleItemClick = (item: string) => {
    if (item === 'All Products') {
      navigate('/products')
      handleMenuClose()
      return
    }
    
    if (item === 'New Arrivals') {
      navigate('/products?filter=new')
    } else if (item === 'Best Sellers') {
      navigate('/products?filter=bestsellers')
    } else if (item === 'Featured Products') {
      navigate('/products?filter=featured')
    } else if (item === 'Special Offers') {
      navigate('/products?filter=offers')
    } else if (item.includes('Sarees')) {
      const categoryMap: { [key: string]: string } = {
        'Silk Sarees': '1',
        'Cotton Sarees': '2',
        'Banarasi Sarees': '3',
        'Chiffon Sarees': '4',
        'Georgette Sarees': '5',
        'Kanjivaram Sarees': '6',
        'Organza Sarees': '7',
        'Tussar Sarees': '8',
        'Crepe Sarees': '9',
        'Net Sarees': '10'
      }

      const categoryId = categoryMap[item]

      if (categoryId) {
        navigate(`/category/${categoryId}`)
      } else {
        const matchingCategory = Object.keys(categoryMap).find(key => 
          item.toLowerCase().includes(key.toLowerCase())
        )
        if (matchingCategory) {
          navigate(`/category/${categoryMap[matchingCategory]}`)
        } else {
          navigate('/products')
        }
      }
    }
    handleMenuClose()
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/')
  }

  const handleCustomerPanel = () => {
    handleMenuClose()
    navigate('/customer/orders')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')[0][0]
      .toUpperCase()
  }

  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      PaperProps={{
        sx: {
          width: '80%',
          maxWidth: 300,
          backgroundColor: '#fff',
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#333' }}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {Object.entries(menuItems).map(([category, subCategories]) => (
          <React.Fragment key={category}>
            <ListItem 
              component="button"
              onClick={() => {
                if (category === 'All Products') {
                  navigate('/products')
                  setDrawerOpen(false)
                } else {
                  setSelectedMenu(selectedMenu === category ? '' : category)
                }
              }}
              sx={{
                backgroundColor: selectedMenu === category ? 'rgba(227, 28, 121, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(227, 28, 121, 0.12)'
                }
              }}
            >
              <ListItemText 
                primary={category}
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: 600,
                    color: selectedMenu === category ? '#E31C79' : '#333',
                    fontFamily: 'Montserrat, sans-serif'
                  }
                }}
              />
              {category !== 'All Products' && (
                <KeyboardArrowRightIcon 
                  sx={{ 
                    transform: selectedMenu === category ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    color: selectedMenu === category ? '#E31C79' : '#666'
                  }}
                />
              )}
            </ListItem>
            {category !== 'All Products' && selectedMenu === category && (
              <List sx={{ pl: 4, bgcolor: 'transparent' }}>
                {Object.entries(subCategories).map(([subCategory, items]) => (
                  <React.Fragment key={subCategory}>
                    <ListItem>
                      <ListItemText 
                        primary={subCategory}
                        primaryTypographyProps={{
                          sx: { 
                            fontWeight: 500,
                            color: '#E31C79',
                            fontSize: '0.9rem',
                            fontFamily: 'Montserrat, sans-serif'
                          }
                        }}
                      />
                    </ListItem>
                    {items.map((item) => (
                      <ListItem 
                        key={item}
                        component="button"
                        onClick={() => {
                          handleItemClick(item)
                          setTimeout(() => {
                            setDrawerOpen(false)
                          }, 300)
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(227, 28, 121, 0.08)'
                          }
                        }}
                      >
                        <ListItemText 
                          primary={item}
                          primaryTypographyProps={{
                            sx: { 
                              color: '#666',
                              fontSize: '0.9rem',
                              fontFamily: 'Montserrat, sans-serif',
                              '&:hover': {
                                color: '#E31C79'
                              }
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </React.Fragment>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem 
              component="button"
              onClick={handleCustomerPanel}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(227, 28, 121, 0.08)'
                }
              }}
            >
              <ListItemText 
                primary="Customer Panel"
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }
                }}
              />
            </ListItem>
            <ListItem 
              component="button"
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(227, 28, 121, 0.08)'
                }
              }}
            >
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }
                }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  )

  const renderProfileMenu = () => {
   
    
    return (
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
        {isAuthenticated ? [
          <MenuItem key="customer-panel" onClick={handleCustomerPanel}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Customer Panel
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        ] : [
          <MenuItem key="login" onClick={() => navigate('/login')}>
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            Login
          </MenuItem>,
          <MenuItem key="register" onClick={() => navigate('/register')}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            Register
          </MenuItem>
        ]}
      </Menu>
    );
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #eee',
          height: '80px'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar 
            sx={{ 
              justifyContent: 'space-between',
              height: '100%',
              minHeight: '80px !important',
              py: 0
            }}
          >
            {/* Logo with hover animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Box
                component="img"
                src={`${MEDIA_BASE_URL}/images/logo.png`}
                alt="Sree Sathyabhama Silks"
                sx={{ 
                  height: 50,
                  width: 'auto',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/')}
              />
            </motion.div>

            {/* Menu Items */}
            {isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton 
                    edge="start" 
                    color="inherit" 
                    aria-label="cart" 
                    onClick={() => navigate('/cart')}
                    sx={{ 
                      color: '#E31C79',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Badge 
                      badgeContent={totalItems} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          transition: 'all 0.3s ease',
                        }
                      }}
                    >
                      <ShoppingCartIcon sx={{ width: 24, height: 24 }} />
                    </Badge>
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleDrawerToggle}
                    sx={{ 
                      color: '#333', 
                      ml: 1,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <MenuIcon sx={{ width: 24, height: 24 }} />
                  </IconButton>
                </motion.div>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2,
                  position: 'relative',
                  flex: 1,
                  justifyContent: 'center', alignItems: 'center'
                }}
              >
                {Object.keys(menuItems).map((category) => (
                  <motion.div
                    key={category}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      color="inherit"
                      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                        if (category !== 'All Products') {
                          handleMenuOpen(e, category)
                        }
                      }}
                      onClick={() => {
                        if (category === 'All Products') {
                          navigate('/products')
                        }
                      }}
                      sx={{ 
                        color: '#333',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        px: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: '#E31C79',
                          bgcolor: 'transparent'
                        }
                      }}
                      endIcon={category !== 'All Products' ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <motion.div
                            animate={{ rotate: Boolean(anchorEl) && selectedMenu === category ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transformOrigin: 'center',
                              width: 24,
                              height: 24
                            }}
                          >
                            <KeyboardArrowDownIcon sx={{ display: 'block', width: '100%', height: '100%' }} />
                          </motion.div>
                        </Box>
                      ) : null}
                    >
                      {category}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            )}

            {/* Cart and User Icons - Only show on desktop */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton 
                    edge="start" 
                    color="inherit" 
                    aria-label="cart" 
                    onClick={() => navigate('/cart')}
                    sx={{ 
                      color: '#E31C79',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Badge 
                      badgeContent={totalItems} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          transition: 'all 0.3s ease',
                        }
                      }}
                    >
                      <ShoppingCartIcon sx={{ width: 24, height: 24 }} />
                    </Badge>
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{
                      backgroundColor: isAuthenticated ? '#E31C79' : 'transparent',
                      color: isAuthenticated ? 'white' : '#333',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: isAuthenticated ? '#FF4D4D' : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    {isAuthenticated && user ? getInitials(user.name) : <PersonIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                </motion.div>
                {renderProfileMenu()}
              </Box>
            )}
          </Toolbar>
        </Container>

        {/* Mega Menu for Desktop with animation */}
        {!isMobile && selectedMenu && selectedMenu !== 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Collapse in={Boolean(anchorEl)} timeout={300}>
              <Box 
                sx={{ 
                  position: 'absolute',
                  width: '100%',
                  bgcolor: 'white',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  py: 3,
                  mt: 0,
                  borderTop: '1px solid #eee'
                }}
                onMouseEnter={() => setAnchorEl(anchorEl)}
                onMouseLeave={handleMenuClose}
              >
                <Container maxWidth={false}>
                  <Grid container spacing={4}>
                    {Object.entries(menuItems[selectedMenu as keyof typeof menuItems] || {}).map(([subCategory, items]) => (
                      <Grid item xs={3} key={subCategory}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2,
                            color: '#333',
                            fontFamily: 'Montserrat, sans-serif'
                          }}
                        >
                          {subCategory}
                        </Typography>
                        {(items as string[]).map((item) => (
                          <motion.div
                            key={item}
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Typography
                              sx={{ 
                                py: 0.5,
                                fontSize: '14px',
                                color: '#666',
                                cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  color: '#E31C79'
                                }
                              }}
                              onClick={() => handleItemClick(item)}
                            >
                              {item}
                            </Typography>
                          </motion.div>
                        ))}
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Box>
            </Collapse>
          </motion.div>
        )}

        {/* Mobile Drawer with animation */}
        {isMobile && (
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            PaperProps={{
              sx: {
                width: '80%',
                maxWidth: 360,
                transition: 'transform 0.3s ease-in-out'
              }
            }}
          >
            <MobileDrawer />
          </Drawer>
        )}
      </AppBar>
    </motion.div>
  )
}

export default Header;  