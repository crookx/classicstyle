
'use client';
import { useEffect, useState } from 'react';
import { getPersonalizedRecommendations, type PersonalizedRecommendationsInput } from '@/ai/flows/product-recommendations';
import type { Product } from '@/types';
import { mockProducts } from '@/data/mock-data';
import ProductCard from '@/components/product/ProductCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed Card itself as we're using its parts
import { Skeleton } from '@/components/ui/skeleton';

const MOCK_USER_ID = 'user123'; // This would ideally come from useAuth() if recommendations are user-specific and logged in
const MOCK_BROWSING_HISTORY = ['mens-chinos-classic-002', 'womens-blouse-silk-002'];
const MOCK_PURCHASE_HISTORY = ['accs-handbag-leather-001'];
const MOCK_WISHLIST = ['mens-jeans-slim-001'];

export default function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const input: PersonalizedRecommendationsInput = {
          userId: MOCK_USER_ID,
          browsingHistory: MOCK_BROWSING_HISTORY,
          purchaseHistory: MOCK_PURCHASE_HISTORY,
          wishlist: MOCK_WISHLIST,
          numRecommendations: 6, // Fetch more to allow for scrolling
        };
        const result = await getPersonalizedRecommendations(input);
        
        let recommendedProducts = result.productIds
          .map(id => mockProducts.find(p => p.id === id))
          .filter(p => p !== undefined) as Product[];
        
        // Fallback logic if AI provides fewer than numRecommendations
        if (recommendedProducts.length < input.numRecommendations!) {
            const existingIds = new Set(recommendedProducts.map(p => p.id));
            const fallbackNeeded = input.numRecommendations! - recommendedProducts.length;
            const fallbacks = mockProducts
                .filter(p => !existingIds.has(p.id)) 
                .sort(() => 0.5 - Math.random()) 
                .slice(0, fallbackNeeded);
            recommendedProducts.push(...fallbacks);
        }
        
        setRecommendations(recommendedProducts.slice(0, input.numRecommendations));

      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
        setError("Could not load recommendations at this time.");
        setRecommendations(mockProducts.sort(() => 0.5 - Math.random()).slice(0, 6)); // Fallback to 6 random products
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-background rounded-xl shadow-xl my-12">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-serif text-center text-secondary">
            Just For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] w-72 flex-shrink-0 bg-card p-4 rounded-lg shadow-md">
                <Skeleton className="aspect-[3/4] w-full rounded-md mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 mb-4 rounded" />
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </section>
    );
  }
  
  if (recommendations.length === 0 && !error) {
      return (
        <section className="py-12 bg-muted/30 rounded-xl my-12">
         <CardHeader>
            <CardTitle className="text-3xl font-serif text-center mb-4">Discover More</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Explore our latest arrivals.</p>
          </CardContent>
        </section>
      );
  }

  return (
    <section className="py-12 bg-background rounded-xl shadow-xl my-12">
      <CardHeader className="pb-8">
        <CardTitle className="text-3xl font-serif text-center text-secondary">
          {error ? "Our Top Picks For You" : "Just For You"}
        </CardTitle>
        {error && <p className="text-center text-destructive mt-2">{error}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4">
          {recommendations.map(product => (
            <div key={product.id} className="min-w-[280px] w-72 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </CardContent>
    </section>
  );
}
