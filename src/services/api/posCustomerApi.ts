import axios from 'axios';
import { API_BASE_URL } from '../../config';

export interface POSCustomer {
  id?: string;
  phone: string;
  name?: string;
  isNew?: boolean;
  totalOrders?: number;
  totalSpent?: number;
}

export const posCustomerApi = {
  getAll: async (): Promise<POSCustomer[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pos-customers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching POS customers:', error);
      return [];
    }
  },

  getByPhone: async (phone: string): Promise<POSCustomer | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers/phone/${phone}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (data: { phone: string; type: 'pos' }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customers/pos`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating POS customer:', error);
      throw error;
    }
  },

  update: async (id: string, customer: Partial<POSCustomer>): Promise<POSCustomer | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/pos-customers/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error('Error updating POS customer:', error);
      return null;
    }
  }
}; 