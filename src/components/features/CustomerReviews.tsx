import React from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Fade } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import VerifiedIcon from '@mui/icons-material/Verified'
import { MEDIA_BASE_URL } from '../../config'

interface CustomerReviewsProps {
  isVisible: boolean
}

const reviews = [
  {
    name: 'Joys Maria',
    rating: 5,
    comment: 'The quality of the silk sarees is exceptional. The craftsmanship and attention to detail are truly remarkable.',
    image: `${MEDIA_BASE_URL}/images/review-1.png`
  },
  {
    name: 'Jyoti Dash',
    rating: 5,
    comment: 'I love how they maintain traditional designs while incorporating modern elements. The collection is stunning!',
    image: `${MEDIA_BASE_URL}/images/review-2.png`
  },
  {
    name: 'Divya Chavan',
    rating: 5,
    comment: 'The customer service is outstanding. They helped me find the perfect saree for my wedding.',
    image: `${MEDIA_BASE_URL}/images/review-3.png`
  },
  {
    name: 'Ahuti',
    rating: 5,
    comment: 'The variety of designs and colors is amazing. I always find something unique here.',
    image: `${MEDIA_BASE_URL}/images/review-4.png`
  }
]

const CustomerReviews: React.FC<CustomerReviewsProps> = ({ isVisible }) => {
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
            CUSTOMER REVIEWS
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
            What our customers say about us
          </Typography>
          <Grid container spacing={4}>
            {reviews.map((review) => (
              <Grid item xs={12} md={4} key={review.name}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    },
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Box
                        component="img"
                        src={review.image}
                        alt={review.name}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          mr: 2,
                          objectFit: 'cover'
                        }}
                      />
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: 'Cormorant Garamond, serif',
                            color: '#E31C79'
                          }}
                        >
                          {review.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {[...Array(review.rating)].map((_, index) => (
                            <StarIcon 
                              key={index}
                              sx={{ 
                                color: '#FFD700',
                                fontSize: 20
                              }}
                            />
                          ))}
                          <VerifiedIcon 
                            sx={{ 
                              color: '#E31C79',
                              fontSize: 16,
                              ml: 1
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      "{review.comment}"
                    </Typography>
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

export default CustomerReviews 