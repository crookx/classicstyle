'use client';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeartCrack } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">Your Wishlist</h1>
        <p className="text-lg text-muted-foreground">Items you love, all in one place.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
          <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-3">Your wishlist is empty.</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your wishlist yet.
          </p>
          <Link href="/products">
            <Button size="lg">Start Exploring Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
