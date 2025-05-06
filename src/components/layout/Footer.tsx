import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Footer: React.FC = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/settings`);
        setStoreSettings(response.data.store);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1f36',
        color: 'white',
        py: 6,
        position: 'relative',
        bottom: 0,
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: 'Playfair Display, serif', 
                  color: '#E31C79'
                }}
              >
                {storeSettings?.name || 'Your Store Name'}
              </Typography>
              <Typography variant="body2" paragraph>
                {storeSettings?.address || 'Your Store Address'}
              </Typography>
              <Typography variant="body2" paragraph>
                Phone: {storeSettings?.phone || 'Your Phone Number'}
              </Typography>
              <Typography variant="body2" paragraph>
                Email: {storeSettings?.email || 'your@email.com'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton
                  href="https://www.instagram.com/sreesathyabhamasilks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#E31C79',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  href="https://www.facebook.com/sathyabhmasilks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#1877F2',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                >
                  <FacebookIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: 'Playfair Display, serif', 
                  color: '#E31C79'
                }}
              >
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['Home', 'Products', 'About Us', 'Contact Us'].map((text) => (
                  <Link 
                    key={text}
                    component={RouterLink} 
                    to={text === 'Home' ? '/' : text === 'About Us' ? '/about' : text === 'Contact Us' ? '/contact' : `/${text.toLowerCase().replace(' ', '-')}`} 
                    color="inherit" 
                    underline="none"
                    sx={{
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#E31C79'
                      }
                    }}
                  >
                    {text}
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: 'Playfair Display, serif', 
                  color: '#E31C79'
                }}
              >
                Policy Pages
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { text: 'Privacy Policy', path: '/privacy' },
                  { text: 'Terms of Service', path: '/terms' },
                  { text: 'Shipping Policy', path: '/shipping-policy' },
                  { text: 'Refund Policy', path: '/refund-policy' }
                ].map((item) => (
                  <Link 
                    key={item.text}
                    component={RouterLink} 
                    to={item.path} 
                    color="inherit" 
                    underline="none"
                    sx={{
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#E31C79'
                      }
                    }}
                  >
                    {item.text}
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          textAlign: 'center'
        }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} {storeSettings?.name || 'Your Store Name'}. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 