import axios from 'axios';
import { API_BASE_URL } from '../../config';

export interface Offer {
  label: string;
  image: string;
  coupon?: string;
  description?: string;
  discountPercentage?: number;
  isAutomatic: boolean;
  automaticSettings?: {
    minOrderValue?: number;
    minItems?: number;
    applicableCategories?: string[];
    applicableProducts?: string[];
  };
}

export interface Settings {
  offers: Offer[];
  payment: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
  };
  store?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    googleMapsLocation: string;
  };
  email?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  };
}

export const settingsApi = {
  async getSettings(): Promise<Settings> {
    const response = await axios.get(`${API_BASE_URL}/api/settings`);
    return response.data;
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const response = await axios.put(`${API_BASE_URL}/api/settings`, settings);
    return response.data;
  },

  async uploadOfferImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      console.log('Uploading offer image to:', `${API_BASE_URL}/settings/offer-image`);
      
      const response = await axios.post(`${API_BASE_URL}/settings/offer-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      // Clean up the image path to remove any duplicate /api/ prefixes
      let imagePath = response.data.imagePath;
      if (imagePath.startsWith('/api/')) {
        imagePath = imagePath.replace('/api/', '/');
      }
      
      // Make sure to return the clean path
      return imagePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async getPaymentSettings() {
    // Use the general settings endpoint and get payment settings
    const response = await axios.get(`${API_BASE_URL}/api/settings`);
    const settings = response.data;
    if (!settings?.payment?.razorpayKeyId) {
      throw new Error('Razorpay key not found in settings');
    }
    return settings.payment;
  },

  async getAutomaticOffers(): Promise<Offer[]> {
    const response = await axios.get(`${API_BASE_URL}/api/settings`);
    const settings = response.data;
    return settings.offers?.filter((offer: Offer) => offer.isAutomatic) || [];
  }
}; 