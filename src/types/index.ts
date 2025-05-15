export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  dataAiHint?: string;
  category?: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  details?: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tags?: string[];
  sku?: string;
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
