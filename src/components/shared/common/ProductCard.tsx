import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating as MuiRating,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useCart } from '../../../contexts/CartContext';
import type { Product } from '../../../types';
import { CartItem } from '../../../contexts/CartContext';
import { MEDIA_BASE_URL } from '../../../config';

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
  
  // Clean the path by removing any leading /images/products/ or /videos/products/
  const cleanPath = imagePath.replace(new RegExp(`^/[^/]+/${folder}/`), '');
  return `${MEDIA_BASE_URL}/${basePath}/${folder}/${cleanPath}`;
};

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  showAddToCart = true 
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        image: getImageUrl(product.images[0]),
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
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          },
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={handleProductClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence>
            {product.trending && (
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                exit={{ x: 100 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1
                }}
              >
                <Chip
                  label="Trending"
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(227, 28, 121, 0.9)',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 1
                    },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      bgcolor: 'rgba(227, 28, 121, 1)'
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {product.featured && (
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                exit={{ x: 100 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: product.trending ? 100 : 8,
                  zIndex: 1
                }}
              >
                <Chip
                  label="Featured"
                  color="error"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(244, 67, 54, 0.9)',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 1
                    },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      bgcolor: 'rgba(244, 67, 54, 1)'
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{
              x: isHovered ? '-50%' : '0%'
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              display: 'flex',
              width: '200%'
            }}
          >
            {(() => {
              // Combine images and videos arrays, with fallback for undefined videos
              const allMedia = [...product.images, ...(product.videos || [])];
              const firstMedia = allMedia[0];
              const secondMedia = allMedia[1] || allMedia[0];
              
              const isVideo1 = firstMedia ? /\.(mp4|webm)$/i.test(firstMedia) : false;
              const isVideo2 = secondMedia ? /\.(mp4|webm)$/i.test(secondMedia) : false;
              
              return (
                <>
                  {firstMedia ? (
                    isVideo1 ? (
                      <Box
                        component="video"
                        src={getImageUrl(firstMedia)}
                        alt={product.name}
                        sx={{
                          width: '50%',
                          height: 400,
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        image={getImageUrl(firstMedia)}
                        alt={product.name}
                        sx={{
                          width: '50%',
                          height: 400,
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    )
                  ) : (
                    <Box
                      sx={{
                        width: '50%',
                        height: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Typography color="text.secondary">No media available</Typography>
                    </Box>
                  )}
                  {secondMedia ? (
                    isVideo2 ? (
                      <Box
                        component="video"
                        src={getImageUrl(secondMedia)}
                        alt={`${product.name} - alternate view`}
                        sx={{
                          width: '50%',
                          height: 400,
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        image={getImageUrl(secondMedia)}
                        alt={`${product.name} - alternate view`}
                        sx={{
                          width: '50%',
                          height: 400,
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    )
                  ) : (
                    <Box
                      sx={{
                        width: '50%',
                        height: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Typography color="text.secondary">No media available</Typography>
                    </Box>
                  )}
                </>
              );
            })()}
          </motion.div>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2, textAlign: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.1rem',
                fontWeight: 600,
                textAlign: 'center',
                transition: 'color 0.3s ease',
                '&:hover': {
                  color: '#E31C79'
                },
                mb: 0.5
              }}
            >
              {product.name}
            </Typography>
          </motion.div>

          {product.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                textAlign: 'center',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '2.4rem'
              }}
            >
              {product.description}
            </Typography>
          )}

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 0.5,
              gap: 1
            }}
          >
            <motion.div whileHover={{ scale: 1.1 }}>
              <MuiRating
                value={Number(product.rating)}
                precision={0.5}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-icon': {
                    color: '#E31C79',
                    width: '20px',
                    height: '20px',
                    margin: '0 2px',
                    transition: 'transform 0.3s ease'
                  },
                  '& .MuiRating-decimal': {
                    color: '#E31C79'
                  },
                  '& .MuiRating-iconFilled': {
                    color: '#E31C79'
                  },
                  '& .MuiRating-iconEmpty': {
                    color: 'rgba(227, 28, 121, 0.3)'
                  }
                }}
              />
            </motion.div>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.85rem'
              }}
            >
              ({Number(product.rating).toFixed(1)})
            </Typography>
          </Box>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 700,
                color: '#E31C79',
                textAlign: 'center'
              }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Box
              onClick={handleAddToCart}
              sx={{
                bgcolor: '#E31C79',
                color: 'white',
                width: '100%',
                py: 1,
                px: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#C71066',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <ShoppingCartIcon fontSize="small" />
              <Typography
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                Add to Cart
              </Typography>
            </Box>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 