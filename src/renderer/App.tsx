import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const POSWindow: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate total whenever cart changes
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {/* Product Search and List */}
        <Grid item xs={8}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ mb: 2 }}
            />
            <List>
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(product => (
                  <ListItem
                    key={product.id}
                    secondaryAction={
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => addToCart(product)}
                      >
                        Add
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={product.name}
                      secondary={`₹${product.price}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* Cart */}
        <Grid item xs={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cart
            </Typography>
            <List>
              {cart.map(item => (
                <React.Fragment key={item.id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={`₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="h6">
                Total: ₹{total}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={cart.length === 0}
              >
                Process Payment
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POSWindow; 