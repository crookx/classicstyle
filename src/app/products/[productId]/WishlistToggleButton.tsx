
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface WishlistToggleButtonProps {
  product: Product;
}

export default function WishlistToggleButton({ product }: WishlistToggleButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const isProductInWishlist = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (authLoading) return;
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your wishlist.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    if (isProductInWishlist) {
      removeFromWishlist(product.id);
      toast({ title: `${product.name} removed from wishlist.` });
    } else {
      addToWishlist(product);
      toast({ title: `${product.name} added to wishlist.` });
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleWishlistToggle}
      className={cn(
        'flex-1',
        isProductInWishlist ? 'text-destructive border-destructive hover:text-destructive hover:bg-destructive/10' : ''
      )}
      disabled={authLoading}
    >
      <Heart className={cn('mr-2 h-5 w-5', isProductInWishlist ? 'fill-current' : '')} />
      {isProductInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}
