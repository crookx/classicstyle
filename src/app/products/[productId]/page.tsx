'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { mockProducts, mockCollections } from '@/data/mock-data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import ProductGrid from '@/components/product/ProductGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedColor(foundProduct.colors?.[0]?.name);
      setSelectedSize(foundProduct.sizes?.[0]);

      // Find related products (e.g., same category, excluding current product)
      const related = mockProducts.filter(
        p => p.category === foundProduct.category && p.id !== foundProduct.id
      ).slice(0, 4);
      setRelatedProducts(related);
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Loading product details...</h1>
      </div>
    );
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({ title: `${product.name} removed from wishlist.` });
    } else {
      addToWishlist(product);
      toast({ title: `${product.name} added to wishlist.` });
    }
  };

  const handleAddToCart = () => {
    addToCart(product); // Add quantity selection later if needed
    toast({ title: `${product.name} added to cart.` });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Product Image Gallery */}
        <div className="shadow-xl rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={1000}
            className="w-full h-auto object-cover"
            data-ai-hint={product.dataAiHint}
            priority
          />
          {/* Add more images or a carousel here if available */}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold font-serif">{product.name}</h1>
          
          {product.rating && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating!) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
          )}

          <p className="text-3xl font-semibold text-primary">
            ${product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="ml-3 text-xl text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </p>
          
          <p className="text-base text-foreground/80 leading-relaxed">{product.description}</p>

          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Color: <span className="font-semibold">{selectedColor}</span></h3>
              <div className="flex space-x-2">
                {product.colors.map(color => (
                  <Button
                    key={color.name}
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 rounded-full border-2 ${selectedColor === color.name ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                    aria-label={`Select color ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Size: <span className="font-semibold">{selectedSize}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="px-4"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Separator />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-primary hover:bg-primary/90">
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlistToggle}
              className={`flex-1 ${isInWishlist(product.id) ? 'text-destructive border-destructive hover:text-destructive' : ''}`}
            >
              <Heart className={`mr-2 h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} /> 
              {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-medium">Product Details</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                  {product.details?.map((detail, index) => <li key={index}>{detail}</li>)}
                  {product.sku && <li>SKU: {product.sku}</li>}
                  {product.category && <li>Category: {product.category}</li>}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-medium">Shipping &amp; Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-foreground/80 space-y-2">
                <p><ShieldCheck className="inline-block mr-2 h-5 w-5 text-green-600" />Free shipping on orders over $100.</p>
                <p><CheckCircle className="inline-block mr-2 h-5 w-5 text-green-600" />Easy 30-day returns.</p>
                <p>Read our full <a href="/shipping-returns" className="underline text-primary hover:opacity-80">shipping and returns policy</a>.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </div>
      
      <Tabs defaultValue="description" className="w-full mt-16">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="description">Full Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount || 0})</TabsTrigger>
          <TabsTrigger value="care">Care Instructions</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="prose max-w-none text-foreground/80 p-4 bg-card rounded-lg shadow">
          <p>{product.description}</p>
          {product.details && (
            <>
              <h4 className="font-serif mt-4">Key Features:</h4>
              <ul>
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="p-4 bg-card rounded-lg shadow">
          <p className="text-muted-foreground">Customer reviews will be displayed here.</p>
          {/* Placeholder for reviews component */}
        </TabsContent>
        <TabsContent value="care" className="p-4 bg-card rounded-lg shadow">
          <p className="text-muted-foreground">Care instructions for this product will be displayed here. Typically: {product.details?.find(d => d.toLowerCase().includes('clean') || d.toLowerCase().includes('wash')) || 'Follow label instructions.'}</p>
        </TabsContent>
      </Tabs>


      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-center">You Might Also Like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
