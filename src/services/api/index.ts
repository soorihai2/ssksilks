import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../../config';
import type { 
  ApiResponse, 
  ProductResponse, 
  CategoryResponse, 
  OrderResponse,
  CustomerProfileResponse 
} from '../../types/api';
import type { Product } from '../../types/product';
import logger from '../../utils/logger';
import { IS_DEVELOPMENT } from '../../config/env';

interface ApiResponseData {
  message?: string;
  [key: string]: any;
}

// Initialize API service (only in development)
if (IS_DEVELOPMENT) {
  logger.info('API service initialized with base URL:', API_BASE_URL);
}

// Create axios instance with proper types
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (IS_DEVELOPMENT) {
      logger.debug('Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL
      });
    }
    return config;
  },
  (error) => {
    logger.error('Request error:', logger.sanitize(error));
    return Promise.reject(error);
  }
);

// Transform response to match ApiResponse type
function transformResponse<T>(response: AxiosResponse<T & ApiResponseData>): ApiResponse<T> {
  return {
    success: true,
    data: response.data,
    message: response.data?.message
  };
}

// Transform error to match ApiResponse type
function transformError<T>(error: any): ApiResponse<T> {
  return {
    success: false,
    data: null as T,
    error: error?.response?.data?.message || error.message
  };
}

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (IS_DEVELOPMENT) {
      logger.debug('Response:', {
      status: response.status,
        statusText: response.statusText,
        url: response.config.url
    });
    }
    return response;
  },
  (error) => {
    logger.error('Response error:', logger.sanitize(error));
    return Promise.reject(error);
  }
);

// Helper function to handle API response
const handleResponse = async <T>(response: AxiosResponse<T>): Promise<T> => {
  if (IS_DEVELOPMENT) {
    logger.debug('Handling response for:', response.config.url);
  }
  return response.data;
};

// Base API object with common functionality
export const apiService = {
  get: async <T>(endpoint: string, options: any = {}): Promise<T> => {
    try {
      const response = await api.get<T>(endpoint, { ...options });
      return handleResponse<T>(response);
    } catch (error) {
      logger.error('API GET Error:', logger.sanitize(error));
      throw error;
    }
  },

  post: async <T>(endpoint: string, data: any, options: any = {}): Promise<T> => {
    try {
      const response = await api.post<T>(endpoint, data, { ...options });
      return handleResponse<T>(response);
    } catch (error) {
      logger.error('API POST Error:', logger.sanitize(error));
      throw error;
    }
  },

  put: async <T>(endpoint: string, data: any, options: any = {}): Promise<T> => {
    try {
      const response = await api.put<T>(endpoint, data, { ...options });
      return handleResponse<T>(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  delete: async <T>(endpoint: string, options: any = {}): Promise<T> => {
    try {
      const response = await api.delete<T>(endpoint, { ...options });
      return handleResponse<T>(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

export default apiService;

// Products API
export const productApi = {
  getAll: async () => {
    try {
      return await apiService.get('/products');
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string) => {
    return await apiService.get(`/products/${id}`);
  },

  create: async (productData: any) => {
    return await apiService.post('/products', productData);
  },

  update: async (id: string, productData: any) => {
    return await apiService.put(`/products/${id}`, productData);
  },

  delete: async (id: string) => {
    return await apiService.delete(`/products/${id}`);
  },

  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return await apiService.post(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // General image upload without a product ID
  uploadProductImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return await apiService.post(`/products/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

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

// Orders API
export const orderApi = {
  getAll: async () => {
    return await apiService.get('/orders');
  },

  getById: async (id: string) => {
    return await apiService.get(`/orders/${id}`);
  },

  create: async (orderData: any) => {
    return await apiService.post('/orders', orderData);
  },

  update: async (id: string, orderData: any) => {
    return await apiService.put(`/orders/${id}`, orderData);
  },

  delete: async (id: string) => {
    return await apiService.delete(`/orders/${id}`);
  },

  getByCustomerId: async (customerId: string) => {
    return await apiService.get(`/orders/customer/${customerId}`);
  },

  verifyPayment: async (paymentData: any) => {
    return await apiService.post('/orders/verify', paymentData);
  },

  // POS-specific methods
  createPOSOrder: async (orderData: any) => {
    return await apiService.post('/orders/pos', orderData);
  },

  getPOSOrders: async () => {
    return await apiService.get('/orders/pos');
  }
};

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return await apiService.post('/auth/login', credentials);
  },

  register: async (userData: any) => {
    return await apiService.post('/auth/register', userData);
  },

  logout: async () => {
    return await apiService.post('/auth/logout', {});
  },

  getCurrentUser: async () => {
    return await apiService.get('/auth/me');
  },

  updateProfile: async (userData: any) => {
    return await apiService.put('/auth/profile', userData);
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return await apiService.put('/auth/change-password', passwordData);
  },

  forgotPassword: async (email: string) => {
    return await apiService.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await apiService.post('/auth/reset-password', { token, newPassword });
  }
};

// Settings API
export const settingsApi = {
  getAll: async () => {
    return await apiService.get('/settings');
  },

  update: async (settingsData: any) => {
    return await apiService.put('/settings', settingsData);
  }
};

// Category API
export const categoryApi = {
  getAll: async () => {
    return await apiService.get('/categories');
  },

  getById: async (id: string) => {
    return await apiService.get(`/categories/${id}`);
  },

  create: async (categoryData: any) => {
    return await apiService.post('/categories', categoryData);
  },

  update: async (id: string, categoryData: any) => {
    return await apiService.put(`/categories/${id}`, categoryData);
  },

  delete: async (id: string) => {
    return await apiService.delete(`/categories/${id}`);
  },

  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post(`/categories/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }
};

export * from './newsletter';
export { posCustomerApi } from './posCustomerApi';

export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await api.get<Product[]>('/products');
    return transformResponse<Product[]>(response);
  } catch (error) {
    return transformError<Product[]>(error);
  }
};

export const getCategories = async (): Promise<ApiResponse<CategoryResponse[]>> => {
  try {
    const response = await api.get<CategoryResponse[]>('/categories');
    return transformResponse<CategoryResponse[]>(response);
  } catch (error) {
    return transformError<CategoryResponse[]>(error);
  }
};

export const getCategoryWithProducts = async (id: string): Promise<ApiResponse<CategoryResponse & { products: Product[] }>> => {
  try {
    const response = await api.get<CategoryResponse & { products: Product[] }>(`/categories/${id}/products`);
    return transformResponse<CategoryResponse & { products: Product[] }>(response);
  } catch (error) {
    return transformError<CategoryResponse & { products: Product[] }>(error);
  }
};

export const getOrders = async (): Promise<ApiResponse<OrderResponse[]>> => {
  return apiService.get('/orders');
};

export const getCustomerProfile = async (): Promise<ApiResponse<CustomerProfileResponse>> => {
  return apiService.get('/customers/profile');
};

// Export the api instance for other modules
export { api }; 