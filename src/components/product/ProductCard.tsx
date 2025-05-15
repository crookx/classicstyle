
'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleWishlistToggle = () => {
    if (authLoading) return; // Do nothing if auth state is loading
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your wishlist.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=${router.asPath}`);
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({ title: `${product.name} removed from wishlist.` });
    } else {
      addToWishlist(product);
      toast({ title: `${product.name} added to wishlist.` });
    }
  };

  const handleAddToCart = () => {
    if (authLoading) return; // Do nothing if auth state is loading
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=${router.asPath}`);
      return;
    }
    addToCart(product);
    toast({ title: `${product.name} added to cart.` });
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full group">
      <Link href={`/products/${product.id}`} className="block">
        <CardHeader className="p-0 relative">
          <div className="aspect-[3/4] overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={800}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-serif font-medium leading-tight mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        {product.category && <p className="text-xs text-muted-foreground mb-2">{product.category}</p>}
        <p className="text-base font-semibold text-foreground">
          ${product.price.toFixed(2)}
          {product.originalPrice && (
            <span className="ml-2 text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handleWishlistToggle}
          className={`hover:bg-accent/80 ${isInWishlist(product.id) ? 'text-destructive border-destructive hover:text-destructive' : 'text-muted-foreground'}`}
          aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          disabled={authLoading}
        >
          <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
        <Button onClick={handleAddToCart} variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors" disabled={authLoading}>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
