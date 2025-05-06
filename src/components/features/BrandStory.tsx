import React from 'react'
import { Box, Container, Typography, Grid, Button, Fade } from '@mui/material'
import { ImageWithFallback } from '../shared/common/ImageWithFallback'
import { MEDIA_BASE_URL } from '../../config'

// SVG Background Component
const BackgroundPattern = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      opacity: 0.15,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 700 700"
    >
      <defs>
        <linearGradient gradientTransform="rotate(-150, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="gggrain-gradient2">
          <stop stopColor="hsla(299, 83%, 49%, 1.00)" stopOpacity="1" offset="-0%"></stop>
          <stop stopColor="rgba(255,255,255,0)" stopOpacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient gradientTransform="rotate(150, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="gggrain-gradient3">
          <stop stopColor="hsl(0, 100%, 50%)" stopOpacity="1"></stop>
          <stop stopColor="rgba(255,255,255,0)" stopOpacity="0" offset="100%"></stop>
        </linearGradient>
        <filter id="gggrain-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.58" numOctaves="2" seed="2" stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence"></feTurbulence>
          <feColorMatrix type="saturate" values="0" x="0%" y="0%" width="100%" height="100%" in="turbulence" result="colormatrix"></feColorMatrix>
          <feComponentTransfer x="0%" y="0%" width="100%" height="100%" in="colormatrix" result="componentTransfer">
            <feFuncR type="linear" slope="3"></feFuncR>
            <feFuncG type="linear" slope="3"></feFuncG>
            <feFuncB type="linear" slope="3"></feFuncB>
          </feComponentTransfer>
          <feColorMatrix x="0%" y="0%" width="100%" height="100%" in="componentTransfer" result="colormatrix2" type="matrix" values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 19 -11"></feColorMatrix>
        </filter>
      </defs>
      <g>
        <rect width="100%" height="100%" fill="hsl(0, 100%, 60%)"></rect>
        <rect width="100%" height="100%" fill="url(#gggrain-gradient3)"></rect>
        <rect width="100%" height="100%" fill="url(#gggrain-gradient2)"></rect>
        <rect width="100%" height="100%" fill="transparent" filter="url(#gggrain-filter)" opacity="0.64" style={{ mixBlendMode: 'soft-light' }}></rect>
      </g>
    </svg>
  </Box>
)

interface BrandStoryProps {
  isVisible: boolean
}

const BrandStory: React.FC<BrandStoryProps> = ({ isVisible }) => {
  return (
    <Fade in timeout={1000}>
      <Box 
        sx={{ 
          position: 'relative',
          py: 2, 
          width: '100%',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out',
          overflow: 'hidden'
        }}
      >
        <BackgroundPattern />
        <Container 
          maxWidth={false}
          disableGutters
          sx={{ 
            position: 'relative',
            zIndex: 1
          }}
        >
          <Grid container spacing={6} alignItems="center" sx={{ padding: 0 }}>
            <Grid item xs={12} md={6} sx={{ padding: 0 }}>
              <Box
                component="img"
                src={`${MEDIA_BASE_URL}/images/our-story.png`}
                alt="Our Heritage"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ padding: 0 }} >
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    color: '#E31C79'
                  }
                }}
              >
                Our Story
              </Typography>
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  color: '#666',
                  lineHeight: 1.8,
                  mb: 3,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Founded in 1995, Sree Sathyabhama Silks has been at the forefront of bringing the finest silk sarees to our customers. Our journey began with a simple mission: to preserve and promote the rich heritage of Indian silk weaving while making it accessible to modern women.
              </Typography>
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  color: '#666',
                  lineHeight: 1.8,
                  mb: 4,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Today, we take pride in our extensive collection of authentic silk sarees, sourced directly from the finest weavers across India. Each piece in our collection tells a story of tradition, craftsmanship, and timeless elegance.
              </Typography>
              <Button
                variant="outlined"
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
                  px: 4,
                  py: 1.5,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Learn More
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  )
}

export default BrandStory 