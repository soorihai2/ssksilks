import React from 'react'
import { Box, Container, Typography, Grid, Fade } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import SecurityIcon from '@mui/icons-material/Security'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'

interface WhyChooseUsProps {
  isVisible: boolean
}

const features = [
  {
    icon: LocalShippingIcon,
    title: 'Free Shipping',
    description: 'Free shipping on all orders above ₹5000'
  },
  {
    icon: SecurityIcon,
    title: 'Secure Payment',
    description: '100% secure payment options available'
  },
  {
    icon: SupportAgentIcon,
    title: 'Expert Support',
    description: '24/7 customer support for all your queries'
  }
]

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ isVisible }) => {
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
            width: '100%'
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
            WHY CHOOSE US
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
            Experience the difference with our premium services
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      '& .MuiSvgIcon-root': {
                        color: '#E31C79'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      mb: 2
                    }}
                  >
                    <feature.icon 
                      sx={{ 
                        fontSize: 40,
                        color: '#666',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontFamily: 'Cormorant Garamond, serif',
                      color: '#E31C79'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      lineHeight: 1.6,
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Fade>
  )
}

export default WhyChooseUs 