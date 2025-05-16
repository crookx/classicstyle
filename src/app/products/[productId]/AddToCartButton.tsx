
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleAddToCart = () => {
    if (authLoading) return;
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }
    addToCart(product);
    toast({ title: `${product.name} added to cart.` });
  };

  return (
    <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-primary hover:bg-primary/90" disabled={authLoading}>
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}
