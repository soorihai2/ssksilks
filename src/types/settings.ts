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