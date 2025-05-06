import { api } from './index';

export interface POSOrder {
  id: string;
  orderNumber: string;
  customer: {
    id?: string;
    phone: string;
    name?: string;
    isNew?: boolean;
  };
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      sku?: string;
    };
    quantity: number;
  }>;
  total: number;
  paymentMode: string;
  status: 'completed';
  createdAt: string;
  type: 'pos';
}

export interface PaymentVerificationResponse {
  message: string;
  emailStatus?: {
    success: boolean;
    message?: string;
  };
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    razorpayPaymentId?: string;
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
    items: Array<{
      id: string;
      name: string;
      image: string;
      quantity: number;
      price: number;
    }>;
  };
}

// Replace the standalone function with a proper method inside the orderApi object
export const orderApi = {
  getAll: async () => {
    return await api.get('/orders');
  },

  getById: async (id: string) => {
    return await api.get(`/orders/${id}`);
  },

  create: async (orderData: any) => {
    return await api.post('/orders', orderData);
  },

  update: async (id: string, orderData: any) => {
    return await api.put(`/orders/${id}`, orderData);
  },

  delete: async (id: string) => {
    return await api.delete(`/orders/${id}`);
  },

  getByCustomerId: async (customerId: string) => {
    return await api.get(`/orders/customer/${customerId}`);
  },

  verifyPayment: async (paymentData: any): Promise<PaymentVerificationResponse> => {
    try {
      console.log('Sending payment verification request:', paymentData);
      
      // Validate required fields
      if (!paymentData.razorpay_payment_id || !paymentData.razorpay_order_id || !paymentData.razorpay_signature) {
        throw new Error('Missing required payment verification fields');
      }

      const response = await api.post<PaymentVerificationResponse>(
        '/orders/verify', 
        {
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature
        }
      );

      console.log('Payment verification response:', response);
      
      if (!response.data || !response.data.order) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Payment verification failed';
      console.error('Detailed error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw new Error(errorMessage);
    }
  },
  
  updateStatus: async (orderId: string, status: string) => {
    return await api.put(`/orders/${orderId}/status`, { status });
  },

  // POS-specific methods
  createPOSOrder: async (orderData: POSOrder) => {
    return await api.post('/orders/pos', orderData);
  },

  getPOSOrders: async () => {
    return await api.get('/orders/pos');
  }
}; 