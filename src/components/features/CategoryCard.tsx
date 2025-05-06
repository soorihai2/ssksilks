import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, description, image }) => {
  const navigate = useNavigate();

  // Use the getImageUrl utility for consistent image handling
  const imageUrl = image ? getImageUrl(image, 'categories') : getImageUrl(id, 'categories');

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          '& .MuiCardMedia-root': {
            transform: 'scale(1.05)'
          }
        }
      }}
      onClick={() => navigate(`/category/${id}`)}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={name}
          sx={{ 
            height: 200,
            transition: 'transform 0.6s ease',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback to a default image if the category image fails to load
            const target = e.target as HTMLImageElement;
            target.src = getImageUrl('placeholder', 'categories');
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: '#333'
          }}
        >
          {name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CategoryCard; 