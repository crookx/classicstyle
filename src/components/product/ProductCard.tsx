
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
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter(); 

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (authLoading) return;
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your wishlist.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=${window.location.pathname}`); 
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (authLoading) return;
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=${window.location.pathname}`); 
      return;
    }
    addToCart(product);
    toast({ title: `${product.name} added to cart.` });
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full group">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block aspect-[4/5] overflow-hidden group">
          <Image
            src={product.imageUrl || 'https://placehold.co/600x750.png'}
            alt={product.name}
            width={600}
            height={750} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.dataAiHint || product.category || 'product image'}
          />
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              className={cn(
                "bg-background/80 hover:bg-background text-muted-foreground rounded-full shadow-md",
                isInWishlist(product.id) ? 'text-destructive border-destructive hover:text-destructive' : 'hover:text-primary'
              )}
              aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              disabled={authLoading}
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleAddToCart} 
              className="bg-background/80 hover:bg-background text-muted-foreground hover:text-primary rounded-full shadow-md"
              disabled={authLoading}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-serif font-medium leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </CardTitle>
        </Link>
        {product.category && <p className="text-xs text-muted-foreground mb-2">{product.category}{product.subCategory ? ` - ${product.subCategory}` : ''}</p>}
        <p className="text-base font-semibold text-foreground">
          KSh {product.price.toFixed(2)}
          {product.originalPrice && (
            <span className="ml-2 text-sm text-muted-foreground line-through">KSh {product.originalPrice.toFixed(2)}</span>
            )}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Link href={`/products/${product.id}`}>View Details</Link>
         </Button>
      </CardFooter>
    </Card>
  );
}
