
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Card components are not directly used here for sections, but ProductCard and CollectionCard use them.
import ProductCard from '@/components/product/ProductCard';
import CollectionCard from '@/components/collections/CollectionCard';
import ProductRecommendations from '@/components/product/ProductRecommendations'; // This will also need to fetch from Firestore
import { getFeaturedProducts, getCollections } from '@/lib/firebase/firestoreService';
import type { Product, Collection } from '@/types';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  // Fetch data from Firestore
  const featuredProducts: Product[] = await getFeaturedProducts(6);
  const displayedCollections: Collection[] = await getCollections(3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[700px] rounded-xl overflow-hidden shadow-2xl">
        <Image
          src="https://placehold.co/1600x900.png" // Replace with a relevant hero image
          alt="Elegant fashion model"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1500px"
          style={{objectFit: "cover"}}
          className="brightness-75"
          data-ai-hint="fashion model editorial"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8 bg-black/40">
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-4 !text-white">
            Timeless Elegance
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 !text-white/90">
            Discover curated collections that embody sophistication and classic style.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-md">
              Shop New Arrivals
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif font-semibold">Featured Products</h2>
          <Link href="/products?sort=featured">
            <Button variant="outline" className="group whitespace-nowrap">
                View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-[280px] w-72 sm:w-80 flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No featured products available at the moment. Check back soon!</p>
        )}
      </section>

      {/* Themed Collections Section */}
      <section className="bg-muted/40 py-12 rounded-xl">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8 px-4 sm:px-0">
            <h2 className="text-3xl font-serif font-semibold">Shop by Collection</h2>
            <Link href="/collections">
                <Button variant="outline" className="group whitespace-nowrap">
                    Explore All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
          </div>
          {displayedCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayedCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-8">No collections available at the moment.</p>
          )}
        </div>
      </section>

      {/* Smart Product Recommendations Section */}
      <ProductRecommendations />

      {/* Call to Action / Values Section */}
      <section className="py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-gem"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M12 22V9"/><path d="M2 9h20"/></svg>
            <h3 className="text-xl font-serif font-semibold mb-2">Quality Craftsmanship</h3>
            <p className="text-muted-foreground">Each piece is curated for its exceptional quality and timeless design.</p>
          </div>
          <div className="p-6 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10zM2 13a10 10 0 0 1 10-10h1v1a7 7 0 0 0-7 7h-1z"/><path d="M12 22a10 10 0 0 0 10-10h-1a7 7 0 0 1-7 7v1z"/><path d="M22 12a10 10 0 0 1-10 10V11a7 7 0 0 0 7-7h1z"/></svg>
            <h3 className="text-xl font-serif font-semibold mb-2">Sustainable Choices</h3>
            <p className="text-muted-foreground">Committed to responsible sourcing and ethical practices.</p>
          </div>
          <div className="p-6 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-truck"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/></svg>
            <h3 className="text-xl font-serif font-semibold mb-2">Seamless Experience</h3>
            <p className="text-muted-foreground">Enjoy easy browsing, secure checkout, and attentive customer service.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
