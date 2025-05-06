import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Save as SaveIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Store as StoreIcon,
  LocalOffer as LocalOfferIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '../../../config'

interface Offer {
  id: string;
  name?: string;
  label: string;
  image: string;
  coupon?: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountPercentage?: number;
  validFrom?: string;
  validUntil?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  isAutomatic: boolean;
  automaticSettings?: {
    minOrderValue?: number;
    minItems?: number;
    applicableCategories?: string[];
    applicableProducts?: string[];
  };
}

interface Settings {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    googleMapsLocation: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  };
  payment: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
  };
  offers: Offer[];
}

const Settings = () => {
  const [settings, setSettings] = useState<Settings>({
    store: {
      name: '',
      email: '',
      phone: '',
      address: '',
      logo: '',
      googleMapsLocation: ''
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      fromEmail: '',
      fromName: ''
    },
    payment: {
      razorpayKeyId: '',
      razorpayKeySecret: ''
    },
    offers: []
  });
  const [openOfferModal, setOpenOfferModal] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer>({
    id: '',
    name: '',
    label: '',
    image: '',
    coupon: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    discountPercentage: 0,
    validFrom: '',
    validUntil: '',
    minOrderValue: 0,
    maxDiscount: 0,
    isAutomatic: false,
    automaticSettings: {
      minOrderValue: 0,
      minItems: 0,
      applicableCategories: [],
      applicableProducts: []
    }
  });
  const [offerIndex, setOfferIndex] = useState<number>(-1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings`)
      const data = response.data;
      
      // Ensure all required fields exist and offers is an array
      const formattedData = {
        store: data.store || {
          name: '',
          email: '',
          phone: '',
          address: '',
          logo: '',
          googleMapsLocation: ''
        },
        email: data.email || {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
          fromEmail: '',
          fromName: ''
        },
        payment: data.payment || {
          razorpayKeyId: '',
          razorpayKeySecret: ''
        },
        offers: Array.isArray(data.offers) ? data.offers : []
      };
      
      setSettings(formattedData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    }
  }

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/settings`, settings)
      setSuccess(true)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings')
      toast.error('Failed to save settings')
    }
  }

  const handleChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => {
      if (section === 'offers') {
        return {
          ...prev,
          offers: value
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  }

  const handleOpenOfferModal = (index: number = -1) => {
    if (index >= 0) {
      setCurrentOffer(settings.offers[index]);
      setOfferIndex(index);
    } else {
      setCurrentOffer({
        id: '',
        name: '',
        label: '',
        image: '',
        coupon: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        discountPercentage: 0,
        validFrom: '',
        validUntil: '',
        minOrderValue: 0,
        maxDiscount: 0,
        isAutomatic: false,
        automaticSettings: {
          minOrderValue: 0,
          minItems: 0,
          applicableCategories: [],
          applicableProducts: []
        }
      });
      setOfferIndex(-1);
    }
    setOpenOfferModal(true);
  };

  const handleCloseOfferModal = () => {
    setOpenOfferModal(false);
    setCurrentOffer({
      id: '',
      name: '',
      label: '',
      image: '',
      coupon: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      discountPercentage: 0,
      validFrom: '',
      validUntil: '',
      minOrderValue: 0,
      maxDiscount: 0,
      isAutomatic: false,
      automaticSettings: {
        minOrderValue: 0,
        minItems: 0,
        applicableCategories: [],
        applicableProducts: []
      }
    });
    setOfferIndex(-1);
  };

  const handleSaveOffer = () => {
    const newOffers = [...settings.offers];
    if (offerIndex >= 0) {
      newOffers[offerIndex] = currentOffer;
    } else {
      newOffers.push(currentOffer);
    }
    handleChange('offers', '', newOffers);
    handleCloseOfferModal();
  };

  const handleDeleteOffer = (index: number) => {
    const newOffers = settings.offers.filter((_, i) => i !== index);
    handleChange('offers', '', newOffers);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show loading toast
    const toastId = toast.loading('Uploading image...');

    try {
      // Import and use the settings API service
      const { settingsApi } = await import('../../../services/api/settings');
      
      // Log the file details for debugging
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Upload the image and get the path
      const imagePath = await settingsApi.uploadOfferImage(file);
      
      console.log('Image uploaded successfully, path:', imagePath);
      
      // Update the current offer with the new image path
      setCurrentOffer({
        ...currentOffer,
        image: imagePath
      });
      
      // Show success toast
      toast.update(toastId, { 
        render: 'Image uploaded successfully', 
        type: 'success', 
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Get detailed error message
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Error: ${error.message || 'Unknown error'}`;
      }
      
      // Show error toast with more specific message
      toast.update(toastId, { 
        render: errorMessage, 
        type: 'error', 
        isLoading: false,
        autoClose: 5000
      });
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Remove any /api/ prefix that might be in the path
    let cleanPath = imagePath;
    if (cleanPath.includes('/api/')) {
      cleanPath = cleanPath.replace('/api/', '/');
    }
    
    // Ensure extension is .jpg for offers
    if (cleanPath.endsWith('.jpeg')) {
      cleanPath = cleanPath.replace(/\.jpeg$/, '.jpg');
    }
    
    // Check if the path already includes /images/offers/
    if (cleanPath.includes('/images/offers/')) {
      // Return the full URL without duplicating path segments
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${cleanPath}`;
    }

    // If it's just a filename, assume it's in the offers directory
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/images/offers/${cleanPath}`;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Store Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StoreIcon sx={{ mr: 1, color: '#E31C79' }} />
                <Typography variant="h6">Store Settings</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store Name"
                    value={settings.store.name}
                    onChange={(e) => handleChange('store', 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={settings.store.email}
                    onChange={(e) => handleChange('store', 'email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={settings.store.phone}
                    onChange={(e) => handleChange('store', 'phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={settings.store.address}
                    onChange={(e) => handleChange('store', 'address', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Google Maps Location"
                    multiline
                    rows={2}
                    value={settings.store.googleMapsLocation}
                    onChange={(e) => handleChange('store', 'googleMapsLocation', e.target.value)}
                    helperText="Paste the Google Maps embed code here"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: '#E31C79' }} />
                <Typography variant="h6">Email Settings</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="SMTP Host"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="SMTP Port"
                    type="number"
                    value={settings.email.smtpPort}
                    placeholder="Enter SMTP port number"
                    onChange={(e) => handleChange('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="SMTP User"
                    value={settings.email.smtpUser}
                    onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="SMTP Password"
                    type="password"
                    value={settings.email.smtpPass}
                    onChange={(e) => handleChange('email', 'smtpPass', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1, color: '#E31C79' }} />
                <Typography variant="h6">Razorpay Settings</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Razorpay Key ID"
                    value={settings.payment.razorpayKeyId}
                    onChange={(e) => handleChange('payment', 'razorpayKeyId', e.target.value)}
                    helperText="Enter your Razorpay Key ID from the Razorpay Dashboard"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Razorpay Key Secret"
                    type="password"
                    value={settings.payment.razorpayKeySecret}
                    onChange={(e) => handleChange('payment', 'razorpayKeySecret', e.target.value)}
                    helperText="Enter your Razorpay Key Secret from the Razorpay Dashboard"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Offers Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalOfferIcon sx={{ mr: 1, color: '#E31C79' }} />
                <Typography variant="h6">Offers</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenOfferModal()}
                    disabled={settings.offers.length >= 4}
                    sx={{ mb: 2 }}
                  >
                    Add Offer
                  </Button>
                  {settings.offers.map((offer, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">{offer.label}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => handleOpenOfferModal(index)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteOffer(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      {offer.image && (
                        <Box sx={{ mb: 1 }}>
                          <img
                            src={getImageUrl(offer.image)}
                            alt={offer.label}
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </Box>
                      )}
                      {offer.description && (
                        <Typography variant="body2" sx={{ mb: 1 }}>{offer.description}</Typography>
                      )}
                      {offer.isAutomatic ? (
                        <Box>
                          <Typography variant="body2" color="primary">Automatic Offer</Typography>
                          {offer.automaticSettings?.minOrderValue && offer.automaticSettings.minOrderValue > 0 && (
                            <Typography variant="body2">Min Order Value: ₹{offer.automaticSettings.minOrderValue}</Typography>
                          )}
                          {offer.automaticSettings?.minItems && offer.automaticSettings.minItems > 0 && (
                            <Typography variant="body2">Min Items: {offer.automaticSettings.minItems}</Typography>
                          )}
                          {offer.automaticSettings?.applicableCategories && offer.automaticSettings.applicableCategories.length > 0 && (
                            <Typography variant="body2">Categories: {offer.automaticSettings.applicableCategories.join(', ')}</Typography>
                          )}
                          {offer.automaticSettings?.applicableProducts && offer.automaticSettings.applicableProducts.length > 0 && (
                            <Typography variant="body2">Products: {offer.automaticSettings.applicableProducts.join(', ')}</Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2">Coupon: {offer.coupon}</Typography>
                      )}
                      {offer.discountPercentage && (
                        <Typography variant="body2" color="primary">
                          Discount: {offer.discountPercentage}%
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ bgcolor: '#E31C79', '&:hover': { bgcolor: '#d41a6b' } }}
        >
          Save Settings
        </Button>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Settings saved successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Offer Modal */}
      <Dialog open={openOfferModal} onClose={handleCloseOfferModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {offerIndex >= 0 ? 'Edit Offer' : 'Add Offer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Offer Title"
              value={currentOffer.label}
              onChange={(e) => setCurrentOffer({ ...currentOffer, label: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={currentOffer.description}
              onChange={(e) => setCurrentOffer({ ...currentOffer, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Discount Percentage"
              type="number"
              value={currentOffer.discountPercentage}
              placeholder="Enter discount percentage"
              onChange={(e) => setCurrentOffer({ ...currentOffer, discountPercentage: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="offer-image-upload"
              />
              <label htmlFor="offer-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{ mb: 1 }}
                >
                  Upload Image
                </Button>
              </label>
              {currentOffer.image && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={getImageUrl(currentOffer.image)}
                    alt="Preview"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Offer Type</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={currentOffer.isAutomatic ? "contained" : "outlined"}
                  onClick={() => setCurrentOffer({ ...currentOffer, isAutomatic: true })}
                  sx={{
                    borderColor: '#E31C79',
                    color: currentOffer.isAutomatic ? 'white' : '#E31C79',
                    '&:hover': {
                      borderColor: '#E31C79',
                      backgroundColor: currentOffer.isAutomatic ? '#d41a6b' : 'rgba(227, 28, 121, 0.04)'
                    }
                  }}
                >
                  Automatic Offer
                </Button>
                <Button
                  variant={!currentOffer.isAutomatic ? "contained" : "outlined"}
                  onClick={() => setCurrentOffer({ ...currentOffer, isAutomatic: false })}
                  sx={{
                    borderColor: '#E31C79',
                    color: !currentOffer.isAutomatic ? 'white' : '#E31C79',
                    '&:hover': {
                      borderColor: '#E31C79',
                      backgroundColor: !currentOffer.isAutomatic ? '#d41a6b' : 'rgba(227, 28, 121, 0.04)'
                    }
                  }}
                >
                  Coupon Code
                </Button>
              </Box>
            </Box>

            {!currentOffer.isAutomatic ? (
              <TextField
                fullWidth
                label="Coupon Code"
                value={currentOffer.coupon}
                onChange={(e) => setCurrentOffer({ ...currentOffer, coupon: e.target.value })}
                sx={{ mb: 2 }}
              />
            ) : (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Automatic Offer Conditions</Typography>
                <TextField
                  fullWidth
                  label="Minimum Order Value"
                  type="number"
                  value={currentOffer.automaticSettings?.minOrderValue || ''}
                  placeholder="Enter minimum order value"
                  onChange={(e) => setCurrentOffer({
                    ...currentOffer,
                    automaticSettings: {
                      ...currentOffer.automaticSettings,
                      minOrderValue: Number(e.target.value) || 0
                    }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Minimum Items"
                  type="number"
                  value={currentOffer.automaticSettings?.minItems || ''}
                  placeholder="Enter minimum items"
                  onChange={(e) => setCurrentOffer({
                    ...currentOffer,
                    automaticSettings: {
                      ...currentOffer.automaticSettings,
                      minItems: Number(e.target.value) || 0
                    }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Applicable Categories (comma-separated)"
                  value={currentOffer.automaticSettings?.applicableCategories?.join(', ') || ''}
                  onChange={(e) => setCurrentOffer({
                    ...currentOffer,
                    automaticSettings: {
                      ...currentOffer.automaticSettings,
                      applicableCategories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
                    }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Applicable Products (comma-separated)"
                  value={currentOffer.automaticSettings?.applicableProducts?.join(', ') || ''}
                  onChange={(e) => setCurrentOffer({
                    ...currentOffer,
                    automaticSettings: {
                      ...currentOffer.automaticSettings,
                      applicableProducts: e.target.value.split(',').map(prod => prod.trim()).filter(Boolean)
                    }
                  })}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOfferModal}>Cancel</Button>
          <Button
            onClick={handleSaveOffer}
            variant="contained"
            disabled={!currentOffer.label || (!currentOffer.isAutomatic && !currentOffer.coupon)}
            sx={{
              bgcolor: '#E31C79',
              '&:hover': { bgcolor: '#d41a6b' }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings 