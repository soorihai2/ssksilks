import axios from 'axios';
import { API_BASE_URL } from '../../config';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderDetails {
  orderId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentId: string;
  orderDate: string;
}

export const emailApi = {
  sendOrderEmails: async (order: OrderDetails): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/email/order`, order);
  }
}; 