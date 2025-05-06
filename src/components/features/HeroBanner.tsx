import React, { useState, useEffect } from 'react'
import { Box, Typography, IconButton, Fade } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { MEDIA_BASE_URL } from '../../config'

interface Banner {
  image: string
  title: string
  subtitle: string
}

interface HeroBannerProps {
  isVisible: boolean
}

const banners: Banner[] = [
  {
    image: 'Banners-01.png',
    title: 'Wedding Collection',
    subtitle: 'Discover Exquisite Bridal Wear'
  },
  {
    image: 'Banners-02.png',
    title: 'Festive Collection',
    subtitle: 'Celebrate in Style'
  },
  {
    image: 'Banners-03.png',
    title: 'Designer Collection',
    subtitle: 'Exclusive Designer Pieces'
  }
]

const HeroBanner: React.FC<HeroBannerProps> = ({ isVisible }) => {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length)
  }

  return (
    <Fade in timeout={1500}>
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: { xs: '300px', md: '600px' }, 
          overflow: 'hidden',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
          '& img': {
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transition: 'transform 0.5s ease',
            transform: `translateX(-${currentBanner * 100}%)`
          }}
        >
          {banners.map((banner, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${index * 100}%`,
                width: '100%',
                height: '100%'
              }}
            >
              <Box
                component="img"
                src={`${MEDIA_BASE_URL}/images/${banner.image}`}
                alt={banner.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                <Typography variant="h3" sx={{ fontFamily: 'Playfair Display, serif', mb: 2 }}>
                  {banner.title}
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {banner.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <IconButton
          onClick={handlePrevBanner}
          sx={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': { bgcolor: 'white' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          onClick={handleNextBanner}
          sx={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': { bgcolor: 'white' }
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            zIndex: 2
          }}
        >
        
        </Box>
      </Box>
    </Fade>
  )
}

export default HeroBanner 