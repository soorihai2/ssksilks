import React, { useState, useEffect } from 'react'
import { Box, Container, CircularProgress, Typography, useMediaQuery } from '@mui/material'
import HeroBanner from '../features/HeroBanner'
import FeaturedProducts from '../features/FeaturedProducts'
import SareeCategories from '../features/SareeCategories'
import BrandStory from '../features/BrandStory'
import SocialMedia from '../features/SocialMedia'
import Newsletter from '../features/Newsletter'
import WhyChooseUs from '../features/WhyChooseUs'
import CustomerReviews from '../features/CustomerReviews'
import TrendingProducts from '../features/TrendingProducts'
import BrandCommitment from '../features/BrandCommitment'
import ScrollToTop from '../shared/ScrollToTop'
import { productApi, categoryApi } from '../../services/api'
import { Product } from '../../types'
import { useCart } from '../../contexts/CartContext'
import Offers from '../features/Offers'
import { motion } from 'framer-motion'
import { CartItem } from '../../contexts/CartContext'

const MotionContainer = motion.create(Container)

interface Category {
  id: string
  name: string
  description: string
  image: string
  subcategories?: Category[]
}

const HomePage: React.FC = () => {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width:600px)')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productApi.getAll(),
          categoryApi.getAll()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (err) {
        setError('Failed to fetch data')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images || [],
      image: product.images?.[0] || '',
      categoryId: product.categoryId,
      sku: product.sku || '',
      stock: product.stock,
      quantity: 1,
      featured: product.featured || false,
      trending: product.trending || false,
      description: product.description || '',
      rating: product.rating || 0,
      specifications: product.specifications || {}
    };
    addItem(cartItem);
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box id="back-to-top-anchor" />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Box>
          <HeroBanner isVisible={true} />
        </Box>
      </motion.div>
      
      {/* Featured Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ backgroundColor: '#f5f5f5', width: '100%' }}>
          <MotionContainer 
            maxWidth={false} 
            sx={{ width: '100%' }}
          >
            <FeaturedProducts 
              products={products}
              onAddToCart={handleAddToCart}
            />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Offers Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ width: '100%' }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%' }}>
            <Offers isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Saree Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ backgroundColor: '#fff', width: '100%' }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%' }}>
            <SareeCategories categories={categories} isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Brand Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ width: '100%' }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%' }}>
            <BrandStory isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Why Choose Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ backgroundColor: '#fff', width: '100%' }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%' }}>
            <WhyChooseUs isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Customer Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ width: '100%' }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%' }}>
            <CustomerReviews isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Trending Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ backgroundColor: '#f5f5f5', width: '100%', p: 0 }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%', p: 0 }}>
            <TrendingProducts 
              onAddToCart={handleAddToCart}
              isVisible={true}
            />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Brand Commitment Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ width: '100%', p: 0 }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%', p: 0 }}>
            <BrandCommitment isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Social Media Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ backgroundColor: '#f5f5f5', width: '100%', p: 0 }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%', p: 0 }}>
            <SocialMedia isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ width: '100%', p: 0 }}>
          <MotionContainer maxWidth={false} sx={{ width: '100%', p: 0 }}>
            <Newsletter isVisible={true} />
          </MotionContainer>
        </Box>
      </motion.div>

      <ScrollToTop />
    </Box>
  )
}

export default HomePage 