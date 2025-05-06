import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { settingsApi, Settings } from '../../services/api/settings';
import { API_BASE_URL } from '../../config';

interface Discount {
  label: string;
  image: string;
  coupon: string;
}

interface DiscountsProps {
  isVisible: boolean;
}

const Discounts: React.FC<DiscountsProps> = ({ isVisible }) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        console.log('Fetching settings...');
        const settings = await settingsApi.getSettings();
        console.log('Settings received:', settings);
        if (settings && settings.offers) {
          console.log('Offers found:', settings.offers);
          setDiscounts(settings.offers.map(offer => ({
            label: offer.label || '',
            image: offer.image || '',
            coupon: offer.coupon || ''
          })));
        } else {
          console.log('No offers found in settings');
          setDiscounts([]);
        }
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setError('Failed to load discounts');
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchDiscounts();
    }
  }, [isVisible]);

  if (!isVisible) {
    console.log('Discounts section not visible');
    return null;
  }

  if (loading) {
    console.log('Loading discounts...');
    return null;
  }

  if (error) {
    console.error('Error in Discounts component:', error);
    return null;
  }

  console.log('Rendering discounts:', discounts);

  return (
    <Box 
      sx={{ 
        bgcolor: '#FFF5F5', 
        py: 8, 
        width: '100%'
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
            fontFamily: 'Playfair Display, serif'
          }}
        >
          SPECIAL DISCOUNTS
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ 
            mb: 6, 
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          Limited time offers you don't want to miss
        </Typography>

        <Grid container spacing={4}>
          {discounts.map((discount, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`${API_BASE_URL}${discount.image}`}
                  alt={discount.label}
                  sx={{
                    objectFit: 'cover',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                    }
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 600
                    }}
                  >
                    {discount.label}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color="primary"
                    sx={{ 
                      fontWeight: 700,
                      mb: 2
                    }}
                  >
                    Use Code: {discount.coupon}
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/products')}
                    sx={{
                      mt: 'auto',
                      backgroundColor: '#E31C79',
                      '&:hover': {
                        backgroundColor: '#C4186A'
                      }
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
  );
};

export default Discounts; 