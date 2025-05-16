
'use client';
import type { Product, UserWishlistItem, UserWishlistDocument } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserWishlist as fetchUserWishlistFromDb,
  addProductToWishlist as addProductToWishlistInDb,
  removeProductFromWishlist as removeProductFromWishlistInDb,
  getProductsByIds
} from '@/lib/firebase/firestoreService';
import { serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface WishlistContextType {
  wishlist: Product[]; // Products with full details for display
  loadingWishlist: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlistLocal: () => void; // For logout
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [wishlist, setWishlist] = useState<Product[]>([]); // For UI display
  const [dbWishlistProductIds, setDbWishlistProductIds] = useState<string[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const clearWishlistLocal = useCallback(() => {
    setWishlist([]);
    setDbWishlistProductIds([]);
  }, []);

  const fetchAndPopulateWishlist = useCallback(async (userId: string) => {
    setLoadingWishlist(true);
    try {
      const userWishlistDoc = await fetchUserWishlistFromDb(userId);
      const currentProductIds = userWishlistDoc?.productIds || [];
      setDbWishlistProductIds(currentProductIds);

      if (currentProductIds.length > 0) {
        const productsDetails = await getProductsByIds(currentProductIds);
        setWishlist(productsDetails.filter(p => p !== null) as Product[]);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error fetching or populating wishlist:", error);
      toast({ title: "Error", description: "Could not load your wishlist.", variant: "destructive" });
      setWishlist([]);
      setDbWishlistProductIds([]);
    } finally {
      setLoadingWishlist(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchAndPopulateWishlist(currentUser.uid);
    } else if (!authLoading && !currentUser) {
      clearWishlistLocal();
      setLoadingWishlist(false);
    }
  }, [currentUser, authLoading, fetchAndPopulateWishlist, clearWishlistLocal]);


  const checkAuthAndPrompt = () => {
    if (authLoading) {
      toast({ title: "Please wait", description: "Authenticating..." });
      return false;
    }
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your wishlist.",
        variant: "destructive",
        action: (
          <button onClick={() => router.push('/login?redirect=/wishlist')} className="ml-auto rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent">
            Login
          </button>
        ),
      });
      return false;
    }
    return true;
  };

  const addToWishlist = async (product: Product) => {
    if (!checkAuthAndPrompt() || !currentUser) return;
    if (dbWishlistProductIds.includes(product.id)) return; // Already in wishlist

    await addProductToWishlistInDb(currentUser.uid, product.id);
    // Optimistically update UI, then refetch
    setDbWishlistProductIds(prev => [...prev, product.id]);
    setWishlist(prev => [...prev, product]); // Add full product for immediate display
    await fetchAndPopulateWishlist(currentUser.uid); // Re-fetch for consistency
  };

  const removeFromWishlist = async (productId: string) => {
    if (!checkAuthAndPrompt() || !currentUser) return;
    await removeProductFromWishlistInDb(currentUser.uid, productId);
    // Optimistically update UI, then refetch
    setDbWishlistProductIds(prev => prev.filter(id => id !== productId));
    setWishlist(prev => prev.filter(p => p.id !== productId));
    await fetchAndPopulateWishlist(currentUser.uid); // Re-fetch for consistency
  };

  const isInWishlist = (productId: string) => {
    return dbWishlistProductIds.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loadingWishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlistLocal }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
