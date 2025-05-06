import React, { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, CircularProgress, IconButton, useTheme, useMediaQuery } from '@mui/material'
import { ProductCard } from '../shared/common/ProductCard'
import { Product } from '../../types'
import { productApi } from '../../services/api'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

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

interface TrendingProductsProps {
  onAddToCart: (product: Product) => void
  isVisible?: boolean
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({ isVisible, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [currentIndex, setCurrentIndex] = useState(0)

  const itemsPerPage = isMobile ? 1 : isTablet ? 2 : 4
  const totalPages = Math.ceil(products.length / itemsPerPage)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const visibleProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  )

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const allProducts = await productApi.getAll()
        const trendingProducts = allProducts.filter((product: Product) => product.trending === true)
        setProducts(trendingProducts)
      } catch (err) {
        setError('Failed to fetch trending products')
        console.error('Error fetching trending products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingProducts()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        position: 'relative',
        py: 8, 
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <BackgroundPattern />
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
            fontFamily: 'Playfair Display, serif'
          }}
        >
          TRENDING PRODUCTS
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ 
            mb: 6, 
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          Our most popular designs
        </Typography>

        <Box sx={{ position: 'relative', px: 4 }}>
          <Grid container spacing={4}>
            {visibleProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard 
                  product={product} 
                  onAddToCart={(product) => onAddToCart(product)}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </Box>

        {/* Dots indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
          {Array.from({ length: totalPages }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: '4px',
                backgroundColor: currentIndex === index ? '#E31C79' : '#ddd',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: currentIndex === index ? '#E31C79' : '#ccc'
                }
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default TrendingProducts