'use client';
import type { Product } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'classicstyle_wishlist';

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      if (!prevWishlist.find(item => item.id === product.id)) {
        return [...prevWishlist, product];
      }
      return prevWishlist;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prevWishlist) => prevWishlist.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
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
