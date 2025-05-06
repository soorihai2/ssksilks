import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import SecurityIcon from '@mui/icons-material/Security'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

const features = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40, color: '#E31C79' }} />,
    title: 'Free Shipping',
    description: 'Free shipping on all orders above ₹999'
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#E31C79' }} />,
    title: 'Secure Payments',
    description: 'All payments are secured and encrypted'
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#E31C79' }} />,
    title: '24/7 Support',
    description: 'Dedicated support team available 24/7'
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 40, color: '#E31C79' }} />,
    title: 'Quality Guarantee',
    description: '100% quality guarantee on all products'
  }
] 