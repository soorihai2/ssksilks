import React from 'react'
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Fade } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL, MEDIA_BASE_URL } from '../../config'

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return `${MEDIA_BASE_URL}/images/offers/placeholder.jpg`;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/images\/offers\//, '');
  return `${MEDIA_BASE_URL}/images/offers/${cleanPath}`;
};

interface SpecialOffersProps {
  isVisible: boolean
}

const offers = [
  {
    title: 'Wedding Collection',
    description: 'Get 20% off on our exclusive wedding collection',
    image: 'wedding-collection.jpg',
    discount: '20% OFF',
    filter: 'special-offers'
  },
  {
    title: 'Festive Special',
    description: 'Special discounts on festive wear sarees',
    image: 'festive-special.jpg',
    discount: '15% OFF',
    filter: 'special-offers'
  },
  {
    title: 'First Purchase',
    description: 'Get 10% off on your first purchase',
    image: 'first-purchase.jpg',
    discount: '10% OFF',
    filter: 'special-offers'
  }
]

const SpecialOffers: React.FC<SpecialOffersProps> = ({ isVisible }) => {
  const navigate = useNavigate();

  const handleShopNow = (filter: string) => {
    navigate(`/products?filter=${filter}`);
  };

  return (
    <Fade in timeout={1000}>
      <Box 
        sx={{ 
          bgcolor: '#FFF5F5', 
          py: 8, 
          width: '100%',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <Container 
          maxWidth={false}
          sx={{ 
            px: { xs: 2, sm: 4, md: 6, lg: 8 }
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
            SPECIAL OFFERS
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
            Don't miss out on these amazing deals
          </Typography>
          <Grid container spacing={4}>
            {offers.map((offer) => (
              <Grid item xs={12} md={4} key={offer.title}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.1)'
                      }
                    },
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: '#E31C79',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      zIndex: 1
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {offer.discount}
                    </Typography>
                  </Box>
                  <CardMedia
                    component="img"
                    image={`${MEDIA_BASE_URL}/images/offers/${offer.image}`}
                    alt={offer.title}
                    sx={{ 
                      height: 300,
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontFamily: 'Cormorant Garamond, serif',
                        color: '#E31C79'
                      }}
                    >
                      {offer.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        mb: 2,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {offer.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleShopNow(offer.filter)}
                      sx={{
                        borderColor: '#E31C79',
                        color: '#E31C79',
                        '&:hover': {
                          borderColor: '#E31C79',
                          backgroundColor: '#E31C79',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(227, 28, 121, 0.2)'
                        },
                        transition: 'all 0.3s ease',
                        borderRadius: 2,
                        py: 1.5,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      Shop Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Fade>
  )
}

export default SpecialOffers 