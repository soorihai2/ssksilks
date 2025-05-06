import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Badge,
  Paper,
  Fade
} from '@mui/material';
import {
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useCart } from "../../contexts/CartContext";

const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCart();

  // Calculate total items including quantities
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <Box
            onClick={() => navigate('/cart')}
            sx={{
              p: 2,
              bgcolor: '#E31C79',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
            }}
          >
            <Badge
              badgeContent={totalItems}
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 3,
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  padding: '0 4px',
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                }
              }}
            >
              <CartIcon sx={{ fontSize: 30 }} />
            </Badge>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default FloatingCart; 