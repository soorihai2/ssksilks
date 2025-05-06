export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  stock: number;
  reviews: { userId: string; rating: number; comment: string; }[];
  specifications: {
    material: string;
    work: string;
    length: string;
    origin: string;
  };
  trending?: boolean;
  featured?: boolean;
  categoryId: string;
} 