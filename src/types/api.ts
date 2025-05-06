export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface OrderResponse {
  id: string;
  key: string;
  amount: number;
  razorpayOrderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  token?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  images: string[];
  videos?: string[];
  categoryId: string;
  stock: number;
  trending?: boolean;
  featured?: boolean;
  specifications?: Record<string, string>;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface AddressResponse {
  id: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface CustomerProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  orders: string[];
}

export interface OrderDetailsResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: AddressResponse;
  paymentStatus: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  stock: number;
  sku: string;
  trending?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: {
    email: string;
    // Add other address fields as needed
  };
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  id: string;
  orderId: string;
  orderDate: string;
  shippingAddress: any;
  items: OrderItem[];
  total: number;
  paymentStatus: string;
  createdAt: string;
}

export interface PaymentVerificationResponse {
  message: string;
  order: Order;
  emailStatus: {
    success: boolean;
    error?: string;
    storeEmail?: string;
    customerEmail?: string;
  };
}

export interface Settings {
  offers?: any[];
  paymentSettings?: any;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  coupon: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
} 