import { v4 as uuidv4 } from 'uuid';
import { handleApiError } from '../utils/errorHandler';

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscriptionDate: string;
  status: 'active' | 'unsubscribed';
  preferences?: {
    promotions: boolean;
    newArrivals: boolean;
    events: boolean;
  };
}

// Helper function to get subscriptions from localStorage
const getStoredSubscriptions = (): NewsletterSubscription[] => {
  const stored = localStorage.getItem('newsletter_subscriptions');
  if (!stored) {
    // Initialize with empty array
    localStorage.setItem('newsletter_subscriptions', JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored);
};

// Helper function to save subscriptions to localStorage
const saveSubscriptions = (subscriptions: NewsletterSubscription[]) => {
  localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
};

export const newsletterApi = {
  subscribe: async (email: string): Promise<NewsletterSubscription> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load current subscriptions
      const currentSubscriptions = getStoredSubscriptions();

      // Check if email already exists
      const existingSubscription = currentSubscriptions.find(
        sub => sub.email.toLowerCase() === email.toLowerCase()
      );

      if (existingSubscription) {
        if (existingSubscription.status === 'unsubscribed') {
          existingSubscription.status = 'active';
          saveSubscriptions(currentSubscriptions);
          return existingSubscription;
        }
        throw new Error('Email already subscribed');
      }

      // Create new subscription
      const newSubscription: NewsletterSubscription = {
        id: uuidv4(),
        email,
        subscriptionDate: new Date().toISOString(),
        status: 'active'
      };

      // Add to subscriptions and save
      currentSubscriptions.push(newSubscription);
      saveSubscriptions(currentSubscriptions);

      return newSubscription;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Admin endpoints
  getSubscriptions: async (params: { 
    page: number; 
    limit: number; 
    status?: 'active' | 'unsubscribed' 
  }): Promise<{
    subscriptions: NewsletterSubscription[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load current subscriptions
      const currentSubscriptions = getStoredSubscriptions();
      
      let filteredSubscriptions = currentSubscriptions;
      if (params.status) {
        filteredSubscriptions = filteredSubscriptions.filter(
          sub => sub.status === params.status
        );
      }

      const total = filteredSubscriptions.length;
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      
      return {
        subscriptions: filteredSubscriptions.slice(start, end),
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit)
      };
    } catch (error) {
      throw new Error('Failed to fetch subscriptions');
    }
  },

  unsubscribe: async (email: string): Promise<void> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load current subscriptions
      const currentSubscriptions = getStoredSubscriptions();

      const subscription = currentSubscriptions.find(
        sub => sub.email.toLowerCase() === email.toLowerCase()
      );

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.status = 'unsubscribed';
      saveSubscriptions(currentSubscriptions);
    } catch (error) {
      throw new Error('Failed to unsubscribe');
    }
  },
}; 