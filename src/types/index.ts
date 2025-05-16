
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string; // Firestore document ID
  name: string;
  price: number; 
  originalPrice?: number | null;
  imageUrl: string;
  dataAiHint?: string | null;
  category?: string | null;
  subCategory?: string | null;
  description: string;
  rating?: number | null;
  reviewCount?: number | null;
  details?: string[] | null;
  colors?: ProductColor[] | null;
  sizes?: string[] | null;
  tags?: string[] | null;
  sku?: string | null;
  isFeatured?: boolean | null;
}

export interface Collection {
  id: string; // Firestore document ID
  slug: string; // URL-friendly identifier
  name: string;
  description: string;
  imageUrl: string;
  dataAiHint?: string | null;
  productIds: string[];
}

// New Order Types
export interface OrderItem {
  productId: string;
  name: string; // Product name at the time of order
  quantity: number;
  price: number; // Price per unit at the time of order
  imageUrl?: string | null; // Optional image for quick view in order summary
}

export interface Order {
  id: string; // Firestore document ID
  customerName: string;
  customerEmail: string;
  orderDate: string; // Consider using Firestore Timestamp for real apps for better querying/sorting
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  shippingAddress?: { // Optional, can be expanded
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  // Firebase Timestamps can be added here if needed:
  // createdAt?: any; // Firebase Timestamp type
  // updatedAt?: any; // Firebase Timestamp type
}
