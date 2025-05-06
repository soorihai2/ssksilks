import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ShoppingBag as OrdersIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { customerApi } from '../../services/api/customerApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'order' | 'shipping' | 'payment' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const CustomerNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEmptyDialog, setOpenEmptyDialog] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await customerApi.getNotifications();
      setNotifications(data);
      if (data.length === 0) {
        setOpenEmptyDialog(true);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await customerApi.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <OrdersIcon />;
      case 'shipping':
        return <ShippingIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#E31C79',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              onClick={fetchNotifications}
              sx={{ color: '#E31C79', borderColor: '#E31C79' }}
            >
              Refresh
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  component="div"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'transparent' : 'rgba(227, 28, 121, 0.05)',
                    '&:hover': {
                      bgcolor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(227, 28, 121, 0.1)'
                    }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        sx={{ color: '#E31C79' }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Empty State Dialog */}
        <Dialog
          open={openEmptyDialog}
          onClose={() => setOpenEmptyDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon sx={{ color: '#E31C79' }} />
              No Notifications
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                You don't have any notifications at the moment.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmptyDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CustomerNotifications; 