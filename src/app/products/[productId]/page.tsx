
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ProductGrid from '@/components/product/ProductGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProductById, getProductsByCategoryId } from '@/lib/firebase/firestoreService';
import type { Product } from '@/types';
import AddToCartButton from './AddToCartButton'; 
import WishlistToggleButton from './WishlistToggleButton'; 
import { notFound } from 'next/navigation';

interface ProductDetailPageProps {
  params: { productId: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const productId = params.productId;
  const product = await getProductById(productId);

  if (!product) {
    notFound(); 
  }

  const relatedProducts = product.category 
    ? await getProductsByCategoryId(product.category, product.id, 4) 
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="shadow-xl rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl || 'https://placehold.co/800x1000.png'}
            alt={product.name}
            width={800}
            height={1000}
            className="w-full h-auto object-cover"
            data-ai-hint={product.dataAiHint || product.name}
            priority
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold font-serif">{product.name}</h1>
          
          {product.rating && typeof product.rating === 'number' && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating!) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              ))}
              {product.reviewCount && <span className="ml-2 text-sm text-muted-foreground">({product.reviewCount} reviews)</span>}
            </div>
          )}

          <p className="text-3xl font-semibold text-primary">
            KSh {product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="ml-3 text-xl text-muted-foreground line-through">KSh {product.originalPrice.toFixed(2)}</span>
            )}
          </p>
          
          <p className="text-base text-foreground/80 leading-relaxed">{product.description}</p>

          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Available Colors:</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <span key={color.name} className="p-1 px-2 text-xs border rounded-full" style={{ backgroundColor: color.hex, color: '#000' }}>
                    {color.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Available Sizes:</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <span key={size} className="p-1 px-3 text-xs border rounded-md bg-muted">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <Separator />

          <div className="flex flex-col sm:flex-row gap-4">
            <AddToCartButton product={product} />
            <WishlistToggleButton product={product} />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-medium">Product Details</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                  {product.details?.map((detail, index) => <li key={index}>{detail}</li>)}
                  {product.sku && <li>SKU: {product.sku}</li>}
                  {product.category && <li>Category: {product.category}</li>}
                  {product.subCategory && <li>Sub-Category: {product.subCategory}</li>}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-medium">Shipping &amp; Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-foreground/80 space-y-2">
                <p><ShieldCheck className="inline-block mr-2 h-5 w-5 text-green-600" />Free shipping on orders over KSh 10,000.</p>
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
          {product.details && product.details.length > 0 && (
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
          <p className="text-muted-foreground">Customer reviews will be displayed here. (Coming Soon)</p>
        </TabsContent>
        <TabsContent value="care" className="p-4 bg-card rounded-lg shadow">
          <p className="text-muted-foreground">Care instructions for this product will be displayed here. Typically: {product.details?.find(d => d.toLowerCase().includes('clean') || d.toLowerCase().includes('wash')) || 'Follow label instructions.'}</p>
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-center">You Might Also Like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
