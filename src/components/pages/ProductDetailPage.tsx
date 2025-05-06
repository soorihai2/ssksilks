import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Box, Button, Fade, Rating, Paper, IconButton, Chip, Stack } from '@mui/material';
import { productApi } from "../../services/api";
import { settingsApi } from "../../services/api/settings";
import { useCart } from "../../contexts/CartContext";
import { CartItem } from "../../contexts/CartContext";
import { LocalShipping, Security, VerifiedUser, Add, Remove, LocalOffer, PlayArrow } from '@mui/icons-material';
import CustomizationIcon from '../../assets/icons/CustomizationIcon';
import TrendingProducts from "../features/TrendingProducts";
import { Product } from "../../types";
import { API_BASE_URL, MEDIA_BASE_URL } from '../../config';
import { ImageWithFallback } from "../shared/common/ImageWithFallback";

const getImageUrl = (imagePath?: string, folder: string = 'products', placeholder: string = 'placeholder.jpg') => {
  if (!imagePath) {
    return `${MEDIA_BASE_URL}/images/${folder}/${placeholder}`;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Determine if it's a video or image
  const isVideo = /\.(mp4|webm)$/i.test(imagePath);
  const basePath = isVideo ? 'videos' : 'images';
  
  // Clean the path by removing any leading path prefixes
  const cleanPath = imagePath.replace(new RegExp(`^/(?:images|videos)/${folder}/`), '');
  
  // For timestamp-based filenames (from multer uploads)
  if (/^\d{13,}-\d+\.(jpg|jpeg|png|webp|mp4|webm)$/.test(cleanPath)) {
    return `${MEDIA_BASE_URL}/${basePath}/${folder}/${cleanPath}`;
  }
  
  return `${MEDIA_BASE_URL}/${basePath}/${folder}/${cleanPath}`;
};

// Main product image component
const MainProductImage = ({ imageSrc, productName }: { imageSrc: string | undefined, productName: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playPromiseRef = React.useRef<Promise<void> | null>(null);

  // Add effect to handle auto-play when video source changes
  React.useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !/\.(mp4|webm)$/i.test(imageSrc || '')) return;

    const handlePlay = async () => {
      try {
        // Cancel any existing play request
        if (playPromiseRef.current) {
          await playPromiseRef.current;
        }
        
        // Load the video first
        videoElement.load();
        
        // Wait for the video to be ready
        await new Promise((resolve) => {
          const handleCanPlay = () => {
            videoElement.removeEventListener('canplay', handleCanPlay);
            resolve(true);
          };
          videoElement.addEventListener('canplay', handleCanPlay);
        });

        // Start playback
        playPromiseRef.current = videoElement.play();
        await playPromiseRef.current;
        setIsPlaying(true);
      } catch (error) {
        console.error('Video playback error:', error);
        setIsPlaying(false);
      }
    };

    handlePlay();

    // Cleanup function
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    };
  }, [imageSrc]);

  if (!imageSrc) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography color="text.secondary">No media available</Typography>
      </Box>
    );
  }

  const isVideo = /\.(mp4|webm)$/i.test(imageSrc);
  const mediaUrl = getImageUrl(imageSrc);

  if (isVideo) {
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Box
          component="video"
          ref={videoRef}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            backgroundColor: '#f5f5f5'
          }}
          controls
          playsInline
          muted
          loop
          onError={(e) => {
            console.error('Video error:', e);
            setIsPlaying(false);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        >
          <source src={mediaUrl} type={imageSrc.toLowerCase().endsWith('mp4') ? 'video/mp4' : 'video/webm'} />
          Your browser does not support the video tag.
        </Box>
        {!isPlaying && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
            onClick={async () => {
              if (videoRef.current) {
                try {
                  if (playPromiseRef.current) {
                    await playPromiseRef.current;
                  }
                  playPromiseRef.current = videoRef.current.play();
                  await playPromiseRef.current;
                  setIsPlaying(true);
                } catch (error) {
                  console.error('Error playing video:', error);
                  setIsPlaying(false);
                }
              }
            }}
          >
            <PlayArrow sx={{ fontSize: 32 }} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={mediaUrl}
      alt={productName}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        backgroundColor: '#f5f5f5'
      }}
    />
  );
};

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, removeItem, getItemQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [offers, setOffers] = useState<any[]>([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, allProducts, settingsData] = await Promise.all([
          productApi.getById(productId!),
          productApi.getAll(),
          settingsApi.getSettings()
        ]);
        console.log('Product images:', productData.images);
        setProduct(productData);
        setProducts(allProducts);
        setOffers(settingsData.offers || []);
        // Reset selected image when product changes
        setSelectedImage(0);
        // Scroll to top when product changes
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Debug selected image when it changes
  useEffect(() => {
    console.log('Selected image index changed to:', selectedImage);
  }, [selectedImage]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        image: product.images[0],
        categoryId: product.categoryId,
        sku: product.sku,
        stock: product.stock,
        quantity: quantity,
        featured: product.featured,
        trending: product.trending,
        description: product.description,
        rating: product.rating,
        specifications: product.specifications
      };
      addItem(cartItem);
    }
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">{error || 'Product not found'}</Typography>
      </Container>
    );
  }

  return (
    <Fade in>
      <Box sx={{ width: '100%', py: 4, mt: 8 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={4}>
            {/* Left side - Product Images */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    overflow: 'hidden',
                    borderRadius: 2,
                    mb: 2,
                    aspectRatio: '3/4'
                  }}
                >
                  <MainProductImage 
                    key={`main-image-${selectedImage}`}
                    imageSrc={[...product.images, ...(product.videos || [])][selectedImage]} 
                    productName={product.name} 
                  />
                </Paper>
                <Grid container spacing={1} key={`thumbnails-${product.id}`}>
                  {[...product.images, ...(product.videos || [])].map((media, index) => {
                    const isVideo = /\.(mp4|webm)$/i.test(media);
                    return (
                      <Grid item xs={3} key={index}>
                        <Paper
                          elevation={2}
                          sx={{
                            cursor: 'pointer',
                            border: selectedImage === index ? '2px solid #E31C79' : 'none',
                            borderRadius: 1,
                            overflow: 'hidden',
                            aspectRatio: '1/1',
                            position: 'relative'
                          }}
                          onClick={() => {
                            setSelectedImage(index);
                            // If it's a video, play it
                            if (isVideo) {
                              const videoElement = document.querySelector(`video[data-index="${index}"]`) as HTMLVideoElement;
                              if (videoElement) {
                                videoElement.play();
                                // Also trigger play on the main video
                                const mainVideo = document.querySelector('video[controls]') as HTMLVideoElement;
                                if (mainVideo) {
                                  mainVideo.play();
                                }
                              }
                            }
                          }}
                        >
                          {isVideo ? (
                            <Box
                              component="video"
                              src={getImageUrl(media)}
                              alt={`${product.name} ${index + 1}`}
                              data-index={index}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                backgroundColor: '#f5f5f5'
                              }}
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <ImageWithFallback
                              src={getImageUrl(media)}
                              alt={`${product.name} ${index + 1}`}
                              type="products"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                backgroundColor: '#f5f5f5'
                              }}
                            />
                          )}
                          {isVideo && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <PlayArrow sx={{ fontSize: 16 }} />
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>

            {/* Right side - Product Details */}
            <Grid item xs={12} md={6}>
              {/* Product Title */}
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Playfair Display',
                  mb: 1,
                  textAlign: 'left',
                  color: 'text.primary'
                }}
              >
                {product.name}
              </Typography>

              {/* Stock and Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label={product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'} 
                  color={product.stock > 0 ? 'success' : 'error'} 
                  size="medium"
                />
                <Rating 
                  value={product.rating} 
                  precision={0.5} 
                  readOnly 
                  size="small"
                />
              </Box>

              {/* Price - Left aligned */}
              <Box sx={{ textAlign: 'left', mb: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Roboto, sans-serif',
                    color: 'primary.main'
                  }}
                >
                  ₹{product.price.toLocaleString()}
                </Typography>
              </Box>

              {/* Product Description */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 3, textAlign: 'left' }}
              >
                {product.description}
              </Typography>

              {/* Specifications with proper alignment */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  textAlign: 'left'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Product Specifications</Typography>
                <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                  <Grid item xs={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Material
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VerifiedUser sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body1">
                            {product.specifications.material}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Work
                        </Typography>
                        <Typography variant="body1">
                          {product.specifications.work}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Length
                        </Typography>
                        <Typography variant="body1">
                          {product.specifications.length}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Origin
                        </Typography>
                        <Typography variant="body1">
                          {product.specifications.origin}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Quantity Selector */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'left', 
                justifyContent: 'left',
                gap: 2,
                mb: 2
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Quantity:
                </Typography>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
                  p: '2px'
                }}>
                  <IconButton 
                    onClick={() => handleQuantityChange('decrease')}
                    sx={{ 
                      bgcolor: 'white',
                      borderRadius: '6px',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      height: '36px',
                      width: '36px'
                    }}
                  >
                    <Remove sx={{ color: '#E31C79' }} />
                  </IconButton>
                  <Typography 
                    sx={{ 
                      px: 3,
                      color: 'white',
                      fontWeight: 600,
                      minWidth: '40px',
                      textAlign: 'center'
                    }}
                  >
                    {quantity}
                  </Typography>
                  <IconButton 
                    onClick={() => handleQuantityChange('increase')}
                    sx={{ 
                      bgcolor: 'white',
                      borderRadius: '6px',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      height: '36px',
                      width: '36px'
                    }}
                  >
                    <Add sx={{ color: '#E31C79' }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Add to Cart Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{
                  height: '56px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
                  boxShadow: '0 4px 12px rgba(227,28,121,0.3)',
                  mb: 4,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(227,28,121,0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Add to Cart
              </Button>

              {/* Trust Cards */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                  { icon: <LocalShipping />, title: 'Free Express Shipping', text: 'On orders above ₹999' },
                  { icon: <Security />, title: 'Secure Payment', text: '100% secure payment' },
                  { icon: <CustomizationIcon />, title: 'Customisation', text: 'Customise your order' },
                  { icon: <VerifiedUser />, title: 'Genuine Product', text: '100% authentic' }
                ].map((feature, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      {React.cloneElement(feature.icon, { 
                        sx: { color: 'primary.main', fontSize: 24 } 
                      })}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {feature.text}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Special Offers */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  mb: 4,
                  bgcolor: '#FFF5F9',
                  border: '1px dashed #E31C79',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Special Offers
                </Typography>
                <Stack spacing={1.5}>
                  {offers.map((offer, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'left', 
                        gap: 2,
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'left'
                      }}
                    >
                      <LocalOffer sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {offer.label}
                        </Typography>
                        {offer.coupon && (
                          <Chip 
                            label={offer.coupon}
                            size="small"
                            sx={{ 
                              mt: 0.5,
                              textAlign: 'left',
                              bgcolor: 'primary.main',
                              color: 'white',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {offer.description && (
                          <Typography variant="caption" color="text.secondary">
                            {offer.description}
                          </Typography>
                        )}
                        {offer.discountPercentage && (
                          <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5 }}>
                            {offer.discountPercentage}% OFF
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* You May Also Like section - Full width */}
        <Box sx={{ mt: 8, width: '100%' }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                textAlign: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '2px',
                  bgcolor: 'primary.main'
                }
              }}
            >
              You May Also Like
            </Typography>
            <Box sx={{ mt: 4 }}>
              <TrendingProducts 
                isVisible={true} 
                onAddToCart={(product) => {
                  const cartItem: CartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    image: product.images[0],
                    categoryId: product.categoryId,
                    sku: product.sku,
                    stock: product.stock,
                    quantity: 1,
                    featured: product.featured,
                    trending: product.trending,
                    description: product.description,
                    rating: product.rating,
                    specifications: product.specifications
                  };
                  addItem(cartItem);
                }} 
              />
            </Box>
          </Container>
        </Box>
      </Box>
    </Fade>
  );
};

export default ProductDetailPage; 