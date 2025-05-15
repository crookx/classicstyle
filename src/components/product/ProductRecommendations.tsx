'use client';
import { useEffect, useState } from 'react';
import { getPersonalizedRecommendations, type PersonalizedRecommendationsInput } from '@/ai/flows/product-recommendations';
import type { Product } from '@/types';
import { mockProducts } from '@/data/mock-data';
import ProductCard from '@/components/product/ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MOCK_USER_ID = 'user123';
const MOCK_BROWSING_HISTORY = ['classic-blouse-001', 'silk-scarf-005'];
const MOCK_PURCHASE_HISTORY = ['leather-tote-004'];
const MOCK_WISHLIST = ['cashmere-sweater-003'];

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
          numRecommendations: 4,
        };
        const result = await getPersonalizedRecommendations(input);
        
        let recommendedProducts = result.productIds
          .map(id => mockProducts.find(p => p.id === id))
          .filter(p => p !== undefined) as Product[];
        
        if (recommendedProducts.length < input.numRecommendations) {
            const existingIds = new Set(recommendedProducts.map(p => p.id));
            const fallbackNeeded = input.numRecommendations! - recommendedProducts.length;
            const fallbacks = mockProducts
                .filter(p => !existingIds.has(p.id) && p.id !== 'product-to-exclude') // Example of excluding a specific product
                .sort(() => 0.5 - Math.random()) // Shuffle for variety
                .slice(0, fallbackNeeded);
            recommendedProducts.push(...fallbacks);
        }
        
        setRecommendations(recommendedProducts.slice(0, input.numRecommendations));

      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
        setError("Could not load recommendations at this time.");
        // Fallback to some generic products if AI fails
        setRecommendations(mockProducts.sort(() => 0.5 - Math.random()).slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-muted/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-serif text-center mb-8">Just For You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-lg shadow-md">
                <Skeleton className="aspect-[3/4] w-full rounded-md mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </section>
    );
  }
  
  if (recommendations.length === 0 && !error) {
      // If AI returns nothing and there's no error, maybe show generic popular items or nothing
      return (
        <section className="py-12 bg-muted/30 rounded-xl">
         <CardHeader>
            <CardTitle className="text-3xl font-serif text-center mb-8">Discover More</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Explore our latest arrivals.</p>
            {/* Optionally show some generic products here */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </section>
  );
}
