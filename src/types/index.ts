export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  videos?: string[];
  categoryId: string;
  category?: string;
  sku: string;
  stock: number;
  rating?: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    userId: string;
    createdAt: string;
  }>;
  featured?: boolean;
  trending?: boolean;
  specifications: {
    material?: string;
    work?: string;
    length?: string;
    origin?: string;
  };
  trackingId?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  image?: string;
  categoryId: string;
  category?: string;
  sku: string;
  stock: number;
  quantity: number;
  featured?: boolean;
  trending?: boolean;
  description?: string;
  rating?: number;
  specifications?: {
    material?: string;
    work?: string;
    length?: string;
    origin?: string;
  };
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  trackingId?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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
  validFrom: string;
  validUntil: string;
  isAutomatic?: boolean;
  discountPercentage?: number;
  label?: string;
  image?: string;
  automaticSettings?: {
    minOrderValue?: number;
    minItems?: number;
    applicableCategories?: string[];
    applicableProducts?: string[];
  };
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  orderCount?: number;
  lastUsed?: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  shippingMethods: Array<{
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  }>;
  paymentMethods: string[];
  offers: Array<{
    id: string;
    name: string;
    description: string;
    coupon: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    validFrom: string;
    validUntil: string;
    isAutomatic?: boolean;
    discountPercentage?: number;
    label?: string;
    image?: string;
  }>;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string | File;
}

export interface POSCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
} 