import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { settingsApi, Offer } from '../services/api/settings';
import type { Product } from '../types';
import { MEDIA_BASE_URL } from '../config';

const getImageUrl = (imagePath?: string, folder: string = 'products', placeholder: string = 'placeholder.jpg') => {
  if (!imagePath) {
    return `${MEDIA_BASE_URL}/images/${folder}/${placeholder}`;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(new RegExp(`^/images/${folder}/`), '');
  return `${MEDIA_BASE_URL}/images/${folder}/${cleanPath}`;
};

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

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  discountPercentage: number;
  discountApplied: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  applyDiscount: (coupon: string) => Promise<boolean>;
  activeOffer: Offer | null;
  setActiveOffer: (offer: Offer | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [lastAction, setLastAction] = useState<{
    type: 'add' | 'remove' | 'update' | 'clear' | 'discount';
    item?: CartItem;
    quantity?: number;
    discount?: number;
  } | null>(null);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Handle toast notifications
  useEffect(() => {
    if (!lastAction) return;

    const { type, item, quantity, discount } = lastAction;
    
    if (type === 'add' && item) {
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={getImageUrl(item.image)} 
            alt={item.name} 
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
          />
          <div>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Quantity: {item.quantity} | ₹{item.price.toLocaleString()}
            </div>
          </div>
        </div>,
        {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else if (type === 'remove' && item) {
      toast.info(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={getImageUrl(item.image)} 
            alt={item.name} 
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
          />
          <div>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>Removed from cart</div>
          </div>
        </div>,
        {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else if (type === 'update' && item && quantity !== undefined) {
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={getImageUrl(item.image)} 
            alt={item.name} 
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
          />
          <div>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Quantity updated to {quantity}
            </div>
          </div>
        </div>,
        {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else if (type === 'clear') {
      toast.info('Cart cleared', {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (type === 'discount' && discount !== undefined) {
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Discount Applied!</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              You saved ₹{discount.toLocaleString()}
            </div>
          </div>
        </div>,
        {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }

    setLastAction(null);
  }, [lastAction]);

  // Check for automatic offers whenever cart changes
  useEffect(() => {
    const checkAutomaticOffers = async () => {
      try {
        if (items.length === 0) {
          setActiveOffer(null);
          setDiscount(0);
          setDiscountPercentage(0);
          setDiscountApplied(false);
          return;
        }
        
        const response = await settingsApi.getAutomaticOffers();
        if (response && response.length > 0) {
          const applicableOffers = response.filter(offer => {
            if (!offer.automaticSettings) return false;
            
            const { minOrderValue, minItems, applicableCategories, applicableProducts } = offer.automaticSettings;
            
            // Check minimum order value
            if (minOrderValue && totalPrice < minOrderValue) return false;
            
            // Check minimum items
            if (minItems && totalItems < minItems) return false;
            
            // Check applicable categories
            if (applicableCategories && applicableCategories.length > 0) {
              const hasMatchingCategory = items.some(item => 
                applicableCategories.includes(item.categoryId)
              );
              if (!hasMatchingCategory) return false;
            }
            
            // Check applicable products
            if (applicableProducts && applicableProducts.length > 0) {
              const hasMatchingProduct = items.some(item => 
                applicableProducts.includes(item.id)
              );
              if (!hasMatchingProduct) return false;
            }
            
            return true;
          });
          
          if (applicableOffers.length > 0) {
            const bestOffer = applicableOffers.reduce((best, current) => {
              const currentDiscount = (totalPrice * (current.discountPercentage || 0)) / 100;
              const bestDiscount = (totalPrice * (best.discountPercentage || 0)) / 100;
              return currentDiscount > bestDiscount ? current : best;
            });
            
            setActiveOffer(bestOffer);
            const discountAmount = (totalPrice * (bestOffer.discountPercentage || 0)) / 100;
            
            // Apply max discount limit if specified
            const finalDiscount = bestOffer.automaticSettings?.minOrderValue 
              ? Math.min(discountAmount, bestOffer.automaticSettings.minOrderValue)
              : discountAmount;
            
            setDiscount(finalDiscount);
            setDiscountPercentage(bestOffer.discountPercentage || 0);
            setDiscountApplied(true);
            setLastAction({ type: 'discount', discount: finalDiscount });
          } else {
            setActiveOffer(null);
            setDiscount(0);
            setDiscountPercentage(0);
            setDiscountApplied(false);
          }
        }
      } catch (error) {
        console.error('Error checking automatic offers:', error);
        setActiveOffer(null);
        setDiscount(0);
        setDiscountPercentage(0);
        setDiscountApplied(false);
      }
    };

    checkAutomaticOffers();
  }, [items, totalPrice, totalItems]);

  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        const updatedItem = { ...existingItem, quantity: newQuantity };
        setLastAction({ type: 'add', item: updatedItem });
        return currentItems.map(i =>
          i.id === item.id
            ? updatedItem
            : i
        );
      }
      setLastAction({ type: 'add', item });
      return [...currentItems, item];
    });
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => {
      const itemToRemove = currentItems.find(i => i.id === productId);
      if (itemToRemove) {
        setLastAction({ type: 'remove', item: itemToRemove });
      }
      return currentItems.filter(item => item.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems => {
      const item = currentItems.find(i => i.id === productId);
      if (item) {
        const updatedItem = { ...item, quantity };
        setLastAction({ type: 'update', item: updatedItem, quantity });
        return currentItems.map(i =>
          i.id === productId
            ? updatedItem
            : i
        );
      }
      return currentItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    setDiscountPercentage(0);
    setDiscountApplied(false);
    setActiveOffer(null);
    setLastAction({ type: 'clear' });
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.id === productId);
    return item?.quantity || 0;
  };

  const applyDiscount = async (coupon: string): Promise<boolean> => {
    try {
      // First check if it's an automatic offer
      if (activeOffer && activeOffer.coupon === coupon) {
        const discountAmount = (totalPrice * (activeOffer.discountPercentage || 0)) / 100;
        
        // Apply max discount limit if specified
        const finalDiscount = activeOffer.automaticSettings?.minOrderValue 
          ? Math.min(discountAmount, activeOffer.automaticSettings.minOrderValue)
          : discountAmount;
        
        setDiscount(finalDiscount);
        setDiscountPercentage(activeOffer.discountPercentage || 0);
        setDiscountApplied(true);
        setLastAction({ type: 'discount', discount: finalDiscount });
        return true;
      }

      // If not an automatic offer, check manual coupons
      const response = await settingsApi.getSettings();
      const validOffer = response.offers?.find(offer => {
        // Check if coupon matches (case insensitive)
        if (offer.coupon?.toLowerCase() !== coupon.toLowerCase()) {
          return false;
        }
        
        return true;
      });

      if (validOffer) {
        const discountAmount = (totalPrice * (validOffer.discountPercentage || 0)) / 100;
        
        // Apply max discount limit if specified
        const finalDiscount = validOffer.automaticSettings?.minOrderValue 
          ? Math.min(discountAmount, validOffer.automaticSettings.minOrderValue)
          : discountAmount;
        
        setDiscount(finalDiscount);
        setDiscountPercentage(validOffer.discountPercentage || 0);
        setDiscountApplied(true);
        setLastAction({ type: 'discount', discount: finalDiscount });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error applying discount:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        discount,
        discountPercentage,
        discountApplied,
        addItem,
        removeItem,
        clearCart,
        updateQuantity,
        getItemQuantity,
        applyDiscount,
        activeOffer,
        setActiveOffer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 