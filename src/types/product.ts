import type { ProductResponse } from './api';

export interface Product extends ProductResponse {
  rating: number;
  stock: number;
  images: string[];
  videos?: string[];
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    userId: string;
    createdAt: string;
  }>;
  specifications: {
    material?: string;
    work?: string;
    [key: string]: any;
  };
  featured: boolean;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
} 