import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  LinearProgress,
  Tooltip,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon
} from '@mui/icons-material'
import axios from 'axios'
import { productApi } from '../../../services/api'
import { Product } from '../../types'
import { toast } from 'react-toastify'

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await productApi.getAll()
      setProducts(data)
      toast.success('Inventory data loaded successfully')
    } catch (err) {
      const errorMessage = 'Failed to fetch inventory data'
      setError(errorMessage)
      console.error('Error fetching products:', err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      toast.warning('Some products are out of stock')
      return { color: 'error', label: 'Out of Stock', icon: <WarningIcon /> }
    }
    if (stock < 10) {
      toast.warning('Some products have low stock')
      return { color: 'warning', label: 'Low Stock', icon: <WarningIcon /> }
    }
    return { color: 'success', label: 'In Stock', icon: <CheckCircleIcon /> }
  }

  const getStockPercentage = (stock: number) => {
    const maxStock = 100 // You might want to make this configurable
    return (stock / maxStock) * 100
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  const lowStockProducts = products.filter(p => p.stock < 10)
  const outOfStockProducts = products.filter(p => p.stock === 0)
  const totalProducts = products.length

  // Show notifications for low stock and out of stock products
  useEffect(() => {
    if (lowStockProducts.length > 0) {
      toast.warning(`${lowStockProducts.length} products have low stock`)
    }
    if (outOfStockProducts.length > 0) {
      toast.error(`${outOfStockProducts.length} products are out of stock`)
    }
  }, [lowStockProducts.length, outOfStockProducts.length])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Inventory Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #E31C79 0%, #FF4D8D 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Total Products</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>{totalProducts}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Low Stock Items</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>{lowStockProducts.length}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(lowStockProducts.length / totalProducts) * 100} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Out of Stock</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>{outOfStockProducts.length}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(outOfStockProducts.length / totalProducts) * 100} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Total Stock</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {products.reduce((acc, product) => acc + product.stock, 0).toLocaleString()}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(products.reduce((acc, product) => acc + product.stock, 0) / (totalProducts * 100)) * 100} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const status = getStockStatus(product.stock)
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.categoryId}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{product.stock}</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={getStockPercentage(product.stock)}
                          sx={{ 
                            width: 100,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(227, 28, 121, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: status.color === 'error' ? '#F44336' : 
                                      status.color === 'warning' ? '#FF9800' : '#4CAF50'
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        color={status.color as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Stock">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Stock">
                        <IconButton size="small">
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Inventory 