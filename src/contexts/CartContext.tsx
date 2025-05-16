
'use client';
import type { Product, UserCartItem, DisplayCartItem, UserCartDocument } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserCart as fetchUserCartFromDb,
  addItemToCart as addItemToCartInDb,
  removeItemFromCart as removeItemFromCartInDb,
  updateCartItemQuantity as updateCartItemQuantityInDb,
  clearUserCart as clearUserCartInDb,
  getProductsByIds
} from '@/lib/firebase/firestoreService';
import { serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CartContextType {
  cart: DisplayCartItem[]; // Items with full product details for display
  loadingCart: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [cart, setCart] = useState<DisplayCartItem[]>([]); // For UI display
  const [dbCartItems, setDbCartItems] = useState<UserCartItem[]>([]); // Raw items from DB
  const [loadingCart, setLoadingCart] = useState(true);

  const fetchAndPopulateCart = useCallback(async (userId: string) => {
    setLoadingCart(true);
    try {
      const userCartDoc = await fetchUserCartFromDb(userId);
      const currentDbItems = userCartDoc?.items || [];
      setDbCartItems(currentDbItems);

      if (currentDbItems.length > 0) {
        const productIds = currentDbItems.map(item => item.productId);
        const productsDetails = await getProductsByIds(productIds);
        const displayItems: DisplayCartItem[] = currentDbItems.map(dbItem => {
          const productDetail = productsDetails.find(p => p.id === dbItem.productId);
          return productDetail ? {
            ...productDetail,
            quantityInCart: dbItem.quantity,
            addedAt: dbItem.addedAt,
          } : null;
        }).filter(item => item !== null) as DisplayCartItem[];
        setCart(displayItems);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching or populating cart:", error);
      toast({ title: "Error", description: "Could not load your cart.", variant: "destructive" });
      setCart([]);
      setDbCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchAndPopulateCart(currentUser.uid);
    } else if (!authLoading && !currentUser) {
      // User logged out or not logged in, clear cart
      setCart([]);
      setDbCartItems([]);
      setLoadingCart(false);
    }
  }, [currentUser, authLoading, fetchAndPopulateCart]);


  const checkAuthAndPrompt = () => {
    if (authLoading) {
      toast({ title: "Please wait", description: "Authenticating..." });
      return false;
    }
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your cart.",
        variant: "destructive",
        action: (
          <button onClick={() => router.push('/login?redirect=/cart')} className="ml-auto rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent">
            Login
          </button>
        ),
      });
      return false;
    }
    return true;
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!checkAuthAndPrompt() || !currentUser) return;

    const existingItemIndex = dbCartItems.findIndex(item => item.productId === product.id);
    let updatedDbItems: UserCartItem[];

    if (existingItemIndex > -1) {
      const updatedItem = {
        ...dbCartItems[existingItemIndex],
        quantity: dbCartItems[existingItemIndex].quantity + quantity,
      };
      updatedDbItems = dbCartItems.map((item, index) => index === existingItemIndex ? updatedItem : item);
      await updateCartItemQuantityInDb(currentUser.uid, product.id, updatedItem.quantity);
    } else {
      const newItem: UserCartItem = {
        productId: product.id,
        quantity: quantity,
        addedAt: serverTimestamp(), // Use server timestamp for DB
      };
      updatedDbItems = [...dbCartItems, newItem];
      await addItemToCartInDb(currentUser.uid, newItem);
    }
    // Optimistically update UI, then refetch for consistency
    await fetchAndPopulateCart(currentUser.uid);
  };

  const removeFromCart = async (productId: string) => {
    if (!checkAuthAndPrompt() || !currentUser) return;
    await removeItemFromCartInDb(currentUser.uid, productId);
    await fetchAndPopulateCart(currentUser.uid);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!checkAuthAndPrompt() || !currentUser) return;
    const newQuantity = Math.max(0, quantity);
    if (newQuantity === 0) {
      await removeFromCart(productId);
    } else {
      await updateCartItemQuantityInDb(currentUser.uid, productId, newQuantity);
      await fetchAndPopulateCart(currentUser.uid);
    }
  };

  const clearCart = async () => {
    if (!checkAuthAndPrompt() || !currentUser) return;
    await clearUserCartInDb(currentUser.uid);
    setCart([]);
    setDbCartItems([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantityInCart, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantityInCart, 0);

  return (
    <CartContext.Provider value={{ cart, loadingCart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
