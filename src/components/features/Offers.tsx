import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, useTheme, useMediaQuery, CardActionArea, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { settingsApi } from '../../services/api';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUtils';

interface Offer {
  label: string;
  image: string;
  coupon: string;
  description?: string;
  discountPercentage?: number;
}

interface OffersProps {
  isVisible: boolean;
}

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionGrid = motion.create(Grid);
const MotionCard = motion.create(Card);

const Offers: React.FC<OffersProps> = ({ isVisible }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await settingsApi.getAll();
        if (response && (response as any).offers) {
          setOffers((response as any).offers);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOffers();
  }, []);

  if (!isVisible) return null;

  return (
    <Box sx={{ py: 4, width: '100%' }}>
      <Container maxWidth="lg">
        <MotionBox
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
              mb: 1, 
              fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Special Offers
          </Typography>
        </MotionBox>

        <MotionBox
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
            Exclusive deals just for you
          </Typography>
        </MotionBox>

        <Grid container spacing={3}>
          {offers.map((offer, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                sx={{ height: '100%' }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                  }}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      image={getImageUrl(offer.image, 'offers', 'placeholder.jpg')}
                      alt={offer.label}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {offer.label}
                      </Typography>
                      {offer.description && (
                        <Typography variant="body2" color="text.secondary">
                          {offer.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/products')}
                    >
                      Shop Now
                    </Button>
                  </CardActions>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Offers; 