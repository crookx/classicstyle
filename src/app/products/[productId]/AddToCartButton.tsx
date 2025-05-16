
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
  const { addToCart, loadingCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (authLoading) return;
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart.',
        variant: 'destructive',
        action: (
          <button onClick={() => router.push(`/login?redirect=/products/${product.id}`)} className="ml-auto rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent">
            Login
          </button>
        )
      });
      return;
    }
    if (product.stock <= 0) {
        toast({ title: "Out of Stock", description: `${product.name} is currently out of stock.`, variant: "destructive" });
        return;
    }
    try {
      await addToCart(product);
      toast({ title: `${product.name} added to cart.` });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({ title: "Error", description: `Could not add ${product.name} to cart.`, variant: "destructive" });
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleAddToCart}
      className="flex-1 bg-primary hover:bg-primary/90"
      disabled={authLoading || loadingCart || product.stock === 0}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
