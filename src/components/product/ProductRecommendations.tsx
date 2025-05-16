
'use client';
import { useEffect, useState } from 'react';
import { getPersonalizedRecommendations, type PersonalizedRecommendationsInput } from '@/ai/flows/product-recommendations';
import { getProductsByIds } from '@/lib/firebase/firestoreService'; // Fetch from Firestore
import type { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for recommendation engine input (replace with dynamic user data)
const MOCK_USER_ID = 'user123'; 
const MOCK_BROWSING_HISTORY = ['mens-chinos-slimfit-005', 'womens-blouse-silk-018']; // Use new product IDs
const MOCK_PURCHASE_HISTORY = ['womens-handbag-statement-031'];
const MOCK_WISHLIST = ['mens-sneakers-breathable-013'];

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
          numRecommendations: 6,
        };
        const result = await getPersonalizedRecommendations(input);
        
        let recommendedProducts: Product[] = [];
        if (result.productIds && result.productIds.length > 0) {
          recommendedProducts = await getProductsByIds(result.productIds);
        }
        
        // Fallback logic if AI or DB provides fewer than numRecommendations
        if (recommendedProducts.length < input.numRecommendations!) {
            const fallbackNeeded = input.numRecommendations! - recommendedProducts.length;
            // Fetch some random/popular products as fallback
            // For simplicity, fetching first few products, ideally this would be more sophisticated
            const fallbackProducts = await getProductsByIds(['mens-polo-classic-001', 'womens-maxi-dress-floral-017', 'kids-graphictee-unisex-035', 'mens-sneakers-breathable-013'].slice(0, fallbackNeeded));
            
            const existingIds = new Set(recommendedProducts.map(p => p.id));
            fallbackProducts.forEach(fp => {
                if (!existingIds.has(fp.id)) {
                    recommendedProducts.push(fp);
                }
            });
        }
        
        setRecommendations(recommendedProducts.slice(0, input.numRecommendations));

      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
        setError("Could not load recommendations at this time.");
        // Fallback to a few known products if everything fails
        const fallbackIds = ['mens-polo-classic-001', 'womens-maxi-dress-floral-017', 'kids-graphictee-unisex-035', 'mens-sneakers-breathable-013', 'womens-blazer-tailored-020', 'mens-chinos-slimfit-005'];
        const fallbackProducts = await getProductsByIds(fallbackIds.slice(0,6));
        setRecommendations(fallbackProducts);
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
                <Skeleton className="aspect-[4/5] w-full rounded-md mb-4" /> {/* Adjusted aspect ratio */}
                <Skeleton className="h-5 w-3/4 mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 mb-4 rounded" />
                <Skeleton className="h-10 w-full rounded" /> {/* Placeholder for button */}
              </div>
            ))}
          </div>
        </CardContent>
      </section>
    );
  }
  
  if (recommendations.length === 0 && !error && !loading) {
      return (
        <section className="py-12 bg-muted/30 rounded-xl my-12">
         <CardHeader>
            <CardTitle className="text-3xl font-serif text-center mb-4">Discover More</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Explore our latest arrivals to find something you'll love.</p>
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
