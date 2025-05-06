import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Divider,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Rating,
  CardActions,
  Badge,
  Tooltip,
  Fade,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  LocalOffer as OfferIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from "../../contexts/CartContext";
import { CartItem } from "../../contexts/CartContext";
import { ProductCard } from "../shared/common/ProductCard";
import { Product } from '../../types/product';
import { productApi } from '../../services/api';
import type { ProductResponse, ApiResponse } from '../../types/api';
import { getProducts } from '../../services/api';
import { API_BASE_URL } from '../../config';
import { categoryApi } from '../../services/api';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface FilterState {
  category: string | undefined;
  priceRange: [number, number];
  sortBy: string;
  specialOffer?: boolean;
  trending?: boolean;
  inStock?: boolean;
  material?: string;
  work?: string;
}

const AllProducts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(!isMobile);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 0],
    category: '',
    sortBy: 'newest',
    specialOffer: false,
    trending: false,
    inStock: false,
    material: '',
    work: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getProducts();
        
        if (response.success) {
          // Transform ProductResponse to Product
          const transformedProducts: Product[] = response.data.map(product => ({
            ...product,
            rating: product.rating || 0,
            stock: product.stock || 0,
            images: product.images || [],
            reviews: product.reviews || [],
            specifications: product.specifications || {},
            featured: product.featured || false
          }));
          setProducts(transformedProducts);
          
          // Update price range based on actual product prices
          const maxPrice = Math.max(...transformedProducts.map(p => p.price));
          const minPrice = Math.min(...transformedProducts.map(p => p.price));
          setFilters(prev => ({
            ...prev,
            priceRange: [minPrice, maxPrice]
          }));
        } else {
          setError(response.error || 'Failed to fetch products');
        }
      } catch (err) {
        setError('An error occurred while fetching products');
        console.error('Product fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Handle filter state from navigation
    const state = location.state as { category?: string; filter?: string } | null;
    if (state) {
      if (state.category) {
        setFilters(prev => ({ ...prev, category: state.category }));
      }
      if (state.filter) {
        switch (state.filter) {
          case 'trending':
            setFilters(prev => ({ ...prev, trending: true }));
            break;
          case 'specialOffer':
            setFilters(prev => ({ ...prev, specialOffer: true }));
            break;
        }
      }
      // Clear the state after applying filters
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Categories filter
    if (filters.category) {
      const selectedCategory = categories.find(cat => cat.name === filters.category);
      if (selectedCategory) {
        filtered = filtered.filter(product => product.categoryId === selectedCategory.id);
      }
    }

    // Material filter
    if (filters.material) {
      filtered = filtered.filter(product => {
        const material = product.specifications?.material?.toLowerCase();
        return material === filters.material?.toLowerCase();
      });
    }

    // Work filter
    if (filters.work) {
      filtered = filtered.filter(product => {
        const work = product.specifications?.work?.toLowerCase();
        return work === filters.work?.toLowerCase();
      });
    }

    // Special offers filter
    if (filters.specialOffer) {
      filtered = filtered.filter(product => product.featured);
    }

    // Trending filter
    if (filters.trending) {
      filtered = filtered.filter(product => product.trending);
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => {
          const aReviews = a.reviews?.length || 0;
          const bReviews = b.reviews?.length || 0;
          return bReviews - aReviews;
        });
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: ProductResponse) => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      image: product.images[0],
      categoryId: product.categoryId,
      sku: product.sku || '',
      stock: product.stock,
      quantity: 1,
      featured: product.featured || false,
      trending: product.trending || false,
      description: product.description || '',
      rating: product.rating || 0,
      specifications: product.specifications || {}
    };
    addItem(cartItem);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return `${API_BASE_URL}/images/products/placeholder.jpg`;
    }
    const cleanPath = imagePath.replace(/^\/images\/products\//, '');
    return `${API_BASE_URL}/images/products/${cleanPath}`;
  };

  const FilterDrawer = () => (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)',
        border: '1px solid rgba(227, 28, 121, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(227, 28, 121, 0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        background: 'linear-gradient(90deg, #E31C79 0%, #FF4D8D 100%)',
        p: 2,
        borderRadius: 2,
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Filters</Typography>
        <Box>
          {isMobile && (
            <IconButton 
              onClick={() => setFilterDrawerOpen(false)}
              sx={{ color: 'white', mr: 1 }}
            >
              <CloseIcon />
            </IconButton>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const maxPrice = Math.max(...products.map(p => p.price));
              const minPrice = Math.min(...products.map(p => p.price));
              setFilters({
                priceRange: [minPrice, maxPrice],
                category: '',
                sortBy: 'newest',
                specialOffer: false,
                trending: false,
                inStock: false,
                material: '',
                work: ''
              });
            }}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Clear All
          </Button>
        </Box>
      </Box>
      
      <Stack spacing={3}>
        {/* Price Range */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Price Range</Typography>
          <Slider
            value={filters.priceRange}
            onChange={(_, newValue) => setFilters({ ...filters, priceRange: newValue as [number, number] })}
            valueLabelDisplay="auto"
            min={Math.min(...products.map(p => p.price))}
            max={Math.max(...products.map(p => p.price))}
            step={Math.ceil(Math.max(...products.map(p => p.price)) / 100)}
            sx={{ 
              mt: 1,
              color: '#E31C79',
              '& .MuiSlider-thumb': {
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(227, 28, 121, 0.16)',
                },
                '&.Mui-active': {
                  boxShadow: '0 0 0 14px rgba(227, 28, 121, 0.16)',
                },
              },
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 2,
            p: 1,
            bgcolor: 'rgba(227, 28, 121, 0.05)',
            borderRadius: 1
          }}>
            <Typography variant="body2" sx={{ color: '#E31C79', fontWeight: 500 }}>₹{filters.priceRange[0]}</Typography>
            <Typography variant="body2" sx={{ color: '#E31C79', fontWeight: 500 }}>₹{filters.priceRange[1]}</Typography>
          </Box>
        </Box>

        <Divider sx={{ 
          my: 2,
          borderColor: 'rgba(227, 28, 121, 0.1)',
          height: 2
        }} />

        {/* Category */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Category</Typography>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || ''}
              label="Category"
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '& .MuiSelect-select': {
                  py: 1.5,
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ 
          my: 2,
          borderColor: 'rgba(227, 28, 121, 0.1)',
          height: 2
        }} />

        {/* Material */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Material</Typography>
          <FormControl fullWidth>
            <InputLabel>Material</InputLabel>
            <Select
              value={filters.material || ''}
              label="Material"
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '& .MuiSelect-select': {
                  py: 1.5,
                },
              }}
            >
              <MenuItem value="">All Materials</MenuItem>
              <MenuItem value="Silk">Silk</MenuItem>
              <MenuItem value="Cotton">Cotton</MenuItem>
              <MenuItem value="Georgette">Georgette</MenuItem>
              <MenuItem value="Net">Net</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ 
          my: 2,
          borderColor: 'rgba(227, 28, 121, 0.1)',
          height: 2
        }} />

        {/* Work */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Work</Typography>
          <FormControl fullWidth>
            <InputLabel>Work</InputLabel>
            <Select
              value={filters.work || ''}
              label="Work"
              onChange={(e) => setFilters({ ...filters, work: e.target.value })}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '& .MuiSelect-select': {
                  py: 1.5,
                },
              }}
            >
              <MenuItem value="">All Work Types</MenuItem>
              <MenuItem value="Embroidered">Embroidered</MenuItem>
              <MenuItem value="Printed">Printed</MenuItem>
              <MenuItem value="Stone Work">Stone Work</MenuItem>
              <MenuItem value="Zari Work">Zari Work</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ 
          my: 2,
          borderColor: 'rgba(227, 28, 121, 0.1)',
          height: 2
        }} />

        {/* Special Offers */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Special Offers</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.specialOffer}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialOffer: e.target.checked }))}
                  sx={{
                    color: '#E31C79',
                    '&.Mui-checked': {
                      color: '#E31C79',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(227, 28, 121, 0.04)',
                    },
                  }}
                />
              }
              label="Special Offers"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: '#666',
                  '&:hover': {
                    color: '#E31C79',
                  },
                },
              }}
            />
          </FormGroup>
        </Box>

        {/* Trending */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Trending</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.trending}
                  onChange={(e) => setFilters(prev => ({ ...prev, trending: e.target.checked }))}
                  sx={{
                    color: '#E31C79',
                    '&.Mui-checked': {
                      color: '#E31C79',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(227, 28, 121, 0.04)',
                    },
                  }}
                />
              }
              label="Trending Products"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: '#666',
                  '&:hover': {
                    color: '#E31C79',
                  },
                },
              }}
            />
          </FormGroup>
        </Box>

        {/* In Stock */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>In Stock</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.inStock}
                  onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                  sx={{
                    color: '#E31C79',
                    '&.Mui-checked': {
                      color: '#E31C79',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(227, 28, 121, 0.04)',
                    },
                  }}
                />
              }
              label="In Stock"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: '#666',
                  '&:hover': {
                    color: '#E31C79',
                  },
                },
              }}
            />
          </FormGroup>
        </Box>

        <Divider sx={{ 
          my: 2,
          borderColor: 'rgba(227, 28, 121, 0.1)',
          height: 2
        }} />

        {/* Sort By */}
        <Box>
          <Typography gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>Sort By</Typography>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E31C79',
                },
                '& .MuiSelect-select': {
                  py: 1.5,
                },
              }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </Paper>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            position: 'sticky',
            top: '100px'
          }}>
            <FilterDrawer />
          </Box>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              All Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Showing {filteredProducts.length} products
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={6} sm={6} md={4} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AllProducts; 