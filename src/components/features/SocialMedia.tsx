import React, { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  IconButton, 
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import PinterestIcon from '@mui/icons-material/Pinterest'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

// Declare Instagram's global object type
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface SocialMediaProps {
  isVisible: boolean
}

const instagramPosts = [
  {
    id: 'DJJ23dBvFWx',
    permalink: 'https://www.instagram.com/p/DJJ23dBvFWx/'
  },
  {
    id: 'DJJqtnvy-gy',
    permalink: 'https://www.instagram.com/p/DJJqtnvy-gy/'
  },
  {
    id: 'DI9T8MrSoCW',
    permalink: 'https://www.instagram.com/p/DI9T8MrSoCW/'
  },
  {
    id: 'DI5HGX0vgP6',
    permalink: 'https://www.instagram.com/p/DI5HGX0vgP6/'
  },
  {
    id: 'DIJLcNGyUSN',
    permalink: 'https://www.instagram.com/p/DIJLcNGyUSN/'
  },
  {
    id: 'DIya5IESIAk',
    permalink: 'https://www.instagram.com/p/DIya5IESIAk/'
  },
  {
    id: 'DIdaf6sSjpl',
    permalink: 'https://www.instagram.com/p/DIdaf6sSjpl/'
  },
  {
    id: 'DIObyH6y0gG',
    permalink: 'https://www.instagram.com/p/DIObyH6y0gG/'
  },
  {
    id: 'DFZwDc2S2D1',
    permalink: 'https://www.instagram.com/p/DFZwDc2S2D1/'
  },
  {
    id: 'DEryh4Kvvco',
    permalink: 'https://www.instagram.com/p/DEryh4Kvvco/'
  },
  {
    id: 'DChGSJ3PKS-',
    permalink: 'https://www.instagram.com/p/DChGSJ3PKS-/'
  },
  {
    id: 'C96xL8WR9OV',
    permalink: 'https://www.instagram.com/p/C96xL8WR9OV/'
  },
  {
    id: 'C_C2k6Oxa_X',
    permalink: 'https://www.instagram.com/p/C_C2k6Oxa_X/'
  },
  {
    id: 'CxF6BE4pwXK',
    permalink: 'https://www.instagram.com/p/CxF6BE4pwXK/'
  },
  {
    id: 'Ce0tbaTJ-1Z',
    permalink: 'https://www.instagram.com/p/Ce0tbaTJ-1Z/'
  },
  {
    id: 'Cfb0gZ5JEZr',
    permalink: 'https://www.instagram.com/p/Cfb0gZ5JEZr/'
  },
  {
    id: 'CeoOG5GlOVp',
    permalink: 'https://www.instagram.com/p/CeoOG5GlOVp/'
  }
];

const socialMediaPlatforms = [
  { 
    icon: InstagramIcon, 
    name: 'Instagram', 
    color: '#E31C79',
    link: 'https://www.instagram.com/sreesathyabhamasilks/'
  },
  { 
    icon: FacebookIcon, 
    name: 'Facebook', 
    color: '#1877F2',
    link: 'https://www.facebook.com/sathyabhmasilks/'
  },
  { icon: TwitterIcon, name: 'Twitter', color: '#1DA1F2' },
  { icon: PinterestIcon, name: 'Pinterest', color: '#E60023' }
]

const SocialMedia: React.FC<SocialMediaProps> = ({ isVisible }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visiblePosts, setVisiblePosts] = useState(4);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setVisiblePosts(1);
    } else if (isTablet) {
      setVisiblePosts(2);
    } else if (isLargeScreen) {
      setVisiblePosts(4);
    } else {
      setVisiblePosts(3);
    }
  }, [isMobile, isTablet, isLargeScreen]);

  const loadInstagramScript = () => {
    try {
      // Remove existing script if it exists and is still in the DOM
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }

      // Create and load new script
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        // Initialize Instagram embeds after script loads
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
      scriptRef.current = script;
    } catch (error) {
      console.error('Error loading Instagram script:', error);
    }
  };

  useEffect(() => {
    loadInstagramScript();
    return () => {
      try {
        if (scriptRef.current && document.body.contains(scriptRef.current)) {
          document.body.removeChild(scriptRef.current);
        }
      } catch (error) {
        console.error('Error cleaning up Instagram script:', error);
      }
    };
  }, []);

  useEffect(() => {
    if (isScriptLoaded) {
      // Reinitialize embeds when posts change
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    }
  }, [currentIndex, isScriptLoaded]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? instagramPosts.length - visiblePosts : prevIndex - 1;
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + visiblePosts >= instagramPosts.length ? 0 : prevIndex + 1;
      return newIndex;
    });
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
            FOLLOW US
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
            Stay updated with our latest collections
          </Typography>

          {/* Instagram Posts Carousel */}
          <Box sx={{ position: 'relative', mb: 8 }}>
            <style>
              {`
                .instagram-media {
                  margin: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  min-width: 100% !important;
                }
                .instagram-media iframe {
                  border: none !important;
                  width: 100% !important;
                  height: 100% !important;
                  min-height: 450px !important;
                }
                .instagram-media ._aak8, 
                .instagram-media ._aak9, 
                .instagram-media ._aak7, 
                .instagram-media ._aak6,
                .instagram-media ._aak5,
                .instagram-media ._aak4,
                .instagram-media ._aak3,
                .instagram-media ._aak2,
                .instagram-media ._aak1,
                .instagram-media ._aak0,
                .instagram-media ._aaj_,
                .instagram-media ._aaj-,
                .instagram-media ._aaj+,
                .instagram-media ._aaj*,
                .instagram-media ._aaj/,
                .instagram-media ._aaj.,
                .instagram-media ._aaj,
                .instagram-media ._aai_,
                .instagram-media ._aai-,
                .instagram-media ._aai+,
                .instagram-media ._aai*,
                .instagram-media ._aai/,
                .instagram-media ._aai.,
                .instagram-media ._aai,
                .instagram-media ._aah_,
                .instagram-media ._aah-,
                .instagram-media ._aah+,
                .instagram-media ._aah*,
                .instagram-media ._aah/,
                .instagram-media ._aah.,
                .instagram-media ._aah,
                .instagram-media ._aag_,
                .instagram-media ._aag-,
                .instagram-media ._aag+,
                .instagram-media ._aag*,
                .instagram-media ._aag/,
                .instagram-media ._aag.,
                ._aag,
                ._aah,
                ._aai,
                ._aaj,
                ._aak0,
                ._aak1,
                ._aak2,
                ._aak3,
                ._aak4,
                ._aak5,
                ._aak6,
                ._aak7,
                ._aak8,
                ._aak9 {
                  display: none !important;
                }
              `}
            </style>
            <Box
              sx={{
                width: '100vw',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden',
                padding: '0 16px'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  transition: 'transform 0.3s ease',
                  transform: `translateX(-${currentIndex * (280 + 16)}px)`,
                  width: 'fit-content'
                }}
              >
                {instagramPosts.map((post) => (
                  <Box
                    key={post.id}
                    sx={{
                      width: '280px',
                      flexShrink: 0,
                      transition: 'transform 0.3s ease',
                      padding: '0 8px'
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '450px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <blockquote
                          className="instagram-media"
                          data-instgrm-captioned
                          data-instgrm-permalink={post.permalink}
                          data-instgrm-version="14"
                          style={{
                            background: '#FFF',
                            border: 0,
                            borderRadius: '3px',
                            boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                            margin: 0,
                            maxWidth: '100%',
                            minWidth: '100%',
                            padding: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Navigation Arrows */}
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  },
                  zIndex: 1
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  },
                  zIndex: 1
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Social Media Links */}
          <Grid container spacing={4} justifyContent="center">
            {socialMediaPlatforms.map((platform) => (
              <Grid item key={platform.name}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <IconButton
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px) scale(1.1)',
                        backgroundColor: platform.color,
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }
                    }}
                    onClick={() => platform.link && window.open(platform.link, '_blank')}
                  >
                    <platform.icon 
                      sx={{ 
                        fontSize: 30,
                        color: platform.color,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </IconButton>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Montserrat, sans-serif',
                      '&:hover': {
                        color: platform.color
                      }
                    }}
                  >
                    {platform.name}
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

export default SocialMedia 