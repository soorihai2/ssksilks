import React from "react";
import { Grid, Card, CardContent, CardMedia, Typography, Button } from "@mui/material";
import { Product } from "../types";
import { API_BASE_URL } from '../../config';

interface ProductListProps {
  isVisible: boolean;
  products: Product[];
  onAddToCart: (productId: string) => void;
}

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return `${API_BASE_URL}/images/products/placeholder.jpg`;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/images\/products\//, '');
  return `${API_BASE_URL}/images/products/${cleanPath}`;
};

export default function ProductList({ isVisible, products, onAddToCart }: ProductListProps) {
  if (!isVisible) return null;

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={getImageUrl(product.images[0])}
              alt={product.name}
            />
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography color="textSecondary">${product.price}</Typography>
              <Typography variant="body2">{product.description}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onAddToCart(product.id)}
                sx={{ mt: 2 }}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 