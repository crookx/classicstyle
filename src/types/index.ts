
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // Made optional
  imageUrl: string;
  dataAiHint?: string;
  category?: string;
  subCategory?: string; // Added for more detail
  description: string;
  rating?: number;
  reviewCount?: number;
  details?: string[];
  colors?: ProductColor[];
  sizes?: string[];
  tags?: string[];
  sku?: string;
  isFeatured?: boolean; // To explicitly mark featured products
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  dataAiHint?: string;
  productIds: string[];
}
