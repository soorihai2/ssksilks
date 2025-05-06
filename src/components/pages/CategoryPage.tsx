import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Box, Fade } from '@mui/material';
import { productApi, categoryApi } from "../../services/api";
import { ProductCard } from "../shared/common/ProductCard";
import { Product } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Use the API services instead of direct fetch calls
        const [categoryData, allProducts] = await Promise.all([
          categoryApi.getById(categoryId!),
          productApi.getAll()
        ]);
        
        setCategoryName(categoryData.name);

        // Filter products by category
        const categoryProducts = allProducts.filter((product: Product) => product.categoryId === categoryId);
        setProducts(categoryProducts);
      } catch (err) {
        setError('Failed to fetch category data');
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Fade in timeout={1000}>
      <Container 
        maxWidth={false}
        sx={{ 
          my: 8,
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: 1, 
            fontFamily: 'Playfair Display, serif',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              color: '#E31C79'
            }
          }}
        >
          {categoryName} Collection
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ 
            mb: 6, 
            color: '#666',
            transition: 'all 0.3s ease',
            fontFamily: 'Montserrat, sans-serif',
            '&:hover': {
              color: '#E31C79'
            }
          }}
        >
          Browse our collection
        </Typography>
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <ProductCard 
                product={{
                  ...product,
                  sku: product.sku || '',
                  specifications: product.specifications || {},
                  reviews: product.reviews || [],
                  rating: product.rating || 0,
                  featured: product.featured || false,
                  trending: product.trending || false
                } as Product} 
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Fade>
  );
};

export default CategoryPage; 