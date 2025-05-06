import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Confetti from 'react-confetti';
import { useSelector } from 'react-redux';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderItems = location.state?.items;
  const orderTotal = location.state?.total;
  const customerEmail = location.state?.shippingAddress?.email;
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [emailSent, setEmailSent] = useState(true); // Set to true since email is sent in CartPage
  const [emailError, setEmailError] = useState<string | null>(null);
  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce the resize event
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100); // Wait 100ms after the last resize event
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
        colors={['#E31C79', '#1a1f36', '#4CAF50', '#FFC107']}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          pointerEvents: 'none',
          width: `${windowSize.width}px`,
          height: `${windowSize.height}px`
        }}
      />

      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '90%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <CheckCircleIcon
          sx={{
            fontSize: 180,
            color: '#4CAF50',
            mb: 3,
            animation: 'scaleIn 0.5s ease-out',
          }}
        />

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: '#1a1f36',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Order Placed Successfully!
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#666',
            mb: 4,
          }}
        >
          Thank you for your purchase
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#666',
            mb: 4,
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          Order confirmation has been sent to <strong>{customerEmail}</strong>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#E31C79',
              '&:hover': {
                backgroundColor: '#c4186a',
              },
            }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate(`/order/${orderId}`)}
            sx={{
              borderColor: '#E31C79',
              color: '#E31C79',
              '&:hover': {
                borderColor: '#c4186a',
                backgroundColor: 'rgba(227, 28, 121, 0.04)',
              },
            }}
          >
            View Order
          </Button>
        </Box>
      </Paper>

      <style>
        {`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default OrderSuccessPage; 