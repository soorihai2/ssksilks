import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import Header from './components/layout/Header'
import HomePage from './components/pages/HomePage'
import UserLogin from './components/pages/UserLogin'
import CartPage from './components/CartPage'
import ProductDetailPage from './components/pages/ProductDetailPage'
import Footer from './components/layout/Footer'
import { CartProvider } from './contexts/CartContext'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AllProducts from './components/pages/AllProducts'
import OrderSuccessPage from './components/pages/OrderSuccessPage'
import { AuthProvider } from './contexts/AuthContext'
import PaymentFailure from './components/pages/PaymentFailure'
import FloatingCart from './components/features/FloatingCart'
import { Provider } from 'react-redux'
import { store } from './store/store'
import OrderDetailsPage from './components/pages/OrderDetailsPage'
import AboutUs from './components/pages/AboutUs'
import ContactUs from './components/pages/ContactUs'
import ShippingPolicy from './components/pages/ShippingPolicy'
import RefundPolicy from './components/pages/RefundPolicy'
import TermsAndConditions from './components/pages/TermsAndConditions'
import PrivacyPolicy from './components/pages/PrivacyPolicy'
import FAQ from './components/pages/FAQ'
import AdminLayout from './components/layout/admin/AdminLayout'
import Dashboard from './components/layout/admin/Dashboard'
import Orders from './components/layout/admin/Orders'
import Customers from './components/layout/admin/Customers'
import Categories from './components/layout/admin/Categories'
import Settings from './components/layout/admin/Settings'
import AdminProducts from './components/layout/admin/products/AdminProducts'
import OrderConfirmation from './components/OrderConfirmation'
import CustomerLayout from './components/layout/customer/CustomerLayout'
import CustomerOrders from './components/pages/CustomerOrders'
import CustomerProfile from './components/pages/CustomerProfile'
import CustomerAddresses from './components/pages/CustomerAddresses'
import CustomerSettings from './components/pages/CustomerSettings'
import UserRegister from './components/pages/UserRegister'
import CustomerTrackOrders from './components/pages/CustomerTrackOrders'
import Invoice from './components/layout/admin/Invoice'
import CategoryPage from './components/pages/CategoryPage'
import type { AddressResponse } from './types/api'
import WebsiteLaunchPopup from './components/features/WebsiteLaunchPopup'

const theme = createTheme({
  palette: {
    primary: {
      main: '#E31C79',
    },
    secondary: {
      main: '#333333',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h1: {
      fontFamily: 'Titan One, cursive',
    },
    h2: {
      fontFamily: 'Titan One, cursive',
    },
    h3: {
      fontFamily: 'Titan One, cursive',
    },
    h4: {
      fontFamily: 'Titan One, cursive',
    },
    h5: {
      fontFamily: 'Titan One, cursive',
    },
    h6: {
      fontFamily: 'Titan One, cursive',
    }
  },
})

// Protected Route component for admin routes
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

// Protected Route component for customer routes
const ProtectedCustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const customerToken = localStorage.getItem('customerToken');
  return customerToken ? <>{children}</> : <Navigate to="/login" />;
};

// Create a PublicLayout component
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header />
      <Box component="main" sx={{ 
        flex: '1 0 auto', 
        width: '100%',
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Box>
      <Footer />
      <FloatingCart />
    </Box>
  );
};

// Create error element component
const ErrorElement = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5" color="error" gutterBottom>
      Something went wrong!
    </Typography>
    <Button 
      variant="contained" 
      onClick={() => window.location.href = '/'}
      sx={{ mt: 2 }}
    >
      Return to Home
    </Button>
  </Box>
);

const App: React.FC = () => {
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [showLaunchPopup, setShowLaunchPopup] = useState(false);

  useEffect(() => {
    // Check if the popup has been shown before
    const hasSeenPopup = localStorage.getItem('hasSeenLaunchPopup');
    if (!hasSeenPopup) {
      setShowLaunchPopup(true);
      localStorage.setItem('hasSeenLaunchPopup', 'true');
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
      errorElement: <ErrorElement />
    },
    {
      path: "/admin",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "orders", element: <Orders /> },
        { path: "customers", element: <Customers /> },
        { path: "categories", element: <Categories /> },
        { path: "settings", element: <Settings /> },
        { path: "products", element: <AdminProducts /> },
      ],
    },
    {
      path: "/customer",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <ProtectedCustomerRoute>
                  <CustomerLayout />
                </ProtectedCustomerRoute>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
      children: [
        { index: true, element: <Navigate to="orders" replace /> },
        { path: "orders", element: <CustomerOrders /> },
        { path: "track-orders", element: <CustomerTrackOrders /> },
        { path: "profile", element: <CustomerProfile /> },
        { path: "addresses", element: <CustomerAddresses /> },
        { path: "settings", element: <CustomerSettings /> },
      ],
    },
    {
      path: "/login",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <UserLogin />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/product/:productId",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <ProductDetailPage />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/cart",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
        <AuthProvider>
          <CartProvider>
                <PublicLayout>
            <CartPage 
              savedAddresses={savedAddresses} 
              setSavedAddresses={setSavedAddresses}
            />
                </PublicLayout>
          </CartProvider>
        </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/checkout",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <CartPage />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/order-success",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <OrderSuccessPage />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/payment-failure",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <PaymentFailure />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/products",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <AllProducts />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/category/:categoryId",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <CategoryPage />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/order/:orderId",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <OrderDetailsPage />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/order-confirmation/:id",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <OrderConfirmation />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/about",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <AboutUs />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/contact",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <ContactUs />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/shipping-policy",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <ShippingPolicy />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/refund-policy",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <RefundPolicy />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/terms",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <TermsAndConditions />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/privacy",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <PrivacyPolicy />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/faq",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <PublicLayout>
                  <FAQ />
                </PublicLayout>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
    },
    {
      path: "/register",
      element: <UserRegister />,
    },
    {
      path: "/invoice",
      element: (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <CartProvider>
                <Invoice />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      ),
      errorElement: <ErrorElement />
    },
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true
    }
  });

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <WebsiteLaunchPopup 
              open={showLaunchPopup} 
              onClose={() => setShowLaunchPopup(false)} 
            />
            <ToastContainer position="bottom-right" />
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App
