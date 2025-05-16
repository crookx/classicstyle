
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
  stock: number;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface Collection {
  id: string; // Firestore document ID
  slug: string; // URL-friendly identifier
  name: string;
  description: string;
  imageUrl: string;
  dataAiHint?: string | null;
  productIds: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface OrderItem {
  productId: string;
  name: string; // Product name at the time of order
  quantity: number;
  price: number; // Price per unit at the time of order
  imageUrl?: string | null; // Optional image for quick view in order summary
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'PaymentFailed';

export interface Order {
  id: string; // Firestore document ID
  customerName: string;
  customerEmail: string;
  userId?: string | null; // To link to the user in Firebase Auth / users collection
  orderDate: string | any; // Stored as string from mock, but Firestore Timestamp preferred
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  paymentIntentId?: string | null; 
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID or manually created ID
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: any; // Firestore Timestamp
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

// Types for Firestore-backed Cart
export interface UserCartItem {
  productId: string;
  quantity: number;
  addedAt: any; // Firestore Timestamp
}

export interface UserCartDocument {
  userId: string;
  items: UserCartItem[];
  lastUpdatedAt: any; // Firestore Timestamp
}

// Types for Firestore-backed Wishlist
export interface UserWishlistItem {
  productId: string;
  addedAt: any; // Firestore Timestamp
}
export interface UserWishlistDocument {
  userId: string;
  productIds: string[];
  lastUpdatedAt: any; // Firestore Timestamp
}

// For CartContext display, combining UserCartItem with full Product details
export interface DisplayCartItem extends Product {
  quantityInCart: number;
  addedAt: any;
}
