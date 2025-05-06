import { Box, Typography, Grid, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { Product } from "../../types";
import { ProductCard } from "../shared/common/ProductCard";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState } from "react";
import { motion } from "framer-motion";

interface FeaturedProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isVisible?: boolean;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onAddToCart
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = isMobile ? 1 : 4;
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const startIndex = currentPage * productsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + productsPerPage);

  return (
    <Box sx={{ py: 4, position: 'relative', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            mb: 1,
            background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transition: 'all 0.3s ease'
          }}
        >
          Featured Products
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Typography 
          variant="subtitle1" 
          align="center"
          sx={{ 
            mb: 4,
            color: '#666',
            fontFamily: 'Montserrat, sans-serif',
            transition: 'all 0.3s ease'
          }}
        >
          Discover our handpicked collection
        </Typography>
      </motion.div>

      <Box sx={{ position: 'relative', px: { xs: 4, sm: 6 } }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {visibleProducts.map((product, index) => (
              <Grid item xs={6} sm={6} md={3} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard 
                    product={product}
                    onAddToCart={() => onAddToCart(product)}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {totalPages > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#E31C79',
                  color: 'white',
                },
                transition: 'all 0.3s ease',
                zIndex: 2
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#E31C79',
                  color: 'white',
                },
                transition: 'all 0.3s ease',
                zIndex: 2
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 3
          }}
        >
          {Array.from({ length: totalPages }).map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentPage(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: currentPage === index ? '#E31C79' : '#ddd',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#E31C79',
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturedProducts; 