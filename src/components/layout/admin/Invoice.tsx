import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
  styled,
  CircularProgress,
  TableFooter,
  Alert
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

const PrintButton = styled(Button)`
  @media print {
    display: none;
  }
`;

const PrintableArea = styled(Paper)`
  padding: 40px;
  margin: 20px;
  @media print {
    margin: 0;
    padding: 20px;
    box-shadow: none;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: white;
  }
`;

const PrintStyles = styled('style')`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
  
  @media print {
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', sans-serif;
    }
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
  }
`;

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Something went wrong</Typography>
          <Typography variant="body2">{error?.message}</Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

const Invoice: React.FC = () => {
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoiceData = () => {
      console.log('Starting to load invoice data...');
      
      // First try to get data from location state
      if (location.state) {
        console.log('Loading from location state:', location.state);
        setInvoiceData(location.state);
        setIsLoading(false);
        return;
      }

      // If no location state, try to get from localStorage
      const storedData = localStorage.getItem('currentInvoiceData');
      console.log('Stored invoice data:', storedData);
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log('Parsed invoice data:', parsedData);
          
          // Validate the data structure
          if (!parsedData || !parsedData.items || !Array.isArray(parsedData.items)) {
            console.error('Invalid invoice data format:', parsedData);
            throw new Error('Invalid invoice data format');
          }
          
          // Ensure all required fields are present
          const validatedData = {
            ...parsedData,
            orderNumber: parsedData.orderNumber || 'N/A',
            createdAt: parsedData.createdAt || new Date().toISOString(),
            customer: {
              name: parsedData.customer?.name || 'N/A',
              phone: parsedData.customer?.phone || 'N/A'
            },
            items: parsedData.items.map((item: any) => ({
              product: {
                name: item.product?.name || 'Unknown Product',
                price: item.product?.price || 0
              },
              quantity: item.quantity || 0
            })),
            total: parsedData.total || 0,
            paymentMode: parsedData.paymentMode || 'N/A',
            discountPercentage: parsedData.discountPercentage || '0',
            cashDiscount: parsedData.cashDiscount || '0'
          };
          
          console.log('Validated invoice data:', validatedData);
          setInvoiceData(validatedData);
          
          // Only remove the data after successful print
          const handlePrint = () => {
            window.print();
            localStorage.removeItem('currentInvoiceData');
          };
          
          // Update the print button click handler
          const printButton = document.querySelector('.print-button');
          if (printButton) {
            printButton.addEventListener('click', handlePrint);
          }
        } catch (err) {
          console.error('Error parsing invoice data:', err);
          setError('Invalid invoice data format');
        }
      } else {
        // Try to get data from lastPOSState if currentInvoiceData is not available
        const lastPOSState = localStorage.getItem('lastPOSState');
        console.log('No invoice data found, checking lastPOSState:', lastPOSState);
        
        if (lastPOSState) {
          try {
            const posState = JSON.parse(lastPOSState);
            console.log('Parsed lastPOSState:', posState);
            
            // Convert POS state to invoice data format
            const invoiceData = {
              orderNumber: `POS-${new Date().getTime()}`,
              createdAt: new Date().toISOString(),
              customer: {
                name: posState.customer?.name || 'N/A',
                phone: posState.customer?.phone || 'N/A'
              },
              items: posState.cart.map((item: any) => ({
                product: {
                  name: item.product?.name || 'Unknown Product',
                  price: item.product?.price || 0
                },
                quantity: item.quantity || 0
              })),
              total: posState.cartTotal || 0,
              paymentMode: posState.paymentMode || 'N/A',
              discountPercentage: posState.discountPercentage || '0',
              cashDiscount: posState.cashDiscount || '0'
            };
            
            console.log('Converted POS state to invoice data:', invoiceData);
            setInvoiceData(invoiceData);
          } catch (err) {
            console.error('Error converting POS state to invoice data:', err);
            setError('No invoice data found. Please complete a purchase to generate an invoice.');
          }
        } else {
          console.log('No invoice data found in localStorage');
          setError('No invoice data found. Please complete a purchase to generate an invoice.');
        }
      }
      setIsLoading(false);
    };

    // Add a small delay to ensure localStorage is ready
    setTimeout(loadInvoiceData, 100);
  }, [location.state]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Roboto', sans-serif;
              }
              .printable-area {
                padding: 40px;
                margin: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 20px solid #0d47a1;
              }
              .no-print {
                display: none !important;
              }
              .print-only {
                display: block !important;
              }
            </style>
          </head>
          <body>
            <div class="printable-area">
              ${document.querySelector('.printable-area')?.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // Calculate subtotal and discounts
  const subtotal = invoiceData?.items?.reduce((sum: number, item: { product: { price: number }; quantity: number }) => 
    sum + (item.product.price * item.quantity), 0) || 0;
  
  const discountAmount = invoiceData?.discountPercentage ? 
    (subtotal * Number(invoiceData.discountPercentage)) / 100 : 0;
  
  const cashDiscountAmount = invoiceData?.cashDiscount ? 
    Number(invoiceData.cashDiscount) : 0;
  
  const total = subtotal - discountAmount - cashDiscountAmount;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoiceData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column">
        <Typography color="error" variant="h6">{error || 'No invoice data available'}</Typography>
        
        {/* Enhanced Debug Information */}
        <Paper elevation={3} sx={{ p: 3, mt: 3, maxWidth: '800px', width: '100%' }}>
          <Typography variant="h6" gutterBottom>Debug Information</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Location State:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {JSON.stringify(location.state, null, 2) || 'No location state'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">LocalStorage Data:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {localStorage.getItem('currentInvoiceData') || 'No localStorage data'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Loading State:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {isLoading ? 'Loading...' : 'Not Loading'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Error State:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {error || 'No error'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Current URL:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {window.location.href}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">LocalStorage Keys:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {Object.keys(localStorage).join(', ') || 'No localStorage keys'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Component Mount Time:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {new Date().toISOString()}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Browser Information:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {navigator.userAgent}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Last POS Window State:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              {localStorage.getItem('lastPOSState') || 'No POS state found'}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              // Clear localStorage and reload
              localStorage.removeItem('currentInvoiceData');
              localStorage.removeItem('lastPOSState');
              window.location.reload();
            }}
          >
            Clear Cache & Reload
          </Button>

          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => {
              // Open POS window in new tab
              window.open('/pos', '_blank');
            }}
          >
            Open POS Window
          </Button>

          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => window.location.href = '/'} 
          >
            Return to Home
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: 3, 
      bgcolor: '#f8f9fa',
      fontFamily: 'Roboto, sans-serif'
    }}>
      <PrintStyles />
      <PrintButton
        variant="contained"
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        sx={{ 
          mb: 2, 
          position: 'fixed', 
          top: 20, 
          right: 20,
          bgcolor: '#1976d2',
          '&:hover': {
            bgcolor: '#1565c0'
          }
        }}
        className="no-print"
      >
        Print Invoice
      </PrintButton>

      <PrintableArea className="printable-area" sx={{
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        p: 4,
        maxWidth: '800px',
        margin: '0 auto',
        border: '20px solid #0d47a1',
        '@media print': {
          border: '20px solid #0d47a1',
          boxShadow: 'none'
        }
      }}>
        {/* Header */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img src="/logo.png" alt="Logo" style={{ width: 80, height: 80 }} />
              <Box>
                <Typography variant="h4" gutterBottom sx={{ 
                  color: '#1a237e',
                  fontWeight: 700,
                  fontFamily: 'Roboto, sans-serif'
                }}>
                  Sathyabhama Silks
                </Typography>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  123 Main Street
                </Typography>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  Chennai, Tamil Nadu
                </Typography>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  Phone: +91 1234567890
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" gutterBottom sx={{ 
                color: '#1a237e',
                fontWeight: 700,
                fontFamily: 'Roboto, sans-serif'
              }}>
                Retail Invoice
              </Typography>
              <Typography variant="body1" sx={{ color: '#546e7a' }}>
                Invoice #: {invoiceData?.orderNumber || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#546e7a' }}>
                Date: {invoiceData?.createdAt ? new Date(invoiceData.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: '#e0e0e0' }} />

        {/* Customer Details */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#1a237e',
              fontWeight: 600,
              fontFamily: 'Roboto, sans-serif'
            }}>
              Customer Details
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ color: '#37474f' }}>
                Phone: {invoiceData?.customer?.phone || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Items Table */}
        <TableContainer component={Paper} elevation={0} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ 
                  color: '#1a237e',
                  fontWeight: 600,
                  fontFamily: 'Roboto, sans-serif'
                }}>Item</TableCell>
                <TableCell align="right" sx={{ 
                  color: '#1a237e',
                  fontWeight: 600,
                  fontFamily: 'Roboto, sans-serif'
                }}>Quantity</TableCell>
                <TableCell align="right" sx={{ 
                  color: '#1a237e',
                  fontWeight: 600,
                  fontFamily: 'Roboto, sans-serif'
                }}>Price</TableCell>
                <TableCell align="right" sx={{ 
                  color: '#1a237e',
                  fontWeight: 600,
                  fontFamily: 'Roboto, sans-serif'
                }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData?.items?.map((item: { product: { name: string; price: number }; quantity: number }, index: number) => (
                <TableRow key={index} sx={{ 
                  '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}>
                  <TableCell sx={{ color: '#37474f' }}>{item?.product?.name || 'Unknown Product'}</TableCell>
                  <TableCell align="right" sx={{ color: '#37474f' }}>{item?.quantity || 0}</TableCell>
                  <TableCell align="right" sx={{ color: '#37474f' }}>₹{(item?.product?.price || 0).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ color: '#37474f' }}>
                    ₹{((item?.product?.price || 0) * (item?.quantity || 0)).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell colSpan={3} align="right">
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    color: '#1a237e',
                    fontFamily: 'Roboto, sans-serif'
                  }}>
                    Total
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    color: '#1a237e',
                    fontFamily: 'Roboto, sans-serif'
                  }}>
                    ₹{total.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Paper elevation={0} sx={{ 
            width: '300px', 
            p: 2, 
            bgcolor: '#f5f5f5',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#37474f' }}>Subtotal:</Typography>
              <Typography sx={{ color: '#37474f' }}>₹{subtotal.toLocaleString()}</Typography>
            </Box>
            {discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#37474f' }}>Discount ({invoiceData?.discountPercentage}%):</Typography>
                <Typography sx={{ color: '#d32f2f' }}>-₹{discountAmount.toLocaleString()}</Typography>
              </Box>
            )}
            {cashDiscountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#37474f' }}>Cash Discount:</Typography>
                <Typography sx={{ color: '#d32f2f' }}>-₹{cashDiscountAmount.toLocaleString()}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2, bgcolor: '#e0e0e0' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ 
                color: '#1a237e',
                fontWeight: 700,
                fontFamily: 'Roboto, sans-serif'
              }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#1a237e',
                fontWeight: 700,
                fontFamily: 'Roboto, sans-serif'
              }}>
                ₹{total.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: '#546e7a' }}>
              Payment Mode: {invoiceData?.paymentMode || 'N/A'}
            </Typography>
          </Paper>
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 4, bgcolor: '#e0e0e0' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#546e7a' }}>
            Thank you for your business!
          </Typography>
          <Typography variant="body2" sx={{ color: '#546e7a' }}>
            For any queries, please contact us at support@sathyabhamasilks.com
          </Typography>
        </Box>
      </PrintableArea>
    </Box>
  );
};

const InvoiceWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <Invoice />
  </ErrorBoundary>
);

export default InvoiceWithErrorBoundary; 