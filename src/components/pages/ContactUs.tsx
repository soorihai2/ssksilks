import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';

// Store locations data
const locations = [
  {
    id: 1,
    name: "Chennai Flagship Store",
    address: "42, Silk Garden Road, T. Nagar, Chennai - 600017, Tamil Nadu, India",
    phone: "+91 44 2834 5678",
    email: "chennai@sreesathyabhamasilks.com",
    hours: "Monday to Saturday: 10:00 AM - 8:00 PM\nSunday: 11:00 AM - 6:00 PM",
    isMain: true,
  },
  {
    id: 2,
    name: "Coimbatore Branch",
    address: "15, Textile Tower, Oppanakara Street, Coimbatore - 641001, Tamil Nadu, India",
    phone: "+91 422 2394 4567",
    email: "coimbatore@sreesathyabhamasilks.com",
    hours: "Monday to Saturday: 10:00 AM - 8:00 PM\nSunday: Closed",
  },
  {
    id: 3,
    name: "Bangalore Branch",
    address: "28, Silk Boulevard, Jayanagar 4th Block, Bangalore - 560041, Karnataka, India",
    phone: "+91 80 2664 3456",
    email: "bangalore@sreesathyabhamasilks.com",
    hours: "Monday to Saturday: 10:30 AM - 8:30 PM\nSunday: 11:00 AM - 7:00 PM",
  },
];

// FAQ data
const faqs = [
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to most countries worldwide. International shipping typically takes 7-14 business days depending on the destination. Customs duties and taxes may apply according to the country's regulations.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery if the product is unused, unworn, and in its original packaging with tags intact. Please note that shipping charges are non-refundable, and the customer is responsible for return shipping costs.",
  },
  {
    question: "How do I care for my silk saree?",
    answer: "We recommend dry cleaning for all our silk sarees. Store them in a cool, dry place wrapped in a cotton cloth. Avoid exposure to direct sunlight for extended periods. For minor wrinkles, use a steam iron on low heat without direct contact.",
  },
  {
    question: "Do you provide blouse stitching services?",
    answer: "Yes, we offer customized blouse stitching services. You can provide your measurements at checkout, and our expert tailors will craft a perfectly fitting blouse. Please allow an additional 5-7 days for stitching and delivery.",
  },
  {
    question: "Can I customize my saree order?",
    answer: "For bulk orders, we offer customization options such as color variations, border designs, and pallu patterns. Please contact our customer service team directly for customization requests at least 30 days before your required delivery date.",
  },
];

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  googleMapsLocation: string;
}

const ContactUs: React.FC = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/settings`);
        setStoreSettings(response.data.store);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load store information');
      }
    };

    fetchSettings();
  }, []);

  if (!storeSettings) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.message) {
      setFormError(true);
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/email/contact`,
        formData
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        toast.success('Message sent successfully!');
      } else {
        setError(response.data.message || "Failed to send message");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.details ||
          "Failed to send message"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))',
            zIndex: 1,
          }}
        />
        <Box
          component="img"
          src="/uploads/contact/contact-banner.jpg"
          alt="Contact Us"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              mb: 3,
              color: 'white',
            }}
          >
            Contact Us
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            Have questions or need assistance? We're here to help. Reach out to
            our team for personalized service and expert advice.
          </Typography>
        </Container>
      </Box>

      {/* Contact Details Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Add Map Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h3"
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 500,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Find Us
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '400px',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 3,
            }}
            dangerouslySetInnerHTML={{ __html: storeSettings.googleMapsLocation }}
          />
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                bgcolor: 'white',
              }}
            >
              <Box sx={{ color: '#E31C79', mb: 3 }}>
                <PhoneIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h5" gutterBottom>
                Call Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Our customer service team is available to help you with any inquiries.
              </Typography>
              <Button
                href="tel:+914428345678"
                sx={{ color: '#E31C79', '&:hover': { textDecoration: 'underline' } }}
              >
                +91 44 2834 5678
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Mon-Sat: 9:00 AM - 6:00 PM
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                bgcolor: 'white',
              }}
            >
              <Box sx={{ color: '#E31C79', mb: 3 }}>
                <EmailIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h5" gutterBottom>
                Email Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Send us an email and we'll get back to you within 24 hours.
              </Typography>
              <Button
                href="mailto:info@sreesathyabhamasilks.com"
                sx={{ color: '#E31C79', '&:hover': { textDecoration: 'underline' } }}
              >
                info@sreesathyabhamasilks.com
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                24/7 Email Support
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                bgcolor: 'white',
              }}
            >
              <Box sx={{ color: '#E31C79', mb: 3 }}>
                <LocationOnIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h5" gutterBottom>
                Visit Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Experience our collection in person at one of our stores.
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                3 Locations in India
              </Typography>
              <Typography variant="body2" color="text.secondary">
                See store details below for timings
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Contact Form and Store Locations */}
        <Grid container spacing={6}>
          <Grid item xs={12} lg={6}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 500,
                mb: 4,
              }}
            >
              Send a Message
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Have a question or inquiry? Fill out the form below and our team
              will get back to you as soon as possible.
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 4 }}>
                Thank you for contacting us! Your message has been received. One of our team members will contact you shortly.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                p: 4,
                bgcolor: 'white',
                borderRadius: 2,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={formError && !formData.name}
                    helperText={formError && !formData.name ? "Name is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={formError && !formData.email}
                    helperText={formError && !formData.email ? "Email is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Your Message"
                    name="message"
                    multiline
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    error={formError && !formData.message}
                    helperText={formError && !formData.message ? "Message is required" : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      bgcolor: '#E31C79',
                      '&:hover': { bgcolor: '#C41E3A' },
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 500,
                mb: 4,
              }}
            >
              Our Stores
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Visit one of our stores to experience our exquisite collection in
              person. Our knowledgeable staff is ready to assist you.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {locations.map((location) => (
                <Paper
                  key={location.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    borderLeft: 4,
                    borderColor: location.isMain ? '#E31C79' : 'grey.200',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {location.name}
                    </Typography>
                    {location.isMain && (
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        Main
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {location.address}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Button
                      href={`tel:${location.phone.replace(/\s/g, '')}`}
                      size="small"
                      sx={{ color: '#E31C79' }}
                    >
                      {location.phone}
                    </Button>
                    <Button
                      href={`mailto:${location.email}`}
                      size="small"
                      sx={{ color: '#E31C79' }}
                    >
                      {location.email}
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {location.hours}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 500,
                mb: 2,
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
              Find answers to common questions about our products, services, and
              policies. If you don't see your question answered here, please
              contact us directly.
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                expanded={expanded === `panel${index}`}
                onChange={handleAccordionChange(`panel${index}`)}
                sx={{
                  '&:not(:last-child)': { mb: 2 },
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    expanded === `panel${index}` ? <RemoveIcon /> : <AddIcon />
                  }
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                  <Typography variant="body1" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactUs; 