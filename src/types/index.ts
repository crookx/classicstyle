
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string; // Firestore document ID
  name: string;
  price: number; // Representing KES value as USD for display consistency
  originalPrice?: number | null; // Firestore prefers null over undefined for optional fields
  imageUrl: string;
  dataAiHint?: string | null;
  category?: string | null; // e.g., Men's Fashion, Women's Fashion
  subCategory?: string | null; // e.g., Polo shirts, Slim-fit chinos
  description: string;
  rating?: number | null;
  reviewCount?: number | null;
  details?: string[] | null; // Array of strings
  colors?: ProductColor[] | null; // Array of objects
  sizes?: string[] | null; // Array of strings
  tags?: string[] | null; // e.g., featured, trending, slim-fit
  sku?: string | null;
  isFeatured?: boolean | null;
  // Firebase Timestamps can be added here if needed:
  // createdAt?: any; // Firebase Timestamp type
  // updatedAt?: any; // Firebase Timestamp type
}

export interface Collection {
  id: string; // Firestore document ID
  slug: string; // URL-friendly identifier
  name: string;
  description: string;
  imageUrl: string;
  dataAiHint?: string | null;
  productIds: string[]; // Array of Product IDs
  // createdAt?: any;
  // updatedAt?: any;
}
