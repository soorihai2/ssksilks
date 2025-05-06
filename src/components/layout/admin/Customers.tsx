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
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  CircularProgress,
  Pagination,
  Tabs,
  Tab
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import axios from 'axios'
import { orderApi } from '../../../services/api'
import { newsletterApi, NewsletterSubscription } from '../../../services/api/newsletter'
import { posCustomerApi, POSCustomer } from '../../../services/api/posCustomerApi'
import { toast } from 'react-toastify'

interface Customer {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  totalOrders?: number
  totalSpent?: number
  lastOrderDate?: string
  type?: 'pos' | 'online'
  isNew?: boolean
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [activeTab, setActiveTab] = useState(0)
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      
      // Fetch both regular orders and POS customers
      const [orders, posCustomers] = await Promise.all([
        orderApi.getAll(),
        posCustomerApi.getAll()
      ])
      
      // Process orders to get unique customers with their details
      const customerMap = new Map<string, Customer>()
      
      // Process regular orders
      orders.forEach((order: any) => {
        const shippingAddress = order.shippingAddress
        
        if (!shippingAddress?.email) {
          return
        }

        if (!customerMap.has(shippingAddress.email)) {
          customerMap.set(shippingAddress.email, {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: {
              street: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              pincode: shippingAddress.pincode,
              country: shippingAddress.country
            },
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.createdAt,
            type: 'online'
          })
        }

        const customerData = customerMap.get(shippingAddress.email)!
        customerData.totalOrders = (customerData.totalOrders || 0) + 1
        customerData.totalSpent = (customerData.totalSpent || 0) + order.total
        
        if (new Date(order.createdAt) > new Date(customerData.lastOrderDate || '')) {
          customerData.lastOrderDate = order.createdAt
        }
      })

      // Add POS customers (only if they don't exist as online customers)
      posCustomers.forEach((posCustomer: POSCustomer) => {
        const key = posCustomer.phone // Use phone as the key since POS customers don't have email
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: posCustomer.id,
            name: posCustomer.name || 'Walk-in Customer',
            phone: posCustomer.phone,
            totalOrders: posCustomer.totalOrders || 0,
            totalSpent: posCustomer.totalSpent || 0,
            type: 'pos',
            isNew: posCustomer.isNew
          })
        }
      })

      const customersArray = Array.from(customerMap.values())
      setCustomers(customersArray)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewMode('view')
    setOpenDialog(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewMode('edit')
    setOpenDialog(true)
  }

  const handleDeleteCustomer = async (identifier: string) => {
    if (!identifier) return;
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        // Implement delete functionality if needed
        console.log('Delete customer:', identifier);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleSaveCustomer = async () => {
    if (!selectedCustomer) return

    try {
      // Implement update functionality if needed
      console.log('Update customer:', selectedCustomer)
      setOpenDialog(false)
      fetchCustomers()
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await newsletterApi.getSubscriptions({
        page: page + 1, // Adding 1 because page is 0-based
        limit: 10,
        status: undefined // Show all subscriptions
      });
      setSubscriptions(data.subscriptions);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchSubscriptions();
    }
  }, [page, activeTab]);

  const handleUnsubscribe = async (email: string) => {
    if (window.confirm('Are you sure you want to unsubscribe this email?')) {
      try {
        await newsletterApi.unsubscribe(email);
        toast.success('Successfully unsubscribed');
        fetchSubscriptions(); // Refresh the list
      } catch (error) {
        toast.error('Failed to unsubscribe');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label="Customers" />
        <Tab label="Newsletter Subscriptions" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Box p={3}>
          <Typography variant="h4" gutterBottom>
            Customers
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Total Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Last Order</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => (
                    <TableRow key={customer.id || customer.email || customer.phone}>
                      <TableCell>{customer.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Box>
                          {customer.type !== 'pos' && customer.email && (
                            <Typography variant="body2" color="textSecondary">
                              {customer.email}
                            </Typography>
                          )}
                          {customer.phone && (
                            <Typography variant="body2" color="textSecondary">
                              {customer.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {customer.type === 'pos' ? (
                          <Box display="flex" gap={1}>
                            <Chip 
                              label="POS" 
                              color="secondary" 
                              size="small"
                              sx={{ bgcolor: '#E31C79' }}
                            />
                            {customer.isNew && (
                              <Chip 
                                label="New" 
                                color="primary" 
                                size="small" 
                              />
                            )}
                          </Box>
                        ) : (
                          <Chip 
                            label="Online" 
                            color="default" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.totalOrders || 0} 
                          color="primary" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>₹{(customer.totalSpent || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {customer.lastOrderDate 
                          ? new Date(customer.lastOrderDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewCustomer(customer)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton onClick={() => handleEditCustomer(customer)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => {
                          const identifier = customer.type === 'pos' ? customer.phone : customer.email;
                          if (identifier) {
                            handleDeleteCustomer(identifier);
                          }
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={customers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box p={3}>
          <Typography variant="h4" gutterBottom>
            Newsletter Subscriptions
          </Typography>
          
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>{subscription.email}</TableCell>
                        <TableCell>
                          {new Date(subscription.subscriptionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{subscription.status}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleUnsubscribe(subscription.email)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </TabPanel>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewMode === 'view' ? 'Customer Details' : 'Edit Customer'}
          {selectedCustomer?.type === 'pos' && (
            <Chip 
              label="POS Customer" 
              color="secondary" 
              size="small"
              sx={{ ml: 1, bgcolor: '#E31C79' }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedCustomer.name || ''}
                  disabled={viewMode === 'view'}
                  onChange={(e) => setSelectedCustomer({
                    ...selectedCustomer,
                    name: e.target.value
                  })}
                />
              </Grid>
              {selectedCustomer.type !== 'pos' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={selectedCustomer.email || ''}
                    disabled={true}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedCustomer.phone || ''}
                  disabled={viewMode === 'view'}
                  onChange={(e) => setSelectedCustomer({
                    ...selectedCustomer,
                    phone: e.target.value
                  })}
                />
              </Grid>
              {selectedCustomer.type !== 'pos' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={selectedCustomer.address ? 
                      `${selectedCustomer.address.street || ''}, ${selectedCustomer.address.city || ''}, ${selectedCustomer.address.state || ''}, ${selectedCustomer.address.pincode || ''}, ${selectedCustomer.address.country || ''}` 
                      : ''}
                    disabled={viewMode === 'view'}
                    onChange={(e) => setSelectedCustomer({
                      ...selectedCustomer,
                      address: {
                        ...selectedCustomer.address,
                        street: e.target.value
                      }
                    })}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Total Orders"
                  value={selectedCustomer.totalOrders || 0}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Total Spent"
                  value={`₹${(selectedCustomer.totalSpent || 0).toLocaleString()}`}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Order"
                  value={selectedCustomer.lastOrderDate 
                    ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString()
                    : 'N/A'}
                  disabled={true}
                />
              </Grid>
              {selectedCustomer.type === 'pos' && selectedCustomer.isNew && (
                <Grid item xs={12}>
                  <Chip 
                    label="New POS Customer" 
                    color="primary" 
                    sx={{ mt: 1 }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {viewMode === 'edit' && (
            <Button onClick={handleSaveCustomer} variant="contained" color="primary">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Customers 