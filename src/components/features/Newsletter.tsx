import React, { useState } from 'react'
import { Box, Container, Typography, TextField, Button, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'
import { newsletterApi } from '../../services/api'

interface NewsletterProps {
  isVisible: boolean;
}

const Newsletter: React.FC<NewsletterProps> = ({ isVisible }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await newsletterApi.subscribe(email);
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#E31C79',
        py: 8,
        width: '100%',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease-out',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          margin: 0,
          padding: 0,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            mb: 2,
            fontFamily: 'Playfair Display, serif',
          }}
        >
          Subscribe to Our Newsletter
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            mb: 4,
            opacity: 0.9,
            maxWidth: '600px',
            mx: 'auto',
            px: 2,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Stay updated with our latest collections, exclusive offers, and styling tips.
        </Typography>
        <Container 
          maxWidth={false}
          sx={{ 
            width: '100%'
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              maxWidth: '600px',
              mx: 'auto',
              px: 2,
            }}
          >
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              required
              error={!!error}
              helperText={error}
              disabled={isLoading}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: 'white',
                color: '#E31C79',
                px: 4,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                height: '56px',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Subscribe'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Newsletter 