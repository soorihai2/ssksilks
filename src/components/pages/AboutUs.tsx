import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, Divider } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL, MEDIA_BASE_URL } from '../../config';
import { ImageWithFallback } from '../shared/common/ImageWithFallback';

// Define StoreSettings locally instead of importing
interface StoreSettings {
  id: string;
  name: string;
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  shippingMethods: Array<{
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  }>;
  paymentMethods: string[];
  offers: any[];
  googleMapsLocation: string;
}

// Timeline data
const timeline = [
  {
    year: "1978",
    title: "Humble Beginnings",
    description: "Sree Sathyabhama Silks was founded by Sathyabhama Rao with just two looms in a small village near Kanchipuram.",
    icon: "🎯"
  },
  {
    year: "1985",
    title: "First Retail Store",
    description: "Our first retail store opened in Chennai, bringing authentic handloom silk sarees directly to urban customers.",
    icon: "🏪"
  },
  {
    year: "1992",
    title: "Expansion & Recognition",
    description: "The brand expanded to multiple locations across South India and received its first national recognition for craftsmanship.",
    icon: "🌟"
  },
  {
    year: "2005",
    title: "Preserving Heritage",
    description: 'Launched the "Preserve & Prosper" initiative to train young weavers and preserve traditional weaving techniques.',
    icon: "🎨"
  },
  {
    year: "2012",
    title: "Going Digital",
    description: "Embraced e-commerce to bring our exquisite silk sarees to customers across the country and overseas.",
    icon: "💻"
  },
  {
    year: "2023",
    title: "Eco-Friendly Practices",
    description: "Implemented sustainable production practices and eco-friendly packaging to reduce environmental impact.",
    icon: "🌱"
  },
];

const AboutUs: React.FC = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/settings`);
        setStoreSettings(response.data.store);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load store information');
      }
    };

    fetchSettings();
  }, []);

  if (!storeSettings) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))',
            zIndex: 1,
          }}
        />
        <Box
          component="img"
          src="/uploads/about/legacy-of-handloom.jpg"
          alt="Silk Weaving Heritage"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              mb: 3,
              color: 'white',
            }}
          >
            Our Heritage, Our Story
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            For over four decades, {storeSettings?.name || 'Sree Sathyabhama Silks'} has been dedicated to
            preserving the ancient art of silk weaving while bringing timeless
            elegance to the modern woman.
          </Typography>
        </Container>
      </Box>

      {/* Our Story Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 500,
              mb: 2,
            }}
          >
            Our Story
          </Typography>
          <Divider sx={{ width: 80, mx: 'auto', borderColor: '#E31C79', borderWidth: 2 }} />
        </Box>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              Founded in 1978 by Sathyabhama Rao, our journey began with a small
              workshop of just two looms in a village near Kanchipuram, Tamil
              Nadu - the silk capital of India.
            </Typography>
            <Typography variant="body1" paragraph>
              What started as a passion to preserve traditional weaving
              techniques has grown into a beloved brand synonymous with
              authenticity, craftsmanship, and timeless elegance.
            </Typography>
            <Typography variant="body1">
              Today, we work with over 200 skilled artisans, many from families
              that have been weaving silk for generations. Every saree we create
              is a testament to our commitment to keeping this ancient art form
              alive while adapting to contemporary aesthetics and needs.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={`${MEDIA_BASE_URL}/uploads/about/art-of-handloom.jpg`}
                alt="The art of handloom"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
              <Box
                component="img"
                src={`${MEDIA_BASE_URL}/uploads/about/weaving-tradition.jpg`}
                alt="Weaving traditions"
                sx={{
                  position: 'absolute',
                  bottom: -32,
                  left: -32,
                  width: 160,
                  height: 160,
                  borderRadius: 2,
                  boxShadow: 2,
                  border: '4px solid white',
                  display: { xs: 'none', md: 'block' },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Our Mission Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 500,
                mb: 2,
              }}
            >
              Our Mission
            </Typography>
            <Divider sx={{ width: 80, mx: 'auto', borderColor: '#E31C79', borderWidth: 2 }} />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  bgcolor: 'white',
                }}
              >
                <Box sx={{ color: '#E31C79', mb: 3 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </Box>
                <Typography variant="h5" gutterBottom>
                  Preserve Heritage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We are committed to preserving the rich heritage of handloom
                  weaving by documenting traditional techniques and training new
                  generations of weavers.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  bgcolor: 'white',
                }}
              >
                <Box sx={{ color: '#E31C79', mb: 3 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </Box>
                <Typography variant="h5" gutterBottom>
                  Empower Artisans
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We provide fair wages, safe working conditions, and opportunities
                  for growth to our community of weavers, ensuring the
                  sustainability of their livelihoods.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  bgcolor: 'white',
                }}
              >
                <Box sx={{ color: '#E31C79', mb: 3 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Box>
                <Typography variant="h5" gutterBottom>
                  Global Reach
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We aim to showcase the beauty and elegance of traditional Indian
                  silk sarees to the world, bridging cultural boundaries through the
                  language of craftsmanship.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Journey Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 500,
                mb: 2,
              }}
            >
              Our Journey
            </Typography>
            <Divider sx={{ width: 80, mx: 'auto', borderColor: '#E31C79', borderWidth: 2 }} />
          </Box>

          {/* Add Map Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h4"
              component="h3"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 500,
                mb: 4,
                textAlign: 'center',
              }}
            >
              Visit Us
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: '400px',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
              }}
              dangerouslySetInnerHTML={{ __html: storeSettings.googleMapsLocation }}
            />
          </Box>

          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: 'primary.light',
                transform: 'translateX(-50%)',
              },
            }}
          >
            {timeline.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                  mb: 8,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    border: '4px solid',
                    borderColor: 'primary.light',
                    transform: 'translateX(-50%)',
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    width: { xs: '100%', md: '45%' },
                    bgcolor: 'white',
                    borderRadius: 2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      [index % 2 === 0 ? 'right' : 'left']: -20,
                      transform: 'translateY(-50%)',
                      border: '10px solid transparent',
                      borderRightColor: index % 2 === 0 ? 'white' : 'transparent',
                      borderLeftColor: index % 2 === 0 ? 'transparent' : 'white',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h2" sx={{ mr: 2 }}>
                      {item.icon}
                    </Typography>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {item.year}
                    </Typography>
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.description}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs; 