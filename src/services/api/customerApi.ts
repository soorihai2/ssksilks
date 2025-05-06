import { apiService as api } from './index';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
}

export interface Order {
  id: string;
  userId: string;
  customerId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  createdAt: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export class CustomerApi {
  private baseUrl = '/customers';

  private getToken() {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    return token;
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerId');
      localStorage.removeItem('user');
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }

  async login(credentials: LoginCredentials) {
    try {
      console.log('Login attempt with:', {
        email: credentials.email,
        phone: credentials.phone,
        hasPassword: !!credentials.password
      });
      
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/customers/login`,
        data: credentials,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Raw login response:', response);

      const { data } = response;
      
      if (!data) {
        throw new Error('Empty response from server');
      }

      // Extract customer data and token from response
      const customer = data.customer || data;
      const token = data.token || `Bearer_${btoa(JSON.stringify({
        id: customer.id,
        email: customer.email,
        timestamp: new Date().getTime()
      }))}`;

      if (!customer || typeof customer !== 'object') {
        throw new Error('Invalid customer data in response');
      }

      // Ensure customer has an ID
      if (!customer.id) {
        customer.id = 'cust_' + Date.now();
      }

      // Store auth data
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerId', customer.id);
      localStorage.setItem('user', JSON.stringify(customer));

      return {
        success: true,
        data: {
          token,
          customer
        }
      };
    } catch (error: any) {
      console.error('Login error details:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  async register(data: RegisterData) {
    return api.post(`${this.baseUrl}/register`, data);
  }

  async getProfile() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${API_BASE_URL}/customers/profile`,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      throw this.handleError(error);
    }
  }

  async updateProfile(data: any) {
    return api.put(`${this.baseUrl}/profile`, data);
  }

  async getOrders() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${API_BASE_URL}/customers/orders`,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderById(orderId: string) {
    try {
      const token = this.getToken();
      const response = await axios.get(`${API_BASE_URL}/customers/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async trackOrder(orderId: string) {
    try {
      const token = this.getToken();
      const response = await axios.get(`${API_BASE_URL}/customers/orders/${orderId}/track`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(emailOrPhone: string) {
    return api.post(`${this.baseUrl}/password-reset-request`, { emailOrPhone });
  }

  async resetPassword(email: string, newPassword?: string): Promise<any> {
    if (newPassword) {
      // If both parameters are provided, reset password with token
      return await axios.post(`${API_BASE_URL}/customers/reset-password`, { 
        token: email, // In this case, first param is token
        newPassword 
      });
    } else {
      // If only email is provided, request password reset
      return await axios.post(`${API_BASE_URL}/customers/request-reset`, { email });
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return api.put(`${this.baseUrl}/change-password`, { currentPassword, newPassword });
  }

  async getAddresses() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${API_BASE_URL}/customers/addresses`,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw this.handleError(error);
    }
  }

  async addAddress(address: any) {
    try {
      const response = await api.post(`${this.baseUrl}/addresses`, address);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAddress(addressId: string, address: any) {
    try {
      const response = await api.put(
        `${this.baseUrl}/addresses/${addressId}`,
        address
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAddress(addressId: string) {
    try {
      const response = await api.delete(`${this.baseUrl}/addresses/${addressId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotifications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers/notifications`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/customers/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async markAllNotificationsAsRead() {
    return api.put(`${this.baseUrl}/notifications/read-all`, {});
  }

  async logout() {
    return api.post('/auth/logout', {});
  }

  async create(data: { phone: string; type: 'pos' }) {
    try {
      const response = await api.post(`${this.baseUrl}/pos`, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByPhone(phone: string) {
    try {
      const response = await api.get(`${this.baseUrl}/phone/${phone}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }
}

export const customerApi = new CustomerApi(); 