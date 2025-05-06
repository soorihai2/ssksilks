import React from 'react'
import { Box, Container, Typography, Grid, Fade } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'

interface BrandCommitmentProps {
  isVisible: boolean
}

const commitments = [
  {
    icon: VerifiedIcon,
    title: 'Authentic Silk',
    description: 'Every saree is crafted with 100% pure silk, sourced from the finest silk farms in India.'
  },
  {
    icon: EmojiEventsIcon,
    title: 'Award Winning',
    description: 'Recognized for excellence in traditional craftsmanship and quality.'
  },
  {
    icon: WorkspacePremiumIcon,
    title: 'Premium Quality',
    description: 'Rigorous quality checks ensure each piece meets our high standards.'
  }
]

const BrandCommitment: React.FC<BrandCommitmentProps> = ({ isVisible }) => {
  return (
    <Fade in timeout={1000}>
      <Box 
        sx={{ 
          bgcolor: '#FFF5F5', 
          py: 8, px:8,
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
            OUR COMMITMENT
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
            Quality and authenticity you can trust
          </Typography>
          <Grid container spacing={4}>
            {commitments.map((commitment) => (
              <Grid item xs={12} md={4} key={commitment.title}>
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
                    <commitment.icon 
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
                    {commitment.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      lineHeight: 1.6,
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {commitment.description}
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

export default BrandCommitment 