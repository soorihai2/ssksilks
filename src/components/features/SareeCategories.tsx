import React from 'react'
import { Box, Container, Typography, Grid, Card, CardMedia, Fade, CardContent, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config'
import { getImageUrl } from '../../utils/imageUtils'

interface Category {
  id: string
  name: string
  description: string
  image: string
  subcategories?: Category[]
}

interface SareeCategoriesProps {
  isVisible: boolean
  categories: Category[]
}

const SareeCategories: React.FC<SareeCategoriesProps> = ({ isVisible, categories = [] }) => {
  const navigate = useNavigate()

  if (!categories || categories.length === 0) {
    return null;
  }

  // Create a map of unique category IDs
  const uniqueCategories = categories.reduce((acc, category) => {
    if (!acc[category.id]) {
      acc[category.id] = category;
    }
    return acc;
  }, {} as Record<string, Category>);

  return (
    <Fade in timeout={1000}>
      <Box 
        sx={{ 
          bgcolor: '#FFF5F5', 
          py: 8, 
          width: '100%',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 0.6s ease-out',
          margin: 0,
          padding: 0,
          position: 'relative',
          left: 0,
          right: 0
        }}
      >
        <Box 
          sx={{ 
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Typography 
            variant="h3" 
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
            Saree Categories
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
            Discover our extensive collection
          </Typography>
          <Grid container spacing={4}>
            {Object.values(uniqueCategories).map((category, index) => (
              <Grid item xs={6} sm={6} md={4} key={`category-${category.id}-${index}`}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease-in-out'
                    }
                  }}
                  onClick={() => navigate(`/category/${category.id}`)}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      aspectRatio: '1/1',
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5'
                    }}
                    image={getImageUrl(
                      category.image && typeof category.image === 'string' 
                        ? category.image 
                        : undefined,
                      'categories',
                      'placeholder.jpg'
                    )}
                    alt={category.name || 'Category Image'}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {category.name || 'Unnamed Category'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {category.description || 'No description available'}
                    </Typography>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Subcategories:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {category.subcategories.map((subcategory, subIndex) => (
                            <Button
                              key={`subcategory-${category.id}-${subcategory.id || subIndex}`}
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/category/${subcategory.id}`)
                              }}
                            >
                              {subcategory.name || 'Unnamed Subcategory'}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Fade>
  )
}

export default SareeCategories 